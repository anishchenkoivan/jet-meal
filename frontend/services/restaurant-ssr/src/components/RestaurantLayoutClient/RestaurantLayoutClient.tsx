"use client";

import { useDrawer } from "@jet-meal/ui-lib/src/components/DrawerProvider/DrawerProvider";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

/** Закрыть стек дроверов один раз при переходе на страницу оформления (корзина и т.п.). */
function CloseDrawerOnCheckout() {
  const pathname = usePathname();
  const { close } = useDrawer();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname ?? null;
    const nowCheckout =
      Boolean(pathname?.includes("/restaurant/")) &&
      Boolean(pathname?.endsWith("/checkout"));
    const wasCheckout =
      Boolean(prev?.includes("/restaurant/")) &&
      Boolean(prev?.endsWith("/checkout"));
    if (nowCheckout && !wasCheckout) {
      close();
    }
  }, [pathname, close]);

  return null;
}

export function RestaurantLayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <CloseDrawerOnCheckout />
      {children}
    </>
  );
}
