"use client";

import { Button, Input } from "antd";
import cx from "classnames";
import { useMemo, useState } from "react";
import styles from "./FilterColumnPicker.module.css";

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
    <div className={styles["shell"]}>
      <div className={styles["head"]}>
        <h2 className={styles["title"]}>{title}</h2>
        <Button type="link" size="small" onClick={onCancel}>
          Отменить
        </Button>
      </div>
      <Input.Search
        allowClear
        placeholder={searchPlaceholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className={styles["search"]}
      />
      <div className={styles["list"]} role="listbox">
        {allowClear ? (
          <button
            type="button"
            className={cx(
              styles["option"],
              styles["optionClear"],
              value === null && styles["optionSelected"],
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
              styles["option"],
              value === o.value && styles["optionSelected"],
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
