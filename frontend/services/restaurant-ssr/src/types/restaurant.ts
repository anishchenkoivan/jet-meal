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
  image?: string | null;
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
};