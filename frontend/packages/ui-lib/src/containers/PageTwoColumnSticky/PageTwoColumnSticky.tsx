"use client";

import cx from "classnames";
import type { ReactNode } from "react";

export type PageTwoColumnStickyProps = {
  main: ReactNode;
  side?: ReactNode;
  includeSideSlot?: boolean;
  sideSlotPosition?: "start" | "end";
  className?: string;
};

/**
 * Основная колонка + липкий боковой слот (корзина, адрес, зеркальный лэйаут).
 * Брейкпоинт двух колонок: 1292px (wide) — совпадает с breakpoint мобильных фильтров.
 */
export function PageTwoColumnSticky({
  main,
  side,
  includeSideSlot = true,
  sideSlotPosition = "end",
  className,
}: PageTwoColumnStickyProps) {
  const showSide = Boolean(includeSideSlot && side);

  const gridClass = showSide
    ? sideSlotPosition === "start"
      ? "wide:grid-cols-[minmax(260px,300px)_1fr] wide:gap-6 wide:items-stretch wide:min-h-0 wide:h-full wide:self-stretch"
      : "wide:grid-cols-[1fr_minmax(260px,300px)] wide:gap-6 wide:items-stretch wide:min-h-0 wide:h-full wide:self-stretch"
    : null;

  const slot = showSide ? (
    <div className="hidden wide:flex wide:h-full wide:min-h-0 wide:max-h-full wide:flex-col wide:self-stretch wide:sticky wide:[top:var(--page-two-col-sticky-top,16px)] py-2">
      {side}
    </div>
  ) : null;

  const mainEl = (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col wide:h-full wide:max-h-full py-2">
      <div className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden wide:overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {main}
      </div>
    </div>
  );

  return (
    <div
      className={cx(
        "[--page-two-col-sticky-top:16px] grid w-full min-w-0 flex-1 min-h-0 grid-cols-1 gap-5 items-stretch",
        gridClass,
        className,
      )}
    >
      {showSide && sideSlotPosition === "start" ? (
        <>
          {slot}
          {mainEl}
        </>
      ) : (
        <>
          {mainEl}
          {slot}
        </>
      )}
    </div>
  );
}
