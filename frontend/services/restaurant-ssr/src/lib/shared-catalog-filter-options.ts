import type { FilterOption } from "../components/CatalogFilters/CatalogFilters";

/** Город и время доставки — одинаковые опции для каталога блюд и списка ресторанов. */
export const FILTER_CITY_OPTIONS: FilterOption[] = [
  { value: "", label: "Любой" },
  { value: "moscow", label: "Москва" },
  { value: "spb", label: "Санкт-Петербург" },
];

export const FILTER_DELIVERY_TIME_OPTIONS: FilterOption[] = [
  { value: "", label: "Любое" },
  { value: "15", label: "До 15 минут" },
  { value: "30", label: "До 30 минут" },
  { value: "60", label: "До часа" },
  { value: "today", label: "Сегодня" },
];
