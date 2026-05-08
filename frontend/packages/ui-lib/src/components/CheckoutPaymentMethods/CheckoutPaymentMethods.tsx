"use client";

import cx from "classnames";
import { Typography } from "../Typography/Typography";
import styles from "./CheckoutPaymentMethods.module.css";
import { useState } from "react";

export type CheckoutPaymentMethodId = "sbp" | "card" | "yandex" | "sber";

const METHODS: { id: CheckoutPaymentMethodId; label: string }[] = [
  { id: "sbp", label: "СБП" },
  { id: "card", label: "Картой" },
  { id: "yandex", label: "Яндекс Пэй" },
  { id: "sber", label: "Сбер" },
];

export function CheckoutPaymentMethods() {
  const [active, setActive] = useState<CheckoutPaymentMethodId>("sbp");

  return (
    <section className={styles["section"]} aria-label="Оплата">
      <h2 className={styles["title"]}>Оплата</h2>
      <div className={styles["tileRow"]} role="tablist" aria-label="Способ оплаты">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active === m.id}
            className={cx(styles["tile"], active === m.id && styles["tileActive"])}
            onClick={() => setActive(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className={styles["panel"]} role="tabpanel">
        {active === "sbp" ? (
          <Typography.Paragraph className={styles["panelText"]}>
            Оплата через Систему быстрых платежей — подтвердите перевод в приложении банка.
          </Typography.Paragraph>
        ) : null}
        {active === "card" ? (
          <Typography.Paragraph className={styles["panelText"]}>
            Банковская карта Visa, MasterCard, МИР. Данные карты вводятся на защищённой
            странице эквайера.
          </Typography.Paragraph>
        ) : null}
        {active === "yandex" ? (
          <Typography.Paragraph className={styles["panelText"]}>
            Оплата через Яндекс Пэй — выберите карту или кошелёк в виджете Яндекса.
          </Typography.Paragraph>
        ) : null}
        {active === "sber" ? (
          <Typography.Paragraph className={styles["panelText"]}>
            Оплата через Сбер: СберPay или привязанная карта в приложении Сбербанка.
          </Typography.Paragraph>
        ) : null}
      </div>
    </section>
  );
}
