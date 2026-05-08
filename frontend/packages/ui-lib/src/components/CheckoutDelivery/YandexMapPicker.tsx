"use client";

import { GeoMarkersFrame } from "../GeoMarkersFrame/GeoMarkersFrame";
import styles from "./YandexMapPicker.module.css";
import { useEffect, useRef, useState } from "react";

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
        options?: { draggable?: boolean; preset?: string },
      ) => YandexPlacemark;
    };
  }
}

type YandexMapInstance = {
  destroy: () => void;
  setCenter: (center: number[], zoom?: number) => void;
  geoObjects: { add: (o: YandexPlacemark) => void };
  events: { add: (name: string, fn: (e: YandexMapClickEvent) => void) => void };
};

type YandexPlacemark = {
  geometry: { setCoordinates: (c: number[]) => void; getCoordinates: () => number[] };
  events: { add: (name: string, fn: () => void) => void };
};

type YandexMapClickEvent = { get: (k: string) => number[] };

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

export type YandexMapPickerProps = {
  apiKey: string;
  latitude: number;
  longitude: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
  className?: string;
};

/**
 * Интерактивная карта Яндекса: клик и перетаскивание метки задают координаты.
 */
export function YandexMapPicker({
  apiKey,
  latitude,
  longitude,
  onCoordinatesChange,
  className,
}: YandexMapPickerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const placemarkRef = useRef<YandexPlacemark | null>(null);
  const onCoordsRef = useRef(onCoordinatesChange);
  const [loadError, setLoadError] = useState<string | null>(null);

  onCoordsRef.current = onCoordinatesChange;

  useEffect(() => {
    if (!apiKey.trim() || !hostRef.current) {
      return;
    }

    const el = hostRef.current;
    const initLat = latitude;
    const initLng = longitude;
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
        const center: [number, number] = [initLat, initLng];
        const map = new ymaps.Map(hostRef.current, {
          center,
          zoom: 16,
          controls: ["zoomControl"],
        });
        mapRef.current = map;

        const placemark = new ymaps.Placemark(
          center,
          {},
          { draggable: true, preset: "islands#redDotIcon" },
        );
        placemarkRef.current = placemark;
        map.geoObjects.add(placemark);

        placemark.events.add("dragend", () => {
          const c = placemark.geometry.getCoordinates() as [number, number];
          onCoordsRef.current(c[0], c[1]);
        });

        map.events.add("click", (e: YandexMapClickEvent) => {
          const c = e.get("coords") as [number, number];
          placemark.geometry.setCoordinates(c);
          onCoordsRef.current(c[0], c[1]);
        });
      } catch {
        if (!cancelled) {
          setLoadError("Не удалось загрузить Яндекс.Карты");
        }
      }
    })();

    return () => {
      cancelled = true;
      placemarkRef.current = null;
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
  }, [apiKey]);

  useEffect(() => {
    const pm = placemarkRef.current;
    const map = mapRef.current;
    if (!pm || !map) {
      return;
    }
    pm.geometry.setCoordinates([latitude, longitude]);
    map.setCenter([latitude, longitude], 16);
  }, [latitude, longitude]);

  if (!apiKey.trim()) {
    return (
      <div className={[styles["fallback"], className].filter(Boolean).join(" ")}>
        <GeoMarkersFrame
          center={{ latitude, longitude }}
          markers={[
            {
              id: "p",
              latitude,
              longitude,
              label: "Точка",
            },
          ]}
          ariaLabel="Превью карты без API-ключа"
        />
        <p className={styles["fallbackHint"]}>
          Задайте переменную окружения{" "}
          <code>NEXT_PUBLIC_YANDEX_MAPS_API_KEY</code>, чтобы включить интерактивную карту
          Яндекса.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={[styles["fallback"], className].filter(Boolean).join(" ")}>
        <GeoMarkersFrame
          center={{ latitude, longitude }}
          markers={[{ id: "p", latitude, longitude, label: "Точка" }]}
          ariaLabel="Превью карты"
        />
        <p className={styles["fallbackHint"]}>{loadError}</p>
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={[styles["mapHost"], className].filter(Boolean).join(" ")}
      aria-label="Карта Яндекса"
    />
  );
}
