"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import styles from "./CartOrderList.module.css";

/** Только список позиций (без итого) — для панели корзины со своим подвалом. */
export function CartOrderLines({ readOnly = false }: { readOnly?: boolean }) {
  const { lines, setQuantity } = useRestaurantCart();

  if (lines.length === 0) {
    return (
      <Typography.Paragraph type="secondary" className={styles["empty"]}>
        Корзина пуста
      </Typography.Paragraph>
    );
  }

  return (
    <ul className={styles["lines"]}>
      {lines.map((line) => (
        <li key={line.lineId} className={styles["line"]}>
          <div className={styles["lineMain"]}>
            <div className={styles["lineName"]}>{line.name}</div>
            <div className={styles["lineMeta"]}>
              {line.priceRub} ₽ × {line.quantity}
            </div>
          </div>
          {readOnly ? null : (
            <div className={styles["lineActions"]}>
              <Button
                size="small"
                onClick={() => setQuantity(line.dishId, line.quantity - 1)}
              >
                −
              </Button>
              <span className={styles["lineQty"]}>{line.quantity}</span>
              <Button
                size="small"
                onClick={() => setQuantity(line.dishId, line.quantity + 1)}
              >
                +
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
