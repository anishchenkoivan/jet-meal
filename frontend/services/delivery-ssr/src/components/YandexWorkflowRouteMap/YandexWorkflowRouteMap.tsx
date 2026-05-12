"use client";

import { GeoMarkersFrame } from "@jet-meal/ui-lib/src/components/GeoMarkersFrame/GeoMarkersFrame";
import { useEffect, useRef, useState } from "react";
import type { WorkflowCoords } from "../../lib/courierWorkflowMock";

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

export type YandexWorkflowRouteMapProps = {
  apiKey: string;
  /** Точки маршрута по порядку (широта, долгота). */
  routePoints: WorkflowCoords[];
  /** Дополнительные метки (курьер и т.д.). */
  extraMarkers?: { id: string; coords: WorkflowCoords; label: string }[];
  className?: string;
};

export function YandexWorkflowRouteMap({
  apiKey,
  routePoints,
  extraMarkers = [],
  className,
}: YandexWorkflowRouteMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const refPoints = routePoints.map((p) => [p.lat, p.lng] as [number, number]);
  const frameCenter =
    routePoints.length > 0
      ? {
          latitude:
            routePoints.reduce((s, p) => s + p.lat, 0) / routePoints.length,
          longitude:
            routePoints.reduce((s, p) => s + p.lng, 0) / routePoints.length,
        }
      : { latitude: 55.75, longitude: 37.62 };

  const markers = [
    ...routePoints.map((p, i) => ({
      id: `rp-${i}`,
      latitude: p.lat,
      longitude: p.lng,
      label: i === 0 ? "А" : i === routePoints.length - 1 ? "Б" : `${i + 1}`,
    })),
    ...extraMarkers.map((m) => ({
      id: m.id,
      latitude: m.coords.lat,
      longitude: m.coords.lng,
      label: m.label,
    })),
  ];

  const routeKey = routePoints
    .map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`)
    .join(";");
  const extraKey = extraMarkers
    .map(
      (m) =>
        `${m.id}:${m.coords.lat.toFixed(5)},${m.coords.lng.toFixed(5)}:${m.label}`,
    )
    .join("|");

  useEffect(() => {
    setLoadError(null);
    setMapReady(false);
    if (!apiKey.trim() || !hostRef.current || refPoints.length < 2) {
      return;
    }

    const el = hostRef.current;
    const center: [number, number] = [
      frameCenter.latitude,
      frameCenter.longitude,
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
              ) => unknown;
              route: (
                referencePoints: number[][],
                routeParams?: Record<string, unknown>,
              ) => Promise<YandexRouteResult>;
            };
          }
        ).ymaps;
        const map = new ymaps.Map(hostRef.current, {
          center,
          zoom: 13,
          controls: ["zoomControl"],
        });
        mapRef.current = map;

        const route = await ymaps.route(refPoints, {
          routingMode: "auto",
          mapStateAutoApply: false,
        });
        if (cancelled) {
          return;
        }
        map.geoObjects.add(route);

        for (const m of extraMarkers) {
          const pm = new ymaps.Placemark(
            [m.coords.lat, m.coords.lng],
            { balloonContentBody: m.label },
            { preset: "islands#blueCircleDotIcon", zIndex: 700 },
          );
          map.geoObjects.add(pm);
        }

        const bounds = map.geoObjects.getBounds();
        if (bounds) {
          map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 32 });
        }
        if (!cancelled) {
          setMapReady(true);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Не удалось построить маршрут");
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
  }, [apiKey, routeKey, extraKey]);

  const fallbackClass = ["flex flex-col gap-3", className]
    .filter(Boolean)
    .join(" ");

  if (!apiKey.trim() || routePoints.length < 2) {
    return (
      <div className={fallbackClass}>
        <GeoMarkersFrame
          center={frameCenter}
          markers={markers}
          ariaLabel="Схема маршрута"
        />
        {!apiKey.trim() ? (
          <p className="m-0 text-sm [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
            Задайте <code>NEXT_PUBLIC_YANDEX_MAPS_API_KEY</code> для маршрута на
            карте.
          </p>
        ) : null}
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
          "relative w-full min-h-[280px] h-[min(48vh,420px)] rounded-xl overflow-hidden",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <section
          ref={hostRef}
          className={mapHostClass}
          aria-label="Карта маршрута"
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
