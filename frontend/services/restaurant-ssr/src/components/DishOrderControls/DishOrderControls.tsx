"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { ShoppingCartIcon } from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { useRestaurantCart } from "../../context/restaurant-cart-context";

export type DishOrderControlsProps = {
  restaurantId: string;
  restaurantName: string;
  dishId: string;
  dishName: string;
  priceRub: number;
};

export function DishOrderControls({
  restaurantId,
  restaurantName,
  dishId,
  dishName,
  priceRub,
}: DishOrderControlsProps) {
  const { lineForDish, addOne, setQuantity } = useRestaurantCart();
  const line = lineForDish(dishId);
  const qty = line?.quantity ?? 0;

  if (qty <= 0) {
    return (
      <Button
        type="primary"
        size="small"
        className="!font-semibold"
        onClick={(e) => {
          e.stopPropagation();
          addOne({
            restaurantId,
            restaurantName,
            dishId,
            name: dishName,
            priceRub,
          });
        }}
      >
        В корзину
      </Button>
    );
  }

  return (
    <div
      className="inline-flex flex-row items-center flex-wrap justify-end gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        size="small"
        aria-label="Меньше"
        onClick={() => setQuantity(dishId, qty - 1)}
      >
        −
      </Button>
      <span className="min-w-[22px] text-center text-sm font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
        {qty}
      </span>
      <Button
        size="small"
        aria-label="Больше"
        onClick={() => setQuantity(dishId, qty + 1)}
      >
        +
      </Button>
      <Button
        type="text"
        danger
        size="small"
        className="!px-[6px] !min-w-0"
        aria-label="Убрать позицию из заказа"
        icon={<ShoppingCartIcon size={16} />}
        onClick={(e) => {
          e.stopPropagation();
          setQuantity(dishId, 0);
        }}
      />
    </div>
  );
}
