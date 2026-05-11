"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourierSchedulePersist } from "./courierScheduleTypes";
import { COURIER_SCHEDULE_PERSIST_KEY } from "./courierScheduleTypes";

const SESSION_KEY = "jet-meal-courier-session.v1";
const OPERATIONAL_KEY = "jet-meal-courier-operational.v1";

const PRE_SHIFT_MS = 15 * 60 * 1000;
const WORK_BEFORE_LUNCH_MS = 2 * 60 * 60 * 1000;
const LUNCH_MS = 60 * 60 * 1000;

export type CourierSessionPersist = {
  /** YYYY-MM-DD (локальная дата) — смена и обед привязаны к календарному дню */
  calendarDay?: string;
  shiftStartedAt: string | null;
  lunchStartedAt: string | null;
};

export type CourierOperationalStatus = "searching" | "on_order";

export type CourierOperationalPersist = {
  status: CourierOperationalStatus;
  updatedAt: string;
};

export type CourierUiPhase =
  | "off_day"
  | "pre_shift"
  | "await_start"
  | "active"
  | "lunch"
  | "after_work";

export type CourierDerivedUi = {
  phase: CourierUiPhase;
  shiftStatusLabel: string;
  showStartShift: boolean;
  showLunch: boolean;
  ordersFrozen: boolean;
  operationalStatus: CourierOperationalStatus | null;
  workDayStartMs: number | null;
  workDayEndMs: number | null;
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, v: unknown) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(v));
}

function defaultSchedule(): CourierSchedulePersist {
  return {
    template: "5x8",
    ranges: [
      { from: 9, to: 17 },
      { from: 9, to: 17 },
      { from: 9, to: 17 },
      { from: 9, to: 17 },
      { from: 9, to: 17 },
      null,
      null,
    ],
  };
}

export function readCourierSchedulePersist(): CourierSchedulePersist {
  return readJson<CourierSchedulePersist>(COURIER_SCHEDULE_PERSIST_KEY) ?? defaultSchedule();
}

export function readCourierSession(): CourierSessionPersist {
  return (
    readJson<CourierSessionPersist>(SESSION_KEY) ?? {
      shiftStartedAt: null,
      lunchStartedAt: null,
    }
  );
}

function todayCalendarKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Сбрасывает смену при смене календарного дня. */
export function readCourierSessionForToday(): CourierSessionPersist {
  const raw = readCourierSession();
  const day = todayCalendarKey();
  if (raw.calendarDay === day) {
    return raw;
  }
  const next: CourierSessionPersist = {
    calendarDay: day,
    shiftStartedAt: null,
    lunchStartedAt: null,
  };
  writeCourierSession(next);
  return next;
}

export function writeCourierSession(next: CourierSessionPersist) {
  writeJson(SESSION_KEY, next);
}

export function readCourierOperational(): CourierOperationalPersist {
  return (
    readJson<CourierOperationalPersist>(OPERATIONAL_KEY) ?? {
      status: "searching",
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export function writeCourierOperational(next: CourierOperationalPersist) {
  writeJson(OPERATIONAL_KEY, next);
}

function mondayIndexFromDate(d: Date): number {
  const js = d.getDay();
  return (js + 6) % 7;
}

function dayStartMs(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function rangeToWindowMs(
  dayStart: number,
  r: { from: number; to: number },
): { start: number; end: number } {
  const start = dayStart + r.from * 60 * 60 * 1000;
  const end = dayStart + (r.to + 1) * 60 * 60 * 1000;
  return { start, end };
}

export function deriveCourierUi(
  nowMs: number,
  schedule: CourierSchedulePersist,
  session: CourierSessionPersist,
): CourierDerivedUi {
  const now = new Date(nowMs);
  const idx = mondayIndexFromDate(now);
  const r = schedule.ranges[idx] ?? null;
  const day0 = dayStartMs(now);

  if (!r) {
    return {
      phase: "off_day",
      shiftStatusLabel: "Нерабочее время",
      showStartShift: false,
      showLunch: false,
      ordersFrozen: false,
      operationalStatus: null,
      workDayStartMs: null,
      workDayEndMs: null,
    };
  }

  const { start: workStart, end: workEnd } = rangeToWindowMs(day0, r);
  const preShiftFrom = workStart - PRE_SHIFT_MS;

  if (nowMs >= workEnd) {
    return {
      phase: "after_work",
      shiftStatusLabel: "Нерабочее время",
      showStartShift: false,
      showLunch: false,
      ordersFrozen: false,
      operationalStatus: null,
      workDayStartMs: workStart,
      workDayEndMs: workEnd,
    };
  }

  const shiftStarted = session.shiftStartedAt
    ? Date.parse(session.shiftStartedAt)
    : NaN;
  const lunchStarted = session.lunchStartedAt
    ? Date.parse(session.lunchStartedAt)
    : NaN;

  const hasShift = Number.isFinite(shiftStarted);
  const hasLunch = Number.isFinite(lunchStarted);

  if (!hasShift) {
    if (nowMs < preShiftFrom) {
      return {
        phase: "await_start",
        shiftStatusLabel: "Нерабочее время",
        showStartShift: false,
        showLunch: false,
        ordersFrozen: false,
        operationalStatus: null,
        workDayStartMs: workStart,
        workDayEndMs: workEnd,
      };
    }
    if (nowMs < workStart) {
      return {
        phase: "pre_shift",
        shiftStatusLabel: "Нерабочее время",
        showStartShift: true,
        showLunch: false,
        ordersFrozen: false,
        operationalStatus: null,
        workDayStartMs: workStart,
        workDayEndMs: workEnd,
      };
    }
    return {
      phase: "await_start",
      shiftStatusLabel: "Нерабочее время",
      showStartShift: true,
      showLunch: false,
      ordersFrozen: false,
      operationalStatus: null,
      workDayStartMs: workStart,
      workDayEndMs: workEnd,
    };
  }

  const lunchEndedAt = hasLunch ? lunchStarted + LUNCH_MS : NaN;
  const afterLunch = !hasLunch || nowMs >= lunchEndedAt;
  const lunchEligibleAt = shiftStarted + WORK_BEFORE_LUNCH_MS;
  const showLunch =
    hasShift &&
    afterLunch &&
    !hasLunch &&
    nowMs >= lunchEligibleAt &&
    nowMs < workEnd;

  if (hasShift && nowMs < workEnd) {
    const inLunchBlock =
      hasLunch &&
      nowMs >= lunchStarted &&
      nowMs < lunchStarted + LUNCH_MS;
    const op = inLunchBlock ? null : readCourierOperational().status;
    return {
      phase: inLunchBlock ? "lunch" : "active",
      shiftStatusLabel: inLunchBlock ? "Обед" : "На линии",
      showStartShift: false,
      showLunch,
      ordersFrozen: inLunchBlock,
      operationalStatus: op,
      workDayStartMs: workStart,
      workDayEndMs: workEnd,
    };
  }

  return {
    phase: "after_work",
    shiftStatusLabel: "Нерабочее время",
    showStartShift: false,
    showLunch: false,
    ordersFrozen: false,
    operationalStatus: null,
    workDayStartMs: workStart,
    workDayEndMs: workEnd,
  };
}

export function operationalStatusLabel(s: CourierOperationalStatus): string {
  return s === "searching" ? "В поиске заказов" : "На заказе";
}

export function operationalTagColor(
  s: CourierOperationalStatus,
): "processing" | "success" {
  return s === "searching" ? "processing" : "success";
}

export function tickCourierOperationalMock(active: boolean) {
  if (!active || typeof window === "undefined") {
    return;
  }
  const cur = readCourierOperational();
  const next: CourierOperationalStatus =
    cur.status === "searching" ? "on_order" : "searching";
  writeCourierOperational({
    status: next,
    updatedAt: new Date().toISOString(),
  });
}

let notifiedPreShift = "";
let notifiedLunchBtn = "";

export function pushCourierNotify(title: string, body: string, tag: string) {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification(title, { body, tag });
  } catch {
    /* ignore */
  }
}

export function courierNotifyShiftEvents(ui: CourierDerivedUi, dayKey: string) {
  if (typeof window === "undefined") {
    return;
  }
  const stored = window.sessionStorage.getItem("courier-notify-day");
  if (stored !== dayKey) {
    window.sessionStorage.setItem("courier-notify-day", dayKey);
    notifiedPreShift = "";
    notifiedLunchBtn = "";
  }
  if (ui.showStartShift && notifiedPreShift !== dayKey) {
    notifiedPreShift = dayKey;
    pushCourierNotify(
      "Смена скоро начнётся",
      "Можно приступить к работе в кабинете курьера.",
      "courier-pre-shift",
    );
  }
  if (ui.showLunch && notifiedLunchBtn !== dayKey) {
    notifiedLunchBtn = dayKey;
    pushCourierNotify(
      "Перерыв на обед",
      "Доступна кнопка «Обед» — заказы на час будут скрыты.",
      "courier-lunch-offer",
    );
  }
}

export async function ensureCourierNotificationPermission(): Promise<
  "granted" | "denied" | "default"
> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  if (Notification.permission !== "denied") {
    return Notification.requestPermission();
  }
  return "denied";
}

export function useCourierShiftRuntime() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const schedule = useMemo(() => readCourierSchedulePersist(), [tick]);
  const session = useMemo(() => readCourierSessionForToday(), [tick]);

  const ui = useMemo(() => {
    const now = Date.now();
    return deriveCourierUi(now, schedule, session);
  }, [schedule, session, tick]);

  useEffect(() => {
    const dayKey = new Date().toDateString();
    courierNotifyShiftEvents(ui, dayKey);
  }, [ui]);

  useEffect(() => {
    if (ui.phase !== "active" || ui.ordersFrozen) {
      return undefined;
    }
    const id = window.setInterval(() => {
      tickCourierOperationalMock(true);
      setTick((x) => x + 1);
    }, 90_000);
    return () => window.clearInterval(id);
  }, [ui.phase, ui.ordersFrozen]);

  const startShift = useCallback(() => {
    const day = todayCalendarKey();
    writeCourierSession({
      calendarDay: day,
      shiftStartedAt: new Date().toISOString(),
      lunchStartedAt: null,
    });
    tickCourierOperationalMock(true);
    setTick((x) => x + 1);
    pushCourierNotify(
      "Вы на линии",
      "Смена начата.",
      "courier-started",
    );
  }, []);

  const startLunch = useCallback(() => {
    const cur = readCourierSessionForToday();
    writeCourierSession({
      ...cur,
      lunchStartedAt: new Date().toISOString(),
    });
    setTick((x) => x + 1);
    pushCourierNotify("Обед", "Заказы скрыты на час.", "courier-lunch");
  }, []);

  const refresh = useCallback(() => setTick((x) => x + 1), []);

  return { ui, schedule, session, startShift, startLunch, refresh };
}
