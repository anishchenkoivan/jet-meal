"use client";

import type { CartRecommendationItem } from "@jet-meal/restaurant-ui";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type RestaurantCartLine = {
  lineId: string;
  dishId: string;
  name: string;
  priceRub: number;
  quantity: number;
};

type RestaurantCartContextValue = {
  restaurantId: string | null;
  restaurantName: string | null;
  /** Текущая страница ресторана (для рекомендаций при пустой корзине) */
  pageRestaurantId: string | null;
  pageRestaurantName: string | null;
  lines: RestaurantCartLine[];
  addOne: (args: {
    restaurantId: string;
    restaurantName: string;
    dishId: string;
    name: string;
    priceRub: number;
  }) => void;
  setQuantity: (dishId: string, quantity: number) => void;
  lineForDish: (dishId: string) => RestaurantCartLine | undefined;
  totalCount: number;
  totalRub: number;
  clearCart: () => void;
  setPageRestaurant: (id: string | null, name: string | null) => void;
  recommendationItems: CartRecommendationItem[];
  setRecommendations: (items: CartRecommendationItem[]) => void;
  checkoutHref: string | null;
  setCheckoutHref: (href: string | null) => void;
};

const RestaurantCartContext = createContext<RestaurantCartContextValue | null>(
  null,
);

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `l_${Math.random().toString(36).slice(2, 11)}`;

export function RestaurantCartProvider({ children }: { children: ReactNode }) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [pageRestaurantId, setPageRestaurantId] = useState<string | null>(null);
  const [pageRestaurantName, setPageRestaurantName] = useState<string | null>(
    null,
  );
  const [lines, setLines] = useState<RestaurantCartLine[]>([]);
  const [recommendationItems, setRecommendations] = useState<
    CartRecommendationItem[]
  >([]);
  const [checkoutHref, setCheckoutHref] = useState<string | null>(null);

  const setPageRestaurant = useCallback(
    (id: string | null, name: string | null) => {
      setPageRestaurantId(id);
      setPageRestaurantName(name);
    },
    [],
  );

  const addOne = useCallback(
    ({
      restaurantId: rid,
      restaurantName: rname,
      dishId,
      name,
      priceRub,
    }: {
      restaurantId: string;
      restaurantName: string;
      dishId: string;
      name: string;
      priceRub: number;
    }) => {
      setLines((prev) => {
        if (prev.length && restaurantId && restaurantId !== rid) {
          return [
            {
              lineId: genId(),
              dishId,
              name,
              priceRub,
              quantity: 1,
            },
          ];
        }
        const existing = prev.find((l) => l.dishId === dishId);
        if (existing) {
          return prev.map((l) =>
            l.dishId === dishId ? { ...l, quantity: l.quantity + 1 } : l,
          );
        }
        return [
          ...prev,
          { lineId: genId(), dishId, name, priceRub, quantity: 1 },
        ];
      });
      setRestaurantId(rid);
      setRestaurantName(rname);
    },
    [restaurantId],
  );

  const setQuantity = useCallback((dishId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) {
        return prev.filter((l) => l.dishId !== dishId);
      }
      return prev.map((l) => (l.dishId === dishId ? { ...l, quantity } : l));
    });
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setRestaurantId(null);
    setRestaurantName(null);
  }, []);

  const lineForDish = useCallback(
    (dishId: string) => lines.find((l) => l.dishId === dishId),
    [lines],
  );

  const totalCount = useMemo(
    () => lines.reduce((s, l) => s + l.quantity, 0),
    [lines],
  );

  const totalRub = useMemo(
    () => lines.reduce((s, l) => s + l.priceRub * l.quantity, 0),
    [lines],
  );

  const value = useMemo<RestaurantCartContextValue>(
    () => ({
      restaurantId,
      restaurantName,
      pageRestaurantId,
      pageRestaurantName,
      lines,
      addOne,
      setQuantity,
      lineForDish,
      totalCount,
      totalRub,
      clearCart,
      setPageRestaurant,
      recommendationItems,
      setRecommendations,
      checkoutHref,
      setCheckoutHref,
    }),
    [
      restaurantId,
      restaurantName,
      pageRestaurantId,
      pageRestaurantName,
      lines,
      addOne,
      setQuantity,
      lineForDish,
      totalCount,
      totalRub,
      clearCart,
      setPageRestaurant,
      recommendationItems,
      checkoutHref,
    ],
  );

  return (
    <RestaurantCartContext.Provider value={value}>
      {children}
    </RestaurantCartContext.Provider>
  );
}

export function useRestaurantCart() {
  const ctx = useContext(RestaurantCartContext);
  if (!ctx) {
    throw new Error(
      "useRestaurantCart must be used within RestaurantCartProvider",
    );
  }
  return ctx;
}
