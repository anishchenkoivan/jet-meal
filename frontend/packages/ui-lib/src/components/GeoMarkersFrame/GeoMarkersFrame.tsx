"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import styles from "./GeoMarkersFrame.module.css";

/** Географическая метка в WGS-84; в GQL обычно передают как `input GeoPointInput { lat, lng }` или отдельные поля. */
export type GeoMarkerModel = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
};

export type GeoMarkersFrameProps = {
  /** Центр карты (WGS-84). */
  center: { latitude: number; longitude: number };
  markers: GeoMarkerModel[];
  /** Подпись к слою (доступность). */
  ariaLabel?: string;
  /** Слой под «плитки» — можно подложить iframe/Leaflet/Yandex. */
  mapBackground?: ReactNode;
  /** Клик по контейнеру (например выбор точки доставки). */
  onSurfaceClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
};

/** Локальная линейная проекция в доли 0..1 внутри кадра (для абстрактного превью). */
function projectTo01(
  latitude: number,
  longitude: number,
  centerLat: number,
  centerLng: number,
  scale = 0.12,
) {
  const dx = longitude - centerLng;
  const dy = latitude - centerLat;
  const x = 0.5 + dx / scale;
  const y = 0.5 - dy / scale;
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  };
}

export function GeoMarkersFrame({
  center,
  markers,
  ariaLabel = "Карта с метками",
  mapBackground,
  onSurfaceClick,
  className,
}: GeoMarkersFrameProps) {
  return (
    <div
      className={cx(styles["frame"], className)}
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className={styles["surface"]}
        onClick={onSurfaceClick}
        onKeyDown={
          onSurfaceClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as unknown as HTMLElement).click();
                }
              }
            : undefined
        }
        role={onSurfaceClick ? "button" : undefined}
        tabIndex={onSurfaceClick ? 0 : undefined}
      >
        {mapBackground ? (
          <div className={styles["bg"]}>{mapBackground}</div>
        ) : (
          <div className={styles["fallbackBg"]} aria-hidden />
        )}
        {markers.map((m) => {
          const { x, y } = projectTo01(
            m.latitude,
            m.longitude,
            center.latitude,
            center.longitude,
          );
          return (
            <span
              key={m.id}
              className={styles["pin"]}
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
              }}
              title={m.label}
            >
              <span className={styles["pinDot"]} aria-hidden />
              {m.label ? (
                <span className={styles["pinLabel"]}>{m.label}</span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
