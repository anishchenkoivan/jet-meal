"use client";

import { DownIcon } from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { useSingleMobileDrawer } from "@jet-meal/ui-lib/src/components/SingleMobileDrawer/SingleMobileDrawerProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import { RESTAURANT_MOBILE_DRAWER_CART_KEY } from "../RestaurantMobileDrawerHost/restaurantMobileDrawerKeys";
import styles from "./RestaurantCartMobileNav.module.css";

/** Брейкпункт совпадает с появлением правой колонки корзины на странице ресторана. */
export const RESTAURANT_CART_INLINE_MIN_PX = 992;

function CartBagIcon() {
  return (
    <svg
      className={styles["iconSvg"]}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  );
}

/**
 * Узкий экран + страница ресторана: иконка корзины в шапке.
 * Один общий дроуер с меню: повторный клик закрывает, меню заменяет корзину и наоборот.
 */
export function RestaurantCartMobileNav() {
  const pathname = usePathname();
  const onRestaurant =
    (pathname?.startsWith("/restaurant/") ?? false) &&
    !(pathname?.endsWith("/checkout") ?? false);
  const [narrow, setNarrow] = useState(false);
  const { toggle, close, isActive } = useSingleMobileDrawer();
  const { totalCount } = useRestaurantCart();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mq = window.matchMedia(
      `(max-width: ${RESTAURANT_CART_INLINE_MIN_PX - 1}px)`,
    );
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!narrow) {
      close();
    }
  }, [narrow, close]);

  if (!onRestaurant || !narrow) {
    return null;
  }

  const cartOpen = isActive(RESTAURANT_MOBILE_DRAWER_CART_KEY);

  return (
    <button
      type="button"
      className={styles["iconBtn"]}
      onClick={() => toggle(RESTAURANT_MOBILE_DRAWER_CART_KEY)}
      aria-label={cartOpen ? "Закрыть корзину" : "Корзина"}
      aria-expanded={cartOpen}
    >
      {cartOpen ? (
        <DownIcon size={22} className={styles["iconSvg"]} />
      ) : (
        <CartBagIcon />
      )}
      {!cartOpen && totalCount > 0 ? (
        <span className={styles["dot"]}>{totalCount > 99 ? "99+" : totalCount}</span>
      ) : null}
    </button>
  );
}
