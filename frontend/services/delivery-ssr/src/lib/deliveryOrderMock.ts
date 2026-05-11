/** Демо-данные до подключения API. Заказы — из `jet-meal-dev:orders-v1` (общий слой с рестораном). */

import type { JetMealDevOrder } from "@jet-meal/ui-lib/src/lib/jetMealDev/jetMealDevOrderTypes";
import { readJetMealDevOrdersFromLocalStorage } from "@jet-meal/ui-lib/src/lib/jetMealDev/jetMealDevStorage";
import { SEED_JET_MEAL_DEV_ORDERS } from "@jet-meal/ui-lib/src/lib/jetMealDev/jetMealDevOrdersSeed";

export type DeliveryOrderBase = {
  id: string;
  number: string;
  restaurantName: string;
  addressLine: string;
  totalRub: number;
  placedAt: string;
};

export type DeliveryRoutePoints = {
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  courier: { lat: number; lng: number };
};

export type DeliveryOrderNotFound = { status: "not_found" };

export type DeliveryOrderCompleted = {
  status: "completed";
  order: DeliveryOrderBase & {
    deliveredAt: string;
    itemsSummary: string;
  };
};

export type DeliveryOrderInTransit = {
  status: "in_transit";
  order: DeliveryOrderBase & {
    etaMinutes: number;
    courierName: string;
  };
  route: DeliveryRoutePoints;
};

export type DeliveryOrderView =
  | DeliveryOrderNotFound
  | DeliveryOrderCompleted
  | DeliveryOrderInTransit;

const MOSCOW_ROUTE: DeliveryRoutePoints = {
  pickup: { lat: 55.751244, lng: 37.618423 },
  dropoff: { lat: 55.75824, lng: 37.617513 },
  courier: { lat: 55.7548, lng: 37.61795 },
};

/**
 * Трекинг заказа по id и **единому** списку dev-заказов (`jet-meal-dev:orders-v1`).
 */
export function buildDeliveryOrderView(
  orderId: string,
  orders: JetMealDevOrder[],
): DeliveryOrderView {
  const resolvedSourceId = orderId === "demo-completed" ? "demo-done" : orderId;
  const o = orders.find((x) => x.id === resolvedSourceId);
  if (!o) {
    return { status: "not_found" };
  }

  const displayId = orderId === "demo-completed" ? "demo-completed" : o.id;

  const number =
    o.id === "demo-transit"
      ? "JM-10492"
      : o.id === "demo-done"
        ? "JM-10491"
        : `JM-${o.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}`;

  const state = o.deliveryMockState ?? "completed";

  const base: DeliveryOrderBase = {
    id: displayId,
    number,
    restaurantName: o.restaurantName,
    addressLine: "Москва, Тверская ул., 7",
    totalRub: o.totalRub,
    placedAt: o.createdAt,
  };

  const itemsSummary =
    o.lines
      .map((l) => `${l.name}${l.quantity > 1 ? ` ×${l.quantity}` : ""}`)
      .join(", ") || "Заказ";

  if (state === "in_transit") {
    return {
      status: "in_transit",
      order: {
        ...base,
        etaMinutes: 18,
        courierName: "Алексей",
      },
      route: MOSCOW_ROUTE,
    };
  }

  return {
    status: "completed",
    order: {
      ...base,
      deliveredAt: o.deliveredAtIso ?? "2026-05-02T15:02:00.000Z",
      itemsSummary,
    },
  };
}

/** Без списка заказов (например SSR) — всегда `not_found`. */
export function getDeliveryOrderView(orderId: string): DeliveryOrderView {
  return buildDeliveryOrderView(orderId, []);
}

export type DemoOrderListItem = {
  id: string;
  number: string;
  summary: string;
  stateLabel: string;
};

export function jetMealDevOrdersToDemoListItems(
  orders: JetMealDevOrder[],
): DemoOrderListItem[] {
  return orders.map((o) => {
    const state = o.deliveryMockState ?? "completed";
    const number =
      o.id === "demo-transit"
        ? "JM-10492"
        : o.id === "demo-done"
          ? "JM-10491"
          : `JM-${o.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}`;
    const summary = `${o.restaurantName} · ${
      state === "in_transit" ? "в пути" : "доставлен"
    }`;
    const stateLabel = state === "in_transit" ? "В пути" : "Доставлен";
    return { id: o.id, number, summary, stateLabel };
  });
}

/** Стартовый список до гидрации контекста (совпадает с сидом в localStorage). */
export function defaultDemoOrderListItems(): DemoOrderListItem[] {
  return jetMealDevOrdersToDemoListItems(SEED_JET_MEAL_DEV_ORDERS);
}

/** Прямое чтение из localStorage (без React), например для одноразового синка. */
export function readDeliveryOrdersFromDevStorage(): JetMealDevOrder[] {
  return readJetMealDevOrdersFromLocalStorage();
}
