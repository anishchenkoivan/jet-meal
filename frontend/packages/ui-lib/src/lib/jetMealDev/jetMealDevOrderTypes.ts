export type JetMealDevOrderLine = {
  name: string;
  quantity: number;
  priceRub: number;
};

/** Как отрисовать трекинг доставки для dev-заказа */
export type JetMealDevDeliveryMockState = "in_transit" | "completed";

/**
 * Единый dev-заказ (чекаут ресторана, «Мои заказы», трекинг, кабинет курьера).
 * Хранится в `jet-meal-dev:orders-v1`.
 */
export type JetMealDevOrder = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  lines: JetMealDevOrderLine[];
  totalRub: number;
  createdAt: string;
  deliveryMockState?: JetMealDevDeliveryMockState;
  /** Для экрана «доставлен» */
  deliveredAtIso?: string;
};
