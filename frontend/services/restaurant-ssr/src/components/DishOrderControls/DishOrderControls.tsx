"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { ShoppingCartIcon } from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import styles from "./DishOrderControls.module.css";

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
        className={styles["addBtn"]}
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
    <div className={styles["counter"]} onClick={(e) => e.stopPropagation()}>
      <Button
        size="small"
        aria-label="Меньше"
        onClick={() => setQuantity(dishId, qty - 1)}
      >
        −
      </Button>
      <span className={styles["qty"]}>{qty}</span>
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
        className={styles["removeFromOrderBtn"]}
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
