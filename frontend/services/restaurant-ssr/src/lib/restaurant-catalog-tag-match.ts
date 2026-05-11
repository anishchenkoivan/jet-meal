import { getCatalogTagLabel } from "./catalog-tag-options";

/** Подсказки для сопоставления id тега каталога с `cuisineTags` в моках ресторанов. */
const TAG_VALUE_HINTS: Partial<Record<string, readonly string[]>> = {
  japan: ["япон"],
  italian: ["итальян"],
  grill: ["гриль"],
  comfort: ["домаш"],
  ukrainian: ["украин"],
  sushi: ["суши", "ролл"],
  pizza: ["пицц"],
  vegan: ["веган"],
  kids: ["дет"],
  halal: ["халяль"],
  diet: ["диет"],
  spicy: ["остр"],
  soup: ["суп"],
  dessert: ["десерт"],
  low_cal: ["калори"],
  sea: ["море"],
  vegetarian: ["вегет"],
  main_course: ["второе"],
};

/**
 * Для dev-моков: ресторан подходит под выбранные теги каталога,
 * если в `cuisineTags` есть пересечение по подсказкам / подстрокам подписи.
 */
export function restaurantMatchesCatalogTagIds(
  cuisineTags: readonly string[] | undefined,
  selectedValues: string[],
): boolean {
  if (!selectedValues.length) {
    return true;
  }
  const pool = (cuisineTags ?? []).map((t) => t.toLowerCase()).join(" ");
  return selectedValues.every((value) => {
    const hints = TAG_VALUE_HINTS[value];
    if (hints?.some((h) => pool.includes(h))) {
      return true;
    }
    const label = getCatalogTagLabel(value).toLowerCase();
    const parts = label.split(/[\s,]+/).filter((p) => p.length >= 4);
    if (parts.some((p) => pool.includes(p))) {
      return true;
    }
    return false;
  });
}

/** Максимум минут из подписи вида «35–50 мин» (для фильтра «до N минут»). */
export function parseDeliveryTimeLabelMaxMinutes(
  label?: string,
): number | undefined {
  if (!label?.trim()) {
    return undefined;
  }
  const range = label.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (range) {
    return Math.max(Number(range[1]), Number(range[2]));
  }
  const single = label.match(/(\d+)\s*мин/);
  if (single) {
    return Number(single[1]);
  }
  return undefined;
}
