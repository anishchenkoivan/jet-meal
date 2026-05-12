"use client";

import cx from "classnames";
import type { ReactNode } from "react";

export type MiddleColumnVerticalAlign = "top" | "center" | "bottom";

export type MiddleColumnProps = {
  children: ReactNode;
  /** Где располагается узкая колонка по вертикали в доступной высоте родителя */
  verticalAlign?: MiddleColumnVerticalAlign;
  /** Макс. ширина колонки в px (как у формы авторизации, по умолчанию 640) */
  maxWidthPx?: number;
  className?: string;
  innerClassName?: string;
};

/**
 * Узкая центрированная по горизонтали колонка; по вертикали — top / center / bottom.
 * Родитель должен давать высоту (например `flex flex-1 min-h-0` в дровере или main).
 */
export function MiddleColumn({
  children,
  verticalAlign = "center",
  maxWidthPx = 640,
  className,
  innerClassName,
}: MiddleColumnProps) {
  return (
    <div
      className={cx(
        "flex w-full min-h-0 flex-1 flex-col",
        verticalAlign === "top" && "justify-start",
        verticalAlign === "center" && "justify-center",
        verticalAlign === "bottom" && "justify-end",
        className,
      )}
    >
      <div
        className={cx(
          "box-border mx-auto min-h-0 w-full px-[clamp(12px,3vw,24px)]",
          innerClassName,
        )}
        style={{ maxWidth: `min(${maxWidthPx}px, 100%)` }}
      >
        {children}
      </div>
    </div>
  );
}
