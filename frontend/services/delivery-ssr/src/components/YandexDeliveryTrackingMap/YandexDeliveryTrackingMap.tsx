"use client";

import { GeoMarkersFrame } from "@jet-meal/ui-lib/src/components/GeoMarkersFrame/GeoMarkersFrame";
import { useEffect, useRef, useState } from "react";

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
  if ((window as unknown as { ymaps?: unknown }).ymaps) {
    return Promise.resolve();
  }
  const existing = document.getElementById(
    SCRIPT_ID,
  ) as HTMLScriptElement | null;
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
 * Пока грузится API — сразу показываем статичную схему `GeoMarkersFrame`, без «пустого» блока.
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
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setLoadError(null);
    setMapReady(false);
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
        if (
          cancelled ||
          !(window as { ymaps?: unknown }).ymaps ||
          !hostRef.current
        ) {
          return;
        }
        await new Promise<void>((r) => {
          (
            window as unknown as { ymaps: { ready: (cb: () => void) => void } }
          ).ymaps.ready(() => r());
        });
        if (cancelled || !hostRef.current) {
          return;
        }

        const ymaps = (
          window as unknown as {
            ymaps: {
              Map: new (
                el: HTMLElement,
                state: {
                  center: number[];
                  zoom: number;
                  controls?: string[];
                },
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
        ).ymaps;
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
        if (!cancelled) {
          setMapReady(true);
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
  }, [
    apiKey,
    pickup.lat,
    pickup.lng,
    dropoff.lat,
    dropoff.lng,
    courier.lat,
    courier.lng,
  ]);

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

  const fallbackClass = ["flex flex-col gap-3", className]
    .filter(Boolean)
    .join(" ");

  if (!apiKey.trim()) {
    return (
      <div className={fallbackClass}>
        <GeoMarkersFrame
          center={frameCenter}
          markers={markers}
          ariaLabel="Схема маршрута без интерактивной карты"
        />
        <p className="m-0 text-sm [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
          Задайте <code>NEXT_PUBLIC_YANDEX_MAPS_API_KEY</code>, чтобы показать
          Яндекс.Карты с маршрутом и курьером.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={fallbackClass}>
        <GeoMarkersFrame
          center={frameCenter}
          markers={markers}
          ariaLabel="Схема маршрута"
        />
        <p className="m-0 text-sm [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
          {loadError}
        </p>
      </div>
    );
  }

  const mapHostClass = [
    "absolute inset-0 [background:var(--ant-color-fill-quaternary,#f0f0f0)]",
    mapReady ? "z-[2]" : "z-0",
  ].join(" ");

  return (
    <div className={fallbackClass}>
      <div
        className={[
          "relative w-full min-h-[320px] h-[min(52vh,480px)] rounded-xl overflow-hidden",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <section
          ref={hostRef}
          className={mapHostClass}
          aria-label="Карта доставки"
        />
        {!mapReady ? (
          <div className="absolute inset-0 z-[1] flex flex-col [background:var(--ant-color-bg-container,#fff)]">
            <GeoMarkersFrame
              center={frameCenter}
              markers={markers}
              ariaLabel="Схема маршрута до загрузки карты"
            />
            <p className="m-0 mt-auto px-2 pb-2 text-center text-xs [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              Загрузка карты…
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
