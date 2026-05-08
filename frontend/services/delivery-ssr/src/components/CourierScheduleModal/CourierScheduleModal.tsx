"use client";

import { useMemo, useState } from "react";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Modal } from "@jet-meal/ui-lib/src/components/Modal/Modal";
import { Title, Paragraph } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import courierModalMobile from "../CourierModalMobile.module.css";
import styles from "./CourierScheduleModal.module.css";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

/** Вертикально сверху вниз: 6:00 … 23:00. */
const HOURS = Array.from({ length: 18 }, (_, i) => 6 + i);

type Template = "4x8" | "5x8" | "7x5" | "free";

export type DayRange = { from: number; to: number } | null;

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

/** Длина блока в часах при одном клике (вниз от выбранного часа). */
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

/** Один клик: от выбранного часа вниз ровно `k` часов подряд (при нехватке до 23:00 — сдвиг вверх). */
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
      { from: 8, to: 15 },
      { from: 8, to: 15 },
      { from: 8, to: 15 },
      { from: 8, to: 15 },
      { from: 8, to: 15 },
      null,
      null,
    ];
  }
  if (template === "7x5") {
    return Array.from({ length: 7 }, () => ({ from: 7, to: 11 } as DayRange));
  }
  return Array.from({ length: 7 }, () => null);
}

function formatDaySummary(dayLabel: string, r: DayRange): string | null {
  if (!r) {
    return null;
  }
  return `${dayLabel}: ${r.from}:00–${r.to}:00 (${hoursInRange(r)} ч)`;
}

export type CourierScheduleModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (summary: string) => void;
};

export function CourierScheduleModal({ open, onClose, onSave }: CourierScheduleModalProps) {
  const [template, setTemplate] = useState<Template>("5x8");
  const [ranges, setRanges] = useState<DayRange[]>(() => defaultRanges("5x8"));

  const rateLabel = useMemo(() => {
    const r = RATE[template];
    return `Предлагаемая ставка: от ${r} ₽ / ч (до налогов, демо)`;
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
      window.alert(
        `Нужно минимум ${needDays} рабочих дней с выделенным интервалом (подряд «кирпичиками»).`,
      );
      return;
    }

    if (block !== null) {
      const bad = ranges.some((r) => r !== null && hoursInRange(r) !== block);
      if (bad) {
        window.alert(
          `Для выбранного шаблона на каждом рабочем дне должно быть ровно ${block} часов подряд.`,
        );
        return;
      }
    }

    const parts = DAYS.map((d, i) => formatDaySummary(d, ranges[i])).filter(Boolean) as string[];
    onSave(parts.join("; ") || "График: свободный выбор");
    onClose();
  };

  const kHint = blockLengthForClick(template);

  return (
    <Modal
      title="Расписание и ставка"
      open={open}
      onCancel={onClose}
      width={920}
      footer={null}
      destroyOnClose
      wrapClassName={courierModalMobile.fullscreenWrapper}
    >
      <div className={styles["root"]}>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Один клик по часу сразу выделяет {kHint} часов подряд вниз (к концу дня блок сдвигается,
          если до 23:00 не хватает). Клик по уже выделенному часу снимает день. «Выходной» —
          очистить.
        </Paragraph>
        <p className={styles["rate"]}>{rateLabel}</p>
        <div className={styles["presets"]}>
          <Button className={styles["presetBtn"]} onClick={() => applyPreset("4x8")}>
            4 дня по 8 ч
          </Button>
          <Button className={styles["presetBtn"]} onClick={() => applyPreset("5x8")}>
            5 дней по 8 ч
          </Button>
          <Button className={styles["presetBtn"]} onClick={() => applyPreset("7x5")}>
            7 дней по 5 ч
          </Button>
          <Button className={styles["presetBtn"]} type="dashed" onClick={() => applyPreset("free")}>
            Свободный график
          </Button>
        </div>
        <Title level={5} style={{ margin: 0 }}>
          Неделя · 6:00–23:00 (сверху вниз)
        </Title>
        <div className={styles["week"]}>
          {DAYS.map((d, dayIndex) => (
            <div key={d} className={styles["dayCell"]}>
              <div className={styles["dayHead"]}>
                <span className={styles["dayLabel"]}>{d}</span>
                <Button type="link" size="small" onClick={() => clearDay(dayIndex)}>
                  Выходной
                </Button>
              </div>
              <div className={styles["hoursCol"]}>
                {HOURS.map((hour) => {
                  const r = ranges[dayIndex];
                  const inRange = r !== null && hour >= r.from && hour <= r.to;
                  return (
                    <button
                      key={hour}
                      type="button"
                      className={[styles["brick"], inRange ? styles["brickSelected"] : ""]
                        .filter(Boolean)
                        .join(" ")}
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="primary" onClick={handleSave}>
            Сохранить
          </Button>
        </div>
        <p className={styles["footerNote"]}>
          Нажимая «Сохранить», вы подтверждаете согласование графика с координатором (демо, без
          отправки на сервер).
        </p>
      </div>
    </Modal>
  );
}
