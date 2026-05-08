"use client";

import { PageContentShell } from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
import { PageTwoColumnSticky } from "@jet-meal/ui-lib/src/containers/PageTwoColumnSticky/PageTwoColumnSticky";
import { useEffect, useState } from "react";
import { RestaurantBookModal } from "../../components/RestaurantBookModal/RestaurantBookModal";
import { RestaurantCartSidebar } from "../../components/RestaurantCartSidebar/RestaurantCartSidebar";
import { RestaurantDetailHero } from "../../components/RestaurantDetailHero/RestaurantDetailHero";
import { RestaurantMenuBody } from "../../components/RestaurantMenuBody/RestaurantMenuBody";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import { buildCartRecommendationsFromRestaurant } from "../../lib/cartRecommendationsFromRestaurant";
import type { Restaurant } from "../../types/restaurant";

export type RestaurantDetailPageProps = {
  restaurant: Restaurant;
};

function parsePriceRub(raw?: string | null): number {
  if (!raw) {
    return 0;
  }
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return 0;
  }
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

export function RestaurantDetailPage({ restaurant }: RestaurantDetailPageProps) {
  const { lines, setPageRestaurant, setRecommendations, setCheckoutHref } =
    useRestaurantCart();
  const [bookOpen, setBookOpen] = useState(false);

  useEffect(() => {
    setPageRestaurant(restaurant.id, restaurant.name);
    setCheckoutHref(`/restaurant/${restaurant.id}/checkout`);
    return () => {
      setPageRestaurant(null, null);
      setCheckoutHref(null);
      setRecommendations([]);
    };
  }, [
    restaurant.id,
    restaurant.name,
    setPageRestaurant,
    setCheckoutHref,
    setRecommendations,
  ]);

  useEffect(() => {
    const exclude = new Set(lines.map((l) => l.dishId));
    setRecommendations(
      buildCartRecommendationsFromRestaurant(restaurant, exclude),
    );
  }, [restaurant, lines, setRecommendations]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const hash = window.location.hash;
    if (!hash.startsWith("#dish-")) {
      return undefined;
    }
    const dishId = hash.slice(1);
    const t = window.setTimeout(() => {
      const element = document.getElementById(dishId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.style.backgroundColor = "#fff3cd";
        window.setTimeout(() => {
          element.style.backgroundColor = "";
        }, 2000);
      }
    }, 100);
    return () => window.clearTimeout(t);
  }, []);

  const p = restaurant.preview;

  return (
    <PageContentShell>
      <PageTwoColumnSticky
        includeSideSlot
        sideSlotPosition="end"
        main={
          <>
            <RestaurantDetailHero
              restaurant={restaurant}
              onBookClick={() => setBookOpen(true)}
            />
            <RestaurantMenuBody restaurant={restaurant} parsePriceRub={parsePriceRub} />
          </>
        }
        side={<RestaurantCartSidebar />}
      />

      <RestaurantBookModal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        bookHref={p?.bookHref}
        phone={p?.bookingPhone}
      />
    </PageContentShell>
  );
}
