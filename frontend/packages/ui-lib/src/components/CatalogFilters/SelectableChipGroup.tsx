"use client";

import cx from "classnames";

export type SelectableChipOption = {
  value: string;
  label: string;
};

export function SelectableChipGroup({
  options,
  selected,
  onSelect,
}: {
  options: SelectableChipOption[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {options.map((opt) => (
        <li key={opt.value || "__any__"} className="m-0 p-0 list-none">
          <button
            type="button"
            className={cx(
              "px-3 py-[6px] rounded-lg border [border-color:var(--jm-color-border-secondary,#e8e8e8)] [background:var(--jm-color-bg-container,#fff)] text-[13px] leading-[1.35] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))] cursor-pointer [transition:border-color_0.15s_ease,background_0.15s_ease] hover:[border-color:var(--jm-color-primary-border-hover,#91caff)]",
              selected === opt.value &&
                "[border-color:var(--jm-color-primary,#1677ff)] [background:var(--jm-color-primary-bg,#e6f4ff)] [color:var(--jm-color-primary,#1677ff)] font-semibold",
            )}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
