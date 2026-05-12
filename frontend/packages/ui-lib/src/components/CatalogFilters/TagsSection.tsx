"use client";

import cx from "classnames";
import { Input } from "../Input/Input";
import { FilterSection } from "./FilterSection";
import type { SelectableChipOption } from "./SelectableChipGroup";

const SCROLLBAR_HIDE =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export type TagsSectionProps = {
  id: string;
  title: string;
  searchPlaceholder: string;
  emptySelectionHint: string;
  noSearchResultsText: string;
  searchValue: string;
  onSearchChange?: (value: string) => void;
  selectedValues: string[];
  /** Полный справочник value → label */
  optionCatalog: SelectableChipOption[];
  onToggle: (value: string) => void;
  showSearchHits: boolean;
  popularOptions: SelectableChipOption[];
  searchHits: SelectableChipOption[];
};

export function TagsSection({
  id,
  title,
  searchPlaceholder,
  emptySelectionHint,
  noSearchResultsText,
  searchValue,
  onSearchChange,
  selectedValues,
  optionCatalog,
  onToggle,
  showSearchHits,
  popularOptions,
  searchHits,
}: TagsSectionProps) {
  return (
    <FilterSection id={id} title={title}>
      <Input
        allowClear
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
      {selectedValues.length > 0 ? (
        <div className="flex flex-wrap gap-x-[10px] gap-y-[6px] items-baseline">
          {selectedValues.map((value) => {
            const lab =
              optionCatalog.find((o) => o.value === value)?.label ?? value;
            return (
              <button
                key={value}
                type="button"
                className="m-0 p-0 border-none bg-none font-[inherit] text-sm leading-[1.5715] [color:var(--jm-color-text,rgba(0,0,0,0.88))] cursor-pointer underline [text-underline-offset:2px] hover:[color:var(--ant-color-error,#ff4d4f)]"
                onClick={() => onToggle(value)}
              >
                {lab}
                <span className="ml-1 text-sm leading-none no-underline opacity-75">
                  ×
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="m-0 text-xs [color:var(--jm-color-text-tertiary,rgba(0,0,0,0.45))]">
          {emptySelectionHint}
        </p>
      )}
      {!showSearchHits && popularOptions.length > 0 ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 items-baseline">
          {popularOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="m-0 p-0 border-none bg-none font-[inherit] text-sm leading-[1.5715] [color:var(--ant-color-link,#1677ff)] cursor-pointer no-underline hover:[color:var(--ant-color-link-hover,#4096ff)] hover:underline"
              onClick={() => onToggle(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
      {showSearchHits ? (
        <div
          className={cx(
            "max-h-[min(36vh,220px)] overflow-y-auto pt-1",
            SCROLLBAR_HIDE,
          )}
        >
          {searchHits.length === 0 ? (
            <span className="text-xs [color:var(--jm-color-text-tertiary,rgba(0,0,0,0.45))]">
              {noSearchResultsText}
            </span>
          ) : (
            <div className="flex flex-wrap gap-x-3 gap-y-1 items-baseline">
              {searchHits.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="m-0 p-0 border-none bg-none font-[inherit] text-sm leading-[1.5715] [color:var(--ant-color-link,#1677ff)] cursor-pointer no-underline hover:[color:var(--ant-color-link-hover,#4096ff)] hover:underline"
                  onClick={() => onToggle(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </FilterSection>
  );
}
