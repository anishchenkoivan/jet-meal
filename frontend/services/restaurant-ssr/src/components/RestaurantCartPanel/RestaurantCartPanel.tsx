"use client";

import { CartRecommendations } from "@jet-meal/restaurant-ui/src/components/CartRecommendations/CartRecommendations";
import type { CartRecommendationItem } from "@jet-meal/restaurant-ui/src/types/cartRecommendation";
import { AppConfirmModal } from "@jet-meal/ui-lib/src/components/AppConfirmModal/AppConfirmModal";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { DeleteIcon } from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import { CartOrderLines } from "../CartOrderList/CartOrderList";
import styles from "./RestaurantCartPanel.module.css";

export type RestaurantCartPanelProps = {
  /** Скрыть шапку «Корзина» + очистить */
  hideHeader?: boolean;
  /** Показать кнопку «Перейти к оформлению» (на странице checkout — false) */
  showCheckoutCta?: boolean;
  /** На оформлении: без изменения количества и без рекомендаций */
  readOnly?: boolean;
};

export function RestaurantCartPanel({
  hideHeader = false,
  showCheckoutCta = true,
  readOnly = false,
}: RestaurantCartPanelProps) {
  const router = useRouter();
  const {
    restaurantName,
    totalCount,
    totalRub,
    lines,
    clearCart,
    addOne,
    lineForDish,
    restaurantId,
    pageRestaurantId,
    pageRestaurantName,
    recommendationItems,
    checkoutHref,
  } = useRestaurantCart();

  const effectiveRestaurantId = restaurantId ?? pageRestaurantId;
  const effectiveRestaurantName = restaurantName ?? pageRestaurantName;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const subtitle =
    totalCount > 0 && restaurantName
      ? restaurantName
      : totalCount > 0
        ? "Выбранные позиции"
        : null;

  const canClear = lines.length > 0;
  const canCheckout = Boolean(checkoutHref) && totalCount > 0;

  const handleAddRecommendation = (item: CartRecommendationItem) => {
    if (!effectiveRestaurantId || !effectiveRestaurantName) {
      return;
    }
    addOne({
      restaurantId: effectiveRestaurantId,
      restaurantName: effectiveRestaurantName,
      dishId: item.id,
      name: item.name,
      priceRub: item.priceRub,
    });
  };

  return (
    <div className={styles["root"]}>
      {!hideHeader ? (
        <div className={styles["head"]}>
          <Button
            type="text"
            danger
            size="small"
            className={styles["clearBtn"]}
            aria-label="Очистить корзину"
            disabled={!canClear || readOnly}
            icon={<DeleteIcon size={18} />}
            onClick={() => setConfirmOpen(true)}
          />
          <div className={styles["titleBlock"]}>
            <h2 className={styles["title"]}>Корзина</h2>
            {subtitle ? <p className={styles["sub"]}>{subtitle}</p> : null}
          </div>
        </div>
      ) : null}

      <div className={styles["mid"]}>
        <div className={styles["linesScroll"]}>
          <CartOrderLines readOnly={readOnly} />
        </div>
        {!readOnly &&
        totalCount > 0 &&
        effectiveRestaurantId &&
        effectiveRestaurantName ? (
          <div className={styles["recSlot"]}>
            <CartRecommendations
              items={recommendationItems}
              onAdd={handleAddRecommendation}
              quantityForId={(id) => lineForDish(id)?.quantity ?? 0}
            />
          </div>
        ) : null}
      </div>

      <div className={styles["footer"]}>
        {showCheckoutCta ? (
          <Button
            type="primary"
            size="large"
            className={styles["checkoutBtn"]}
            disabled={!canCheckout}
            onClick={() => {
              if (checkoutHref) {
                router.push(checkoutHref);
              }
            }}
          >
            Перейти к оформлению
          </Button>
        ) : null}
        <div className={styles["total"]}>
          <strong>Итого: {totalRub} ₽</strong>
        </div>
      </div>

      <AppConfirmModal
        open={confirmOpen}
        title="Очистить корзину?"
        okText="Очистить"
        cancelText="Отмена"
        onOk={() => {
          clearCart();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      >
        Все позиции будут удалены из корзины.
      </AppConfirmModal>
    </div>
  );
}
