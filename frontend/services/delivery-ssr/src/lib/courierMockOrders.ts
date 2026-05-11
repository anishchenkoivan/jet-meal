import type { JetMealDevOrder } from "@jet-meal/ui-lib/src/lib/jetMealDev/jetMealDevOrderTypes";

export type CourierWorkStatus = "none" | "searching" | "on_order";

export type CourierOrderRow = {
  id: string;
  number: string;
  completedAt: string;
  route: string;
  amountRub: number;
};

/** Завершённые заказы из общего dev-слоя `jet-meal-dev:orders-v1`. */
export function courierRowsFromJetMealDevOrders(
  orders: JetMealDevOrder[],
): CourierOrderRow[] {
  return orders
    .filter((o) => (o.deliveryMockState ?? "completed") === "completed")
    .map((o) => ({
      id: o.id,
      number:
        o.id === "demo-done"
          ? "JM-10491"
          : o.id === "demo-transit"
            ? "JM-10492"
            : `JM-${o.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}`,
      completedAt: o.deliveredAtIso ?? o.createdAt,
      route: `${o.restaurantName} → клиент`,
      amountRub: o.totalRub,
    }));
}
