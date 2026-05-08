"use client";

import { Typography } from "antd";
import cx from "classnames";
import type { ReactNode } from "react";
import styles from "./SbpCheckoutPanel.module.css";

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
    <section className={cx(styles["root"], className)}>
      <Typography.Title level={5} className={styles["heading"]}>
        {title}
      </Typography.Title>
      {description ? (
        <div className={styles["description"]}>{description}</div>
      ) : null}
      {qrSlot ? <div className={styles["qr"]}>{qrSlot}</div> : null}
      {footerNote ? (
        <div className={styles["footer"]}>{footerNote}</div>
      ) : null}
    </section>
  );
}
