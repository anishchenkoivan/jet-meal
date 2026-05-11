"use client";

import cx from "classnames";
import type { ReactNode } from "react";

export type StickyAsidePanelProps = {
  children: ReactNode;
  /** `aria-label` панели (корзина, фильтры, адрес и т.д.) */
  ariaLabel: string;
  className?: string;
  /** Для `aria-controls` у кнопки «Фильтры» на мобильной ширине */
  id?: string;
};

/**
 * Карточка для липкого слота (`PageTwoColumnSticky` → `stickySlot`).
 * Высота: заполняет доступную высоту колонки (регион main между шапкой и футером), без `100dvh`.
 */
export function StickyAsidePanel({
  children,
  ariaLabel,
  className,
  id,
}: StickyAsidePanelProps) {
  return (
    <aside
      id={id}
      className={cx(
        "box-border flex h-full min-h-0 max-h-full min-w-0 flex-col p-4 border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [border-radius:var(--ant-border-radius-lg,8px)] [background:var(--ant-color-bg-container,#fff)]",
        className,
      )}
      aria-label={ariaLabel}
    >
      {children}
    </aside>
  );
}
