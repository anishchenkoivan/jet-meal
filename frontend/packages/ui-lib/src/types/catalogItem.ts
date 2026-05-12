/** Элемент списка каталога — нейтральная форма для карточки и запросов. */
export type CatalogItem = {
  id: string;
  name: string;
  city: string;
  address?: string;
  description?: string;
  rating?: number;
  images?: string[];
  bookHref?: string;
  deliveryHref?: string;
  /** Ссылка на страницу с подробностями (карточка, детальный просмотр) */
  detailHref?: string;
  /** Цена одной строкой (например для блюд в каталоге) */
  priceLabel?: string;
};
