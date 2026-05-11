/**
 * Справочник тегов каталога: значения в URL (`tags=`) и в `CatalogMenuItem.dishTags`.
 * Единый источник для фильтров и карточек.
 */
export type CatalogTagOption = {
  readonly value: string;
  readonly label: string;
};

export const CATALOG_TAG_OPTIONS: readonly CatalogTagOption[] = [
  { value: "diet", label: "Диетическое" },
  { value: "spicy", label: "Острое" },
  { value: "japan", label: "Японская кухня" },
  { value: "italian", label: "Итальянская кухня" },
  { value: "kids", label: "Детское меню" },
  { value: "vegan", label: "Веган" },
  { value: "halal", label: "Халяль" },
  { value: "soup", label: "Супы" },
  { value: "grill", label: "Гриль" },
  { value: "dessert", label: "Десерты" },
  { value: "comfort", label: "Домашняя кухня" },
  { value: "low_cal", label: "Низкокалорийное" },
  { value: "sea", label: "Морепродукты" },
  { value: "fastfood", label: "Фастфуд" },
  { value: "snack", label: "Закуски" },
  { value: "vegetarian", label: "Вегетарианское" },
  { value: "main_course", label: "Второе" },
  { value: "sushi", label: "Суши и роллы" },
  { value: "pizza", label: "Пицца" },
] as const;

export const CATALOG_POPULAR_TAG_VALUES: readonly string[] = [
  "diet",
  "spicy",
  "japan",
  "italian",
  "kids",
  "vegan",
  "halal",
  "soup",
  "grill",
  "dessert",
];

export function getCatalogTagLabel(value: string): string {
  const o = CATALOG_TAG_OPTIONS.find((x) => x.value === value);
  return o?.label ?? value;
}
