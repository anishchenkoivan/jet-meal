"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import styles from "./SheetStackOverlay.module.css";

export type SheetStackOverlayProps = {
  /** Слот с кнопкой/ссылкой «назад» — снаружи задаётся `NavBackLink` и т.п. */
  backNav: ReactNode;
  children: ReactNode;
  /** Доп. класс на прокручиваемый лист */
  sheetClassName?: string;
  /** Для `aria-labelledby` у листа с контентом */
  sheetId?: string;
  /** Если нет `sheetId` — подпись для `aria-label` у диалога */
  dialogAriaLabel?: string;
  /** Каталог: горизонтальный bleed; заказы/чекаут: обрезка */
  backdropOverflow?: "visible" | "hidden";
  sheetOverflowX?: "visible" | "hidden";
};

export function SheetStackOverlay({
  backNav,
  children,
  sheetClassName,
  sheetId,
  dialogAriaLabel,
  backdropOverflow = "hidden",
  sheetOverflowX = "hidden",
}: SheetStackOverlayProps) {
  useBodyScrollLock(true);

  return (
    <div
      className={cx(
        styles["backdrop"],
        backdropOverflow === "visible"
          ? styles["backdropOverflowVisible"]
          : styles["backdropOverflowHidden"],
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={sheetId ?? undefined}
      aria-label={sheetId ? undefined : dialogAriaLabel}
    >
      {backNav}
      <div
        className={cx(
          styles["sheet"],
          sheetOverflowX === "visible"
            ? styles["sheetOverflowXVisible"]
            : styles["sheetOverflowXHidden"],
          sheetClassName,
        )}
        id={sheetId}
      >
        {children}
      </div>
    </div>
  );
}

export type SheetEmptyStateProps = {
  title: string;
  children?: ReactNode;
};

/** Текст «не найдено» внутри листа оверлея */
export function SheetEmptyState({ title, children }: SheetEmptyStateProps) {
  return (
    <div className={styles["emptyInner"]}>
      <h2 className={styles["emptyTitle"]}>{title}</h2>
      {children ? <p className={styles["emptyText"]}>{children}</p> : null}
    </div>
  );
}
