/** Данные одного ресторана для публичного каталога (без запросов в UI). */
export type RestaurantCatalogItem = {
  id: string;
  name: string;
  city: string;
  description?: string;
};
