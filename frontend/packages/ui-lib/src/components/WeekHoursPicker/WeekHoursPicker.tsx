"use client";

import { TimePicker } from "antd";
import dayjs from "dayjs";

const WEEK: { key: string; short: string }[] = [
  { key: "mon", short: "Пн" },
  { key: "tue", short: "Вт" },
  { key: "wed", short: "Ср" },
  { key: "thu", short: "Чт" },
  { key: "fri", short: "Пт" },
  { key: "sat", short: "Сб" },
  { key: "sun", short: "Вс" },
];

export type DayHours = { open: string; close: string; closed: boolean };

export type WeekHoursValue = Record<string, DayHours>;

export function defaultWeekHours(): WeekHoursValue {
  return Object.fromEntries(WEEK.map((d) => [d.key, { open: "10:00", close: "22:00", closed: false }]));
}

export type WeekHoursPickerProps = {
  value: WeekHoursValue;
  onChange: (value: WeekHoursValue) => void;
};

export function WeekHoursPicker({ value, onChange }: WeekHoursPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {WEEK.map((d) => {
        const dh = value[d.key] ?? { open: "10:00", close: "22:00", closed: false };
        return (
          <div key={d.key} className="flex min-w-0 flex-row flex-nowrap items-center gap-2">
            <span className="w-7 shrink-0 text-[13px] font-medium [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
              {d.short}
            </span>
            <TimePicker.RangePicker
              format="HH:mm"
              minuteStep={15}
              needConfirm={false}
              disabled={dh.closed}
              value={
                dh.closed
                  ? null
                  : [dayjs(dh.open, "HH:mm"), dayjs(dh.close, "HH:mm")]
              }
              onChange={(val) => {
                if (val?.[0] && val?.[1]) {
                  onChange({
                    ...value,
                    [d.key]: { ...dh, open: val[0].format("HH:mm"), close: val[1].format("HH:mm") },
                  });
                }
              }}
              size="small"
              className="min-w-0 flex-1"
            />
            <label className="flex shrink-0 cursor-pointer items-center gap-1 text-[13px] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              <input
                type="checkbox"
                checked={dh.closed}
                onChange={(e) =>
                  onChange({ ...value, [d.key]: { ...dh, closed: e.target.checked } })
                }
              />
              Вых.
            </label>
          </div>
        );
      })}
    </div>
  );
}
