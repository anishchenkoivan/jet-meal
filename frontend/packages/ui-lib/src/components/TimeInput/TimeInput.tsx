"use client";

import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo } from "react";

const STORAGE_FORMAT = "YYYY-MM-DD HH:mm";

export type TimeInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Выбор даты и времени (Ant Design DatePicker + showTime).
 * Значение — строка `YYYY-MM-DD HH:mm` или пусто.
 */
export function TimeInput({
  value,
  onChange,
  placeholder = "Дата и время",
  className,
}: TimeInputProps) {
  const parsed = useMemo((): Dayjs | null => {
    if (!value?.trim()) {
      return null;
    }
    const d = dayjs(value.trim());
    return d.isValid() ? d : null;
  }, [value]);

  return (
    <DatePicker
      showTime
      needConfirm={false}
      className={className}
      style={{ width: "100%" }}
      value={parsed}
      onChange={(d) => onChange?.(d ? d.format(STORAGE_FORMAT) : "")}
      format="DD.MM.YYYY HH:mm"
      placeholder={placeholder}
      allowClear
    />
  );
}
