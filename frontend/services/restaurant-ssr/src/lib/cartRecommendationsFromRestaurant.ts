import type { CartRecommendationItem } from "@jet-meal/restaurant-ui";
import type { Restaurant } from "../types/restaurant";
import { primaryBlockImage } from "./contentBlockImages";

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

export function buildCartRecommendationsFromRestaurant(
  restaurant: Restaurant,
  excludeDishIds: ReadonlySet<string>,
): CartRecommendationItem[] {
  const out: CartRecommendationItem[] = [];
  for (const section of restaurant.mainSections ?? []) {
    for (const division of section.divisions) {
      for (const block of division.blocks) {
        if (excludeDishIds.has(block.id)) {
          continue;
        }
        out.push({
          id: block.id,
          name: block.title,
          priceRub: parsePriceRub(block.subtitle),
          imageUrl: primaryBlockImage(block),
        });
      }
    }
  }
  return out;
}
