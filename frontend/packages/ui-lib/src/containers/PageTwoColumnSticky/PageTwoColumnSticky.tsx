"use client";

import cx from "classnames";
import type { CSSProperties, ReactNode } from "react";
import styles from "./PageTwoColumnSticky.module.css";

export type PageTwoColumnStickyProps = {
  main: ReactNode;
  side?: ReactNode;
  /**
   * `false` — одна колонка (слот не рендерится).
   * `true` — при ширине ≥ `desktopMinPx` две колонки; на узкой ширине слот скрыт через CSS.
   */
  includeSideSlot?: boolean;
  /** `end` — слот справа; `start` — слева. */
  sideSlotPosition?: "start" | "end";
  className?: string;
  style?: CSSProperties;
};

/**
 * Основная колонка + липкий боковой слот (корзина, адрес, зеркальный лэйаут).
 * Брейкпоинт двух колонок: 992px (см. модуль). Переопределение — через `className` + свой медиа.
 */
export function PageTwoColumnSticky({
  main,
  side,
  includeSideSlot = true,
  sideSlotPosition = "end",
  className,
  style,
}: PageTwoColumnStickyProps) {
  const showSide = Boolean(includeSideSlot && side);

  const gridClass = showSide
    ? sideSlotPosition === "start"
      ? styles["gridWithStartSlot"]
      : styles["gridWithEndSlot"]
    : null;

  const slot = showSide ? (
    <div className={styles["stickySlot"]}>{side}</div>
  ) : null;

  const mainEl = <div className={styles["main"]}>{main}</div>;

  return (
    <div className={cx(styles["grid"], gridClass, className)} style={style}>
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
