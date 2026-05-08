"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import styles from "./StickyAsidePanel.module.css";

export type StickyAsidePanelProps = {
  children: ReactNode;
  /** `aria-label` панели (корзина, фильтры, адрес и т.д.) */
  ariaLabel: string;
  className?: string;
};

/**
 * Карточка для липкого слота (`PageTwoColumnSticky` → `stickySlot`).
 * Высота по умолчанию берётся из `--page-two-col-aside-max-height` на предке (см. `PageTwoColumnSticky`).
 */
export function StickyAsidePanel({ children, ariaLabel, className }: StickyAsidePanelProps) {
  return (
    <aside className={cx(styles["panel"], className)} aria-label={ariaLabel}>
      {children}
    </aside>
  );
}
