/** Позиция для блока «С этим заказывают» в корзине доставки. */
export type CartRecommendationItem = {
  id: string;
  name: string;
  priceRub: number;
  imageUrl?: string | null;
};
