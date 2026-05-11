"use client";

import cx from "classnames";

export function SelectOptionRow({
  label,
  selected,
  onPick,
}: {
  label: string;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      className={cx(
        "block w-full box-border px-3 py-[10px] text-left text-sm leading-[1.4] [color:var(--jm-color-text,rgba(0,0,0,0.88))] cursor-pointer [background:var(--jm-color-bg-container,#fff)] border border-transparent rounded-lg hover:[background:var(--jm-color-fill-quaternary,#f5f5f5)]",
        selected &&
          "[border-color:var(--jm-color-primary,#1677ff)] [background:var(--jm-color-primary-bg,#e6f4ff)] [color:var(--jm-color-primary,#1677ff)] font-semibold",
      )}
      onClick={onPick}
    >
      {label}
    </button>
  );
}
