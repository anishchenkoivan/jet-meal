"use client";

import { GeoMarkersFrame } from "@jet-meal/ui-lib/src/components/GeoMarkersFrame/GeoMarkersFrame";
import { useEffect, useRef, useState } from "react";
import styles from "./YandexDeliveryTrackingMap.module.css";

declare global {
  interface Window {
    ymaps?: {
      ready: (cb: () => void) => void;
      Map: new (
        el: HTMLElement,
        state: { center: number[]; zoom: number; controls?: string[] },
      ) => YandexMapInstance;
      Placemark: new (
        geometry: number[],
        properties?: Record<string, unknown>,
        options?: { preset?: string; zIndex?: number },
      ) => YandexPlacemark;
      route: (
        referencePoints: number[][],
        routeParams?: Record<string, unknown>,
      ) => Promise<YandexRouteResult>;
    };
  }
}

type YandexMapInstance = {
  destroy: () => void;
  geoObjects: {
    add: (o: unknown) => void;
    getBounds: () => number[][] | null;
  };
  setBounds: (
    bounds: number[][],
    options?: { checkZoomRange?: boolean; zoomMargin?: number },
  ) => void;
};

type YandexPlacemark = { geometry: { getCoordinates: () => number[] } };

type YandexRouteResult = {
  getBounds: () => number[][] | null;
};

const SCRIPT_ID = "jet-meal-yandex-maps-2.1";

function loadYandexScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.ymaps) {
    return Promise.resolve();
  }
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing?.dataset["loaded"] === "1") {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
    s.onload = () => {
      s.dataset["loaded"] = "1";
      resolve();
    };
    s.onerror = () => reject(new Error("Yandex Maps script failed"));
    document.head.appendChild(s);
  });
}

export type YandexDeliveryTrackingMapProps = {
  apiKey: string;
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
  courier: { lat: number; lng: number };
  className?: string;
};

/**
 * Карта: маршрут ресторан → адрес доставки и метка курьера (Яндекс.Карты 2.1).
 */
export function YandexDeliveryTrackingMap({
  apiKey,
  pickup,
  dropoff,
  courier,
  className,
}: YandexDeliveryTrackingMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey.trim() || !hostRef.current) {
      return;
    }

    const el = hostRef.current;
    const center: [number, number] = [
      (pickup.lat + dropoff.lat) / 2,
      (pickup.lng + dropoff.lng) / 2,
    ];
    let cancelled = false;

    void (async () => {
      try {
        await loadYandexScript(apiKey);
        if (cancelled || !window.ymaps || !hostRef.current) {
          return;
        }
        await new Promise<void>((r) => {
          window.ymaps!.ready(() => r());
        });
        if (cancelled || !hostRef.current) {
          return;
        }

        const ymaps = window.ymaps!;
        const map = new ymaps.Map(hostRef.current, {
          center,
          zoom: 14,
          controls: ["zoomControl", "geolocationControl"],
        });
        mapRef.current = map;

        const route = await ymaps.route(
          [
            [pickup.lat, pickup.lng],
            [dropoff.lat, dropoff.lng],
          ],
          { routingMode: "auto", mapStateAutoApply: false },
        );
        if (cancelled) {
          return;
        }
        map.geoObjects.add(route);

        const courierPm = new ymaps.Placemark(
          [courier.lat, courier.lng],
          {
            balloonContentHeader: "Курьер",
            balloonContentBody: "Едет к вам по маршруту",
          },
          {
            preset: "islands#darkBlueCircleDotIcon",
            zIndex: 650,
          },
        );
        map.geoObjects.add(courierPm);

        const bounds = map.geoObjects.getBounds();
        if (bounds) {
          map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 28 });
        }
      } catch {
        if (!cancelled) {
          setLoadError("Не удалось построить маршрут или загрузить карту");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch {
          /* noop */
        }
        mapRef.current = null;
      }
      el.innerHTML = "";
    };
  }, [apiKey, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng, courier.lat, courier.lng]);

  const markers = [
    {
      id: "pickup",
      latitude: pickup.lat,
      longitude: pickup.lng,
      label: "Ресторан",
    },
    {
      id: "dropoff",
      latitude: dropoff.lat,
      longitude: dropoff.lng,
      label: "Вы",
    },
    {
      id: "courier",
      latitude: courier.lat,
      longitude: courier.lng,
      label: "Курьер",
    },
  ];
  const frameCenter = {
    latitude: (pickup.lat + dropoff.lat) / 2,
    longitude: (pickup.lng + dropoff.lng) / 2,
  };

  if (!apiKey.trim()) {
    return (
      <div className={[styles["fallback"], className].filter(Boolean).join(" ")}>
        <GeoMarkersFrame
          center={frameCenter}
          markers={markers}
          ariaLabel="Схема маршрута без интерактивной карты"
        />
        <p className={styles["fallbackHint"]}>
          Задайте <code>NEXT_PUBLIC_YANDEX_MAPS_API_KEY</code>, чтобы показать Яндекс.Карты с
          маршрутом и курьером.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={[styles["fallback"], className].filter(Boolean).join(" ")}>
        <GeoMarkersFrame
          center={frameCenter}
          markers={markers}
          ariaLabel="Схема маршрута"
        />
        <p className={styles["fallbackHint"]}>{loadError}</p>
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={[styles["mapHost"], className].filter(Boolean).join(" ")}
      aria-label="Карта доставки"
    />
  );
}
