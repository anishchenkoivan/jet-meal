"use client";

import { useDrawer } from "@jet-meal/ui-lib/src/components/DrawerProvider/DrawerProvider";
import { DownIcon } from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import { RestaurantCartPanel } from "../RestaurantCartPanel/RestaurantCartPanel";
import { RESTAURANT_CART_DRAWER_ID } from "../restaurantDrawerIds";

export const RESTAURANT_CART_INLINE_MIN_PX = 1292;

function CartBagIcon() {
  return (
    <svg
      className="block"
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

export function RestaurantCartMobileNav() {
  const pathname = usePathname();
  const onRestaurant =
    (pathname?.startsWith("/restaurant/") ?? false) &&
    !(pathname?.endsWith("/checkout") ?? false);
  const [narrow, setNarrow] = useState(false);
  const { open, close, isOpen, currentPersistentModal } = useDrawer();
  const { totalCount } = useRestaurantCart();

  useEffect(() => {
    const mq = window.matchMedia(
      `(max-width: ${RESTAURANT_CART_INLINE_MIN_PX - 1}px)`,
    );
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!narrow && !currentPersistentModal) {
      close();
    }
  }, [narrow, close, currentPersistentModal]);

  const cartOpen = isOpen(RESTAURANT_CART_DRAWER_ID);

  const toggle = useCallback(() => {
    if (cartOpen) {
      close();
    } else {
      open(
        RESTAURANT_CART_DRAWER_ID,
        () => <RestaurantCartPanel hideHeader />,
        {
          replace: true,
        },
      );
    }
  }, [cartOpen, open, close]);

  if (!onRestaurant || !narrow) return null;

  return (
    <button
      type="button"
      className="relative inline-flex items-center justify-center w-10 h-10 p-0 border-none rounded-[10px] cursor-pointer [color:var(--ant-color-text,rgba(0,0,0,0.88))] bg-transparent hover:[background:var(--ant-color-fill-tertiary,rgba(0,0,0,0.04))] hover:[color:var(--ant-color-primary,#1677ff)]"
      onClick={toggle}
      aria-label={cartOpen ? "Закрыть корзину" : "Корзина"}
      aria-expanded={cartOpen}
    >
      {cartOpen ? <DownIcon size={22} className="block" /> : <CartBagIcon />}
      {!cartOpen && totalCount > 0 ? (
        <span className="absolute top-1 right-0.5 min-w-4 h-4 px-1 rounded-[999px] text-[10px] font-bold leading-4 text-center text-white [background:var(--ant-color-primary,#1677ff)]">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      ) : null}
    </button>
  );
}
