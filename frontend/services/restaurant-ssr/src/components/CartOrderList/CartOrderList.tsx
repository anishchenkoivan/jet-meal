"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { useRestaurantCart } from "../../context/restaurant-cart-context";

/** Только список позиций (без итого) — для панели корзины со своим подвалом. */
export function CartOrderLines({ readOnly = false }: { readOnly?: boolean }) {
  const { lines, setQuantity } = useRestaurantCart();

  if (lines.length === 0) {
    return (
      <Typography.Paragraph type="secondary" className="!mb-0">
        Корзина пуста
      </Typography.Paragraph>
    );
  }

  return (
    <ul className="m-0 p-0 list-none flex flex-col gap-3">
      {lines.map((line) => (
        <li
          key={line.lineId}
          className="flex flex-row items-start justify-between gap-3 pb-3 [border-bottom:1px_solid_var(--ant-color-border-secondary,#f0f0f0)] last:border-b-0 last:pb-0"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
              {line.name}
            </div>
            <div className="mt-1 text-[13px] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              {line.priceRub} ₽ × {line.quantity}
            </div>
          </div>
          {readOnly ? null : (
            <div className="shrink-0 flex flex-row items-center gap-1.5">
              <Button
                size="small"
                onClick={() => setQuantity(line.dishId, line.quantity - 1)}
              >
                −
              </Button>
              <span className="min-w-[20px] text-center font-semibold text-sm">
                {line.quantity}
              </span>
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
