"use client";

import { CartRecommendations } from "@jet-meal/restaurant-ui/src/components/CartRecommendations/CartRecommendations";
import type { CartRecommendationItem } from "@jet-meal/restaurant-ui/src/types/cartRecommendation";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { useDrawer } from "@jet-meal/ui-lib/src/components/DrawerProvider/DrawerProvider";
import cx from "classnames";
import { useRouter } from "next/navigation";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import { hasValidAccountSessionInBrowser } from "../../lib/accountSession";
import { CartOrderLines } from "../CartOrderList/CartOrderList";
import { RestaurantCheckoutAuthDrawer } from "../RestaurantCheckoutAuthDrawer/RestaurantCheckoutAuthDrawer";
import { RESTAURANT_CHECKOUT_AUTH_DRAWER_ID } from "../restaurantDrawerIds";

export type RestaurantCartPanelProps = {
  /** Скрыть шапку с названием ресторана (моб. дровер) */
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
  const { open } = useDrawer();
  const {
    restaurantName,
    totalCount,
    totalRub,
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

  const subtitle =
    totalCount > 0 && restaurantName
      ? restaurantName
      : totalCount > 0
        ? "Выбранные позиции"
        : null;

  const desktopHeaderTitle =
    effectiveRestaurantName?.trim() ||
    (totalCount > 0 ? subtitle : null) ||
    null;

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

  const showRecommendations =
    !readOnly &&
    totalCount > 0 &&
    Boolean(effectiveRestaurantId) &&
    Boolean(effectiveRestaurantName);

  return (
    <div
      className={cx(
        "box-border flex min-h-0 flex-col overflow-hidden",
        hideHeader
          ? "h-full flex-1 px-4 pt-4"
          : "h-full min-h-0 flex-[1_1_auto] gap-2",
      )}
    >
      {!hideHeader && desktopHeaderTitle ? (
        <div className="mb-1 flex min-w-0 shrink-0">
          <h2 className="m-0 truncate text-base font-semibold leading-[1.35] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            {desktopHeaderTitle}
          </h2>
        </div>
      ) : null}

      {hideHeader && subtitle ? (
        <p className="mb-3 mt-0 shrink-0 text-[13px] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
          {subtitle}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className={cx(
            "min-h-0 flex-1 overflow-x-hidden overflow-y-auto [-webkit-overflow-scrolling:touch]",
            hideHeader ? "-mx-4 px-4" : "",
          )}
        >
          <CartOrderLines readOnly={readOnly} />
        </div>

        {showRecommendations || showCheckoutCta ? (
          <footer
            className={cx(
              "flex shrink-0 flex-col gap-3 border-t [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)] pt-3 [padding-bottom:calc(12px+env(safe-area-inset-bottom,0px))]",
              hideHeader ? "-mx-4 px-4" : "mt-1",
            )}
          >
            {showRecommendations ? (
              <CartRecommendations
                items={recommendationItems}
                onAdd={handleAddRecommendation}
                quantityForId={(id) => lineForDish(id)?.quantity ?? 0}
              />
            ) : null}

            {showCheckoutCta ? (
              <div className="flex w-full flex-col gap-1.5">
                {totalCount > 0 ? (
                  <div className="text-left text-base font-bold leading-tight [font-variant-numeric:tabular-nums] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
                    {totalRub} ₽
                  </div>
                ) : null}
                <Button
                  type="primary"
                  size="large"
                  className="!w-full"
                  disabled={!canCheckout}
                  onClick={() => {
                    if (!checkoutHref) {
                      return;
                    }
                    if (!hasValidAccountSessionInBrowser()) {
                      open(
                        RESTAURANT_CHECKOUT_AUTH_DRAWER_ID,
                        () => (
                          <RestaurantCheckoutAuthDrawer
                            returnHref={checkoutHref}
                          />
                        ),
                        {
                          replace: true,
                          title: "Чтобы продолжить авторизуйтесь!",
                          persistentModal: true,
                        },
                      );
                      return;
                    }
                    router.push(checkoutHref);
                  }}
                >
                  Перейти к оформлению
                </Button>
              </div>
            ) : null}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
