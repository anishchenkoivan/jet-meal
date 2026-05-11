export type RestaurantPreview = {
  images: string[];
  rating?: number;
  description?: string;
  city?: string;
  address?: string;
  /** Подпись для карточки, напр. «30–45 мин» */
  deliveryTimeLabel?: string;
  /** Короткие метки для строки тегов на карточке */
  cuisineTags?: readonly string[];
  bookHref?: string;
  deliveryHref?: string;
  /** Телефон для блока «позвоните» в модалке бронирования */
  bookingPhone?: string;
};

export type RestaurantContentBlock = {
  id: string;
  title: string;
  subtitle?: string | null;
  extraText?: string | null;
  /** Главное превью (первое фото); синхронизируется с {@link images} в админке */
  image?: string | null;
  /** Галерея фото блюда; если не задано — используется только {@link image} */
  images?: string[] | null;
};

export type RestaurantContentDivision = {
  id: string;
  title?: string | null;
  blocks: RestaurantContentBlock[];
};

export type RestaurantMainSection = {
  id: string;
  title?: string | null;
  divisions: RestaurantContentDivision[];
};

export type Restaurant = {
  id: string;
  name: string;
  published?: boolean;
  preview?: RestaurantPreview;
  mainSections?: RestaurantMainSection[];
};

export type RestaurantFiltersInput = {
  city?: string;
  publishedOnly?: boolean;
  search?: string;
  /** id тегов каталога (`tags=` в URL); в prod не уходят в GraphQL, только dev-фильтрация */
  tagIds?: string[];
  deliveryMaxMinutes?: number;
  deliveryToday?: boolean;
  deliveryWish?: string;
};
