export type CatalogMenuItem = {
  id: string;
  name: string;
  description?: string;
  city: string;
  restaurantId: string;
  restaurantName: string;
  priceLabel: string;
  priceRub?: number;
  images: string[];
  rating?: number;
  category: string;
  /** Теги блюда для фильтра «Фильтры» */
  dishTags?: string[];
  deliveryMinutes?: number;
};

export type CatalogItemFiltersInput = {
  city?: string;
  search?: string;
  restaurantSearch?: string;
  category?: string;
  restaurantId?: string;
  tagIds?: string[];
  deliveryMaxMinutes?: number;
  /** «Сегодня» — укороченное окно доставки в моках */
  deliveryToday?: boolean;
  /** Свободный текст при варианте «укажите желаемое время» (пока без фильтрации в моках) */
  deliveryWish?: string;
};
