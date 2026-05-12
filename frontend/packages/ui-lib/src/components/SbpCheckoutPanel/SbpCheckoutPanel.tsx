"use client";

import { Typography } from "antd";
import cx from "classnames";
import type { ReactNode } from "react";

export type SbpCheckoutPanelProps = {
  title?: string;
  description?: ReactNode;
  /** QR или иллюстрация оплаты */
  qrSlot?: ReactNode;
  footerNote?: ReactNode;
  className?: string;
};

/**
 * Оболочка под оплату по СБП: без привязки к заказу — только слоты и текст.
 * Реальный QR и сценарий оплаты подключаются в сервисе.
 */
export function SbpCheckoutPanel({
  title = "Оплата по СБП",
  description = "Отсканируйте QR в приложении банка или выберите СБП на экране оплаты.",
  qrSlot,
  footerNote,
  className,
}: SbpCheckoutPanelProps) {
  return (
    <section
      className={cx(
        "box-border p-4 border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [border-radius:var(--ant-border-radius-lg,8px)] [background:var(--ant-color-bg-container,#fff)]",
        className,
      )}
    >
      <Typography.Title level={5} className="!m-0 !mb-2 !text-base">
        {title}
      </Typography.Title>
      {description ? (
        <div className="mb-3 text-sm leading-[1.5] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]">
          {description}
        </div>
      ) : null}
      {qrSlot ? (
        <div className="flex justify-center items-center min-h-[160px] mb-2 [border-radius:var(--ant-border-radius,6px)] [background:var(--ant-color-fill-quaternary,rgba(0,0,0,0.02))]">
          {qrSlot}
        </div>
      ) : null}
      {footerNote ? (
        <div className="text-xs leading-[1.45] [color:var(--ant-color-text-tertiary,rgba(0,0,0,0.45))]">
          {footerNote}
        </div>
      ) : null}
    </section>
  );
}
