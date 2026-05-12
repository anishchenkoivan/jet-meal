"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { useEffect, useMemo, useState } from "react";
import type {
  CourierSchedulePersist,
  CourierScheduleTemplate,
  DayRange,
} from "../../lib/courierScheduleTypes";
import { COURIER_SCHEDULE_PERSIST_KEY } from "../../lib/courierScheduleTypes";
import { readCourierSchedulePersist } from "../../lib/courierShiftRuntime";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

const HOURS = Array.from({ length: 18 }, (_, i) => 6 + i);

type Template = CourierScheduleTemplate;

export type { DayRange };

const RATE: Record<Template, number> = {
  "4x8": 320,
  "5x8": 300,
  "7x5": 280,
  free: 340,
};

const REQUIRED_DAYS: Record<Template, number | null> = {
  "4x8": 4,
  "5x8": 5,
  "7x5": 7,
  free: null,
};

const FIRST_H = 6;
const LAST_H = 23;

function hoursInRange(r: DayRange): number {
  if (!r) {
    return 0;
  }
  return r.to - r.from + 1;
}

function blockLengthForClick(template: Template): number {
  if (template === "7x5") {
    return 5;
  }
  if (template === "free") {
    return 8;
  }
  return 8;
}

function requiredBlockHours(template: Template): number | null {
  if (template === "7x5") {
    return 5;
  }
  if (template === "free") {
    return null;
  }
  return 8;
}

function rangeFromClickDown(clickHour: number, template: Template): DayRange {
  const k = blockLengthForClick(template);
  let to = Math.min(clickHour + k - 1, LAST_H);
  let from = clickHour;
  if (to - from + 1 < k) {
    from = Math.max(FIRST_H, LAST_H - k + 1);
    to = LAST_H;
  }
  return { from, to };
}

function defaultRanges(template: Template): DayRange[] {
  if (template === "4x8") {
    return [
      { from: 9, to: 16 },
      { from: 9, to: 16 },
      { from: 9, to: 16 },
      { from: 9, to: 16 },
      null,
      null,
      null,
    ];
  }
  if (template === "5x8") {
    return [
      { from: 9, to: 17 },
      { from: 9, to: 17 },
      { from: 9, to: 17 },
      { from: 9, to: 17 },
      { from: 9, to: 17 },
      null,
      null,
    ];
  }
  if (template === "7x5") {
    return Array.from({ length: 7 }, () => ({ from: 7, to: 11 }) as DayRange);
  }
  return Array.from({ length: 7 }, () => null);
}

function formatDaySummary(dayLabel: string, r: DayRange): string | null {
  if (!r) {
    return null;
  }
  return `${dayLabel}: ${r.from}:00–${r.to}:00 (${hoursInRange(r)} ч)`;
}

const FORMAT_ERROR = "Выбранное время не соответствует формату работы.";

export type CourierScheduleEditorProps = {
  onCancel: () => void;
  onSave: (summary: string, persist: CourierSchedulePersist) => void;
};

export function CourierScheduleEditor({
  onCancel,
  onSave,
}: CourierScheduleEditorProps) {
  const [template, setTemplate] = useState<Template>("5x8");
  const [ranges, setRanges] = useState<DayRange[]>(() => defaultRanges("5x8"));

  useEffect(() => {
    const p = readCourierSchedulePersist();
    setTemplate(p.template);
    if (Array.isArray(p.ranges) && p.ranges.length === 7) {
      setRanges(p.ranges);
    } else {
      setRanges(defaultRanges(p.template));
    }
  }, []);

  const rateLabel = useMemo(() => {
    const r = RATE[template];
    return `Предлагаемая ставка: от ${r} ₽ / ч (до налогов)`;
  }, [template]);

  const applyPreset = (next: Template) => {
    setTemplate(next);
    setRanges(defaultRanges(next));
  };

  const clearDay = (dayIndex: number) => {
    setRanges((prev) => {
      const n = [...prev];
      n[dayIndex] = null;
      return n;
    });
  };

  const onBrickClick = (dayIndex: number, hour: number) => {
    const cur = ranges[dayIndex];
    if (cur !== null && hour >= cur.from && hour <= cur.to) {
      clearDay(dayIndex);
      return;
    }
    const next = rangeFromClickDown(hour, template);
    setRanges((prev) => {
      const n = [...prev];
      n[dayIndex] = next;
      return n;
    });
  };

  const handleSave = () => {
    const needDays = REQUIRED_DAYS[template];
    const block = requiredBlockHours(template);
    const working = ranges.filter((r) => r !== null).length;

    if (needDays !== null && working < needDays) {
      window.alert(FORMAT_ERROR);
      return;
    }

    if (block !== null) {
      const bad = ranges.some((r) => r !== null && hoursInRange(r) !== block);
      if (bad) {
        window.alert(FORMAT_ERROR);
        return;
      }
    }

    const parts = DAYS.map((d, i) => formatDaySummary(d, ranges[i])).filter(
      Boolean,
    ) as string[];
    const persist: CourierSchedulePersist = { template, ranges };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        COURIER_SCHEDULE_PERSIST_KEY,
        JSON.stringify(persist),
      );
    }
    onSave(parts.join("; ") || "График: свободный выбор", persist);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto [-webkit-overflow-scrolling:touch] py-2">
        <p className="m-0 text-[15px] font-semibold">{rateLabel}</p>
        <div className="flex flex-wrap gap-2.5 items-stretch">
          <Button
            className="flex-[1_1_160px] !min-h-14"
            onClick={() => applyPreset("4x8")}
          >
            4 дня по 8 ч
          </Button>
          <Button
            className="flex-[1_1_160px] !min-h-14"
            onClick={() => applyPreset("5x8")}
          >
            5 дней по 8 ч
          </Button>
          <Button
            className="flex-[1_1_160px] !min-h-14"
            onClick={() => applyPreset("7x5")}
          >
            7 дней по 5 ч
          </Button>
          <Button
            className="flex-[1_1_160px] !min-h-14"
            type="dashed"
            onClick={() => applyPreset("free")}
          >
            Свободный график
          </Button>
        </div>
        <div className="grid [grid-template-columns:repeat(7,minmax(0,1fr))] gap-2 max-[720px]:[grid-template-columns:repeat(4,minmax(0,1fr))] max-[480px]:[grid-template-columns:repeat(2,minmax(0,1fr))]">
          {DAYS.map((d, dayIndex) => (
            <div
              key={d}
              className="flex min-w-0 flex-col gap-1.5 rounded-lg p-2 [background:var(--ant-color-fill-quaternary,#f5f5f5)]"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
                  {d}
                </span>
                <Button
                  type="link"
                  size="small"
                  onClick={() => clearDay(dayIndex)}
                >
                  Выходной
                </Button>
              </div>
              <div className="flex flex-col gap-0.5">
                {HOURS.map((hour) => {
                  const r = ranges[dayIndex];
                  const inRange = r !== null && hour >= r.from && hour <= r.to;
                  return (
                    <button
                      key={hour}
                      type="button"
                      className={
                        inRange
                          ? "flex h-[22px] w-full min-h-[22px] cursor-pointer items-center justify-center gap-0.5 rounded-[3px] border px-1 py-[1px] text-[10px] font-semibold leading-[1.1] [background:var(--ant-color-primary-bg,#e6f4ff)] [border-color:var(--ant-color-primary,#1677ff)] [color:var(--ant-color-primary,#1677ff)]"
                          : "flex h-[22px] w-full min-h-[22px] cursor-pointer items-center justify-center gap-0.5 rounded-[3px] border px-1 py-[1px] text-[10px] leading-[1.1] [background:var(--ant-color-bg-container,#fff)] [border-color:var(--ant-color-border-secondary,#d9d9d9)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] hover:[border-color:var(--ant-color-primary,#1677ff)] hover:[color:var(--ant-color-primary,#1677ff)]"
                      }
                      aria-pressed={inRange}
                      onClick={() => onBrickClick(dayIndex, hour)}
                    >
                      {hour}:00
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 border-t [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)] pt-3 [padding-bottom:calc(12px+env(safe-area-inset-bottom,0px))]">
        <Button type="primary" size="large" block onClick={handleSave}>
          Сохранить
        </Button>
        <Button size="large" block onClick={onCancel}>
          Закрыть
        </Button>
      </div>
    </div>
  );
}
