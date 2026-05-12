import type { JetMealDevOrder } from "./jetMealDevOrderTypes";

/** Стартовые заказы в пустом dev localStorage (синхрон с демо-трекингом доставки). */
export const SEED_JET_MEAL_DEV_ORDERS: JetMealDevOrder[] = [
  {
    id: "demo-transit",
    restaurantId: "stolovaya",
    restaurantName: "Столовая на Тверской",
    lines: [{ name: "Комбо-обед", quantity: 1, priceRub: 1840 }],
    totalRub: 1840,
    createdAt: "2026-05-02T14:20:00.000Z",
    deliveryMockState: "in_transit",
  },
  {
    id: "demo-done",
    restaurantId: "stolovaya",
    restaurantName: "Столовая на Тверской",
    lines: [
      { name: "Борщ", quantity: 1, priceRub: 400 },
      { name: "салат Цезарь", quantity: 1, priceRub: 520 },
      { name: "компот", quantity: 1, priceRub: 120 },
    ],
    totalRub: 1840,
    createdAt: "2026-05-02T14:20:00.000Z",
    deliveryMockState: "completed",
    deliveredAtIso: "2026-05-02T15:02:00.000Z",
  },
];
