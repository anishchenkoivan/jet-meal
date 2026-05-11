"use client";

import { JetMealDevCartProvider } from "@jet-meal/ui-lib/src/context/JetMealDevCartContext";
import { useMemo, type ReactNode } from "react";
import { useRestaurantCart } from "../../context/restaurant-cart-context";

export function RestaurantDevCartBridge({ children }: { children: ReactNode }) {
  const cart = useRestaurantCart();
  const value = useMemo(
    () => ({
      lines: cart.lines.map((l) => ({
        name: l.name,
        quantity: l.quantity,
        priceRub: l.priceRub,
      })),
      totalRub: cart.totalRub,
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
    }),
    [cart.lines, cart.totalRub, cart.restaurantId, cart.restaurantName],
  );
  return <JetMealDevCartProvider value={value}>{children}</JetMealDevCartProvider>;
}
