"use client";

import cx from "classnames";
import type { ReactNode } from "react";

export type CenteredColumnProps = {
  children: ReactNode;
  /** Макс. ширина панели в px (как у личного кабинета, по умолчанию 720) */
  maxWidthPx?: number;
  className?: string;
  innerClassName?: string;
};

/**
 * Колонка по центру по горизонтали; на десктопе — по вертикали тоже по центру.
 * На мобилке контент прижат сверху, панель на всю ширину/высоту области без скругления «карточки».
 * Стили `.ant-card` совместимы с личным кабинетом (AccountPageShell).
 */
export function CenteredColumn({
  children,
  maxWidthPx = 720,
  className,
  innerClassName,
}: CenteredColumnProps) {
  return (
    <div
      className={cx(
        "flex w-full min-h-0 flex-1 flex-col",
        "max-[767px]:justify-start",
        "min-[768px]:justify-center min-[768px]:py-6",
        className,
      )}
    >
      <div
        className={cx(
          "box-border mx-auto flex w-full min-h-0 flex-col",
          "max-[767px]:min-h-0 max-[767px]:flex-1 max-[767px]:overflow-y-auto",
          "px-4 pb-2 pt-2 max-[767px]:px-3",
          "[&_.ant-card-body]:!p-[12px_16px] [&_.ant-card]:max-w-full [&_.ant-card]:!mx-0",
          "min-[768px]:[&_.ant-card]:!rounded-2xl min-[768px]:[&_.ant-card]:!shadow-[0_1px_2px_rgb(0_0_0/4%),0_8px_40px_rgb(0_0_0/6%)]",
          "max-[767px]:[&_.ant-card]:!rounded-none max-[767px]:[&_.ant-card]:!shadow-none",
          innerClassName,
        )}
        style={{ maxWidth: `min(${maxWidthPx}px, 100%)` }}
      >
        {children}
      </div>
    </div>
  );
}
