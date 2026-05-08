"use client";

import { StickyAsidePanel } from "@jet-meal/ui-lib/src/components/StickyAsidePanel/StickyAsidePanel";
import { RestaurantCartPanel } from "../RestaurantCartPanel/RestaurantCartPanel";

/** Корзина в потоке страницы ресторана (колонка справа от меню). */
export function RestaurantCartSidebar() {
  return (
    <StickyAsidePanel ariaLabel="Корзина">
      <RestaurantCartPanel />
    </StickyAsidePanel>
  );
}
