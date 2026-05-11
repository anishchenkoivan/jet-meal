"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

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
        "fixed z-[1100] left-0 right-0 [top:var(--sheet-overlay-top,64px)] bottom-0 flex flex-col items-stretch box-border p-0 bg-black/45 [--sheet-overlay-top:64px]",
        backdropOverflow === "visible" ? "overflow-visible" : "overflow-hidden",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={sheetId ?? undefined}
      aria-label={sheetId ? undefined : dialogAriaLabel}
    >
      {backNav}
      <div
        className={cx(
          "flex-1 min-h-0 w-full max-w-none m-0 rounded-none [background:var(--ant-color-bg-layout,#f5f5f5)] shadow-none overflow-y-auto [-webkit-overflow-scrolling:touch]",
          sheetOverflowX === "visible" ? "overflow-x-visible" : "overflow-x-hidden",
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
    <div className="box-border w-full max-w-[480px] mx-auto px-0 pt-2 pb-6">
      <h2 className="m-0 mb-2 text-[18px]">{title}</h2>
      {children ? (
        <p className="m-0 mb-4 [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]">
          {children}
        </p>
      ) : null}
    </div>
  );
}
