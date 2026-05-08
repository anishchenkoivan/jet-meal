/** Демо-данные до подключения API. `demo-transit` / `demo-done` — примеры; любой другой id → не найден. */

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

const BASE: Omit<DeliveryOrderBase, "id"> = {
  number: "JM-10492",
  restaurantName: "Столовая на Тверской",
  addressLine: "Москва, Тверская ул., 7",
  totalRub: 1840,
  placedAt: "2026-05-02T14:20:00.000Z",
};

export function getDeliveryOrderView(orderId: string): DeliveryOrderView {
  if (orderId === "demo-transit") {
    return {
      status: "in_transit",
      order: {
        id: orderId,
        ...BASE,
        etaMinutes: 18,
        courierName: "Алексей",
      },
      route: MOSCOW_ROUTE,
    };
  }
  if (orderId === "demo-done" || orderId === "demo-completed") {
    return {
      status: "completed",
      order: {
        id: orderId === "demo-completed" ? "demo-completed" : "demo-done",
        ...BASE,
        number: "JM-10491",
        deliveredAt: "2026-05-02T15:02:00.000Z",
        itemsSummary: "Борщ, салат Цезарь, компот",
      },
    };
  }
  return { status: "not_found" };
}

export type DemoOrderListItem = {
  id: string;
  number: string;
  summary: string;
  stateLabel: string;
};

/** Список заказов для страницы «Мои заказы» (демо). */
export function listDemoOrders(): DemoOrderListItem[] {
  return [
    {
      id: "demo-transit",
      number: "JM-10492",
      summary: "Столовая на Тверской · в пути",
      stateLabel: "В пути",
    },
    {
      id: "demo-done",
      number: "JM-10491",
      summary: "Столовая на Тверской · доставлен",
      stateLabel: "Доставлен",
    },
  ];
}
