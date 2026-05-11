"use client";

import { Button, Input } from "antd";
import cx from "classnames";
import { useMemo, useState } from "react";

export type FilterColumnOption = {
  value: string;
  label: string;
};

export type FilterColumnPickerProps = {
  title: string;
  onCancel: () => void;
  searchPlaceholder?: string;
  options: FilterColumnOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allowClear?: boolean;
  clearLabel?: string;
};

export function FilterColumnPicker({
  title,
  onCancel,
  searchPlaceholder = "Поиск…",
  options,
  value,
  onChange,
  allowClear = true,
  clearLabel = "Сбросить выбор",
}: FilterColumnPickerProps) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) {
      return options;
    }
    return options.filter((o) => o.label.toLowerCase().includes(s));
  }, [options, q]);

  return (
    <div className="flex flex-col gap-[10px] min-h-0 max-h-[80vh] box-border">
      <div className="flex items-center justify-between gap-2 flex-shrink-0">
        <h2 className="m-0 text-[15px] font-semibold leading-[1.3]">{title}</h2>
        <Button type="link" size="small" onClick={onCancel}>
          Отменить
        </Button>
      </div>
      <Input.Search
        allowClear
        placeholder={searchPlaceholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="flex-shrink-0"
      />
      <div
        className="flex-[1_1_auto] min-h-0 overflow-y-auto [-webkit-overflow-scrolling:touch] flex flex-col gap-[2px] py-[2px] pb-1"
        role="listbox"
      >
        {allowClear ? (
          <button
            type="button"
            className={cx(
              "block w-full m-0 px-[10px] py-[10px] border-none [border-radius:var(--ant-border-radius,6px)] bg-transparent text-left font-[inherit] text-sm leading-[1.35] cursor-pointer [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))] text-[13px] hover:[background:var(--ant-color-fill-quaternary,rgba(0,0,0,0.04))]",
              value === null &&
                "[background:var(--ant-color-primary-bg,#e6f4ff)] [color:var(--ant-color-primary,#1677ff)] font-semibold",
            )}
            onClick={() => {
              onChange(null);
              onCancel();
            }}
          >
            {clearLabel}
          </button>
        ) : null}
        {filtered.map((o) => (
          <button
            key={o.value}
            type="button"
            role="option"
            aria-selected={value === o.value}
            className={cx(
              "block w-full m-0 px-[10px] py-[10px] border-none [border-radius:var(--ant-border-radius,6px)] bg-transparent text-left font-[inherit] text-sm leading-[1.35] cursor-pointer [color:var(--ant-color-text,rgba(0,0,0,0.88))] hover:[background:var(--ant-color-fill-quaternary,rgba(0,0,0,0.04))]",
              value === o.value &&
                "[background:var(--ant-color-primary-bg,#e6f4ff)] [color:var(--ant-color-primary,#1677ff)] font-semibold",
            )}
            onClick={() => {
              onChange(o.value);
              onCancel();
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
