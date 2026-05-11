export type WorkflowCoords = { lat: number; lng: number };

export type WorkflowWaypoint = {
  id: string;
  address: string;
  coords: WorkflowCoords;
};

export type WorkflowOffer = {
  id: string;
  number: string;
  fromAddress: string;
  toAddress: string;
  restaurantCoords: WorkflowCoords;
  clientCoords: WorkflowCoords;
  /** Промежуточные остановки (после ресторана, до клиента). */
  waypoints: WorkflowWaypoint[];
  /** Через сколько минут заказ будет готов к выдаче (от «сейчас» на момент показа). */
  readyInMinutes: number;
  readinessLabel: string;
  priceRub: number;
};

const MOSCOW: WorkflowCoords = { lat: 55.751244, lng: 37.618423 };

function offset(base: WorkflowCoords, dLat: number, dLng: number): WorkflowCoords {
  return { lat: base.lat + dLat, lng: base.lng + dLng };
}

/** Предложения рядом с позицией курьера (для dev / демо). */
export function buildWorkflowOffersNear(courier: WorkflowCoords): WorkflowOffer[] {
  const r = courier;
  return [
    {
      id: "wf-offer-1",
      number: "JM-WF01",
      fromAddress: "ул. Тверская, 7 — «Пельменная №1»",
      toAddress: "Новинский бульвар, 8",
      restaurantCoords: offset(r, 0.004, -0.002),
      clientCoords: offset(r, -0.003, 0.005),
      waypoints: [
        {
          id: "wp-1",
          address: "Смоленская площадь, 3 — пункт выдачи партнёра",
          coords: offset(r, 0.001, 0.003),
        },
      ],
      readyInMinutes: 18,
      readinessLabel: "Готовится на кухне",
      priceRub: 420,
    },
    {
      id: "wf-offer-2",
      number: "JM-WF02",
      fromAddress: "Страстной бульвар, 12 — «Суши Дом»",
      toAddress: "Тверская ул., 18",
      restaurantCoords: offset(r, -0.0035, 0.002),
      clientCoords: offset(r, 0.002, -0.004),
      waypoints: [],
      readyInMinutes: 8,
      readinessLabel: "Почти готов к выдаче",
      priceRub: 890,
    },
    {
      id: "wf-offer-3",
      number: "JM-WF03",
      fromAddress: "Большая Дмитровка, 15",
      toAddress: "Петровка, 21",
      restaurantCoords: offset(r, 0.002, 0.006),
      clientCoords: offset(r, 0.005, 0.001),
      waypoints: [
        {
          id: "wp-a",
          address: "Цветной бульвар, 2",
          coords: offset(r, 0.003, 0.004),
        },
        {
          id: "wp-b",
          address: "Садовая-Каретная, 5",
          coords: offset(r, 0.0045, 0.002),
        },
      ],
      readyInMinutes: 25,
      readinessLabel: "В очереди на кухне",
      priceRub: 1150,
    },
  ];
}

export function defaultCourierPosition(): WorkflowCoords {
  return { ...MOSCOW };
}

const R_EARTH_KM = 6371;

export function haversineKm(a: WorkflowCoords, b: WorkflowCoords): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Грубая оценка времени в пути (мин), для UI без маршрутизатора. */
export function estimateTravelMinutes(a: WorkflowCoords, b: WorkflowCoords): number {
  const km = haversineKm(a, b);
  return Math.max(6, Math.round(km * 3.8 + 4));
}

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}
