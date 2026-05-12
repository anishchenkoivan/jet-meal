"use client";

import cx from "classnames";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

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
  /** Клик по метке (включает интерактивность точек поверх схемы). */
  onMarkerClick?: (id: string) => void;
  /** Подпись к слою (доступность). */
  ariaLabel?: string;
  /** Слой под «плитки» — можно подложить iframe/Leaflet/Yandex. */
  mapBackground?: ReactNode;
  /** Клик по контейнеру (например выбор точки доставки). */
  onSurfaceClick?: (event: MouseEvent<HTMLDivElement>) => void;
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
  onMarkerClick,
  ariaLabel = "Карта с метками",
  mapBackground,
  onSurfaceClick,
  className,
}: GeoMarkersFrameProps) {
  return (
    <div
      className={cx("w-full box-border", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="relative w-full min-h-[200px] [border-radius:var(--ant-border-radius-lg,8px)] overflow-hidden border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-fill-quaternary,rgba(0,0,0,0.02))]"
        {...(onSurfaceClick
          ? {
              onClick: onSurfaceClick,
              onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as unknown as HTMLElement).click();
                }
              },
              role: "button" as const,
              tabIndex: 0,
            }
          : {})}
      >
        {mapBackground ? (
          <div className="absolute inset-0 z-0 [&>*]:w-full [&>*]:h-full [&>*]:border-none [&>*]:block">
            {mapBackground}
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(230_240_250/90%)_0%,rgb(245_245_245/95%)_100%)]"
            aria-hidden
          />
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
              className={cx(
                "absolute z-[1] -translate-x-1/2 -translate-y-full flex flex-col items-center gap-[2px] max-w-[min(120px,40vw)]",
                onMarkerClick
                  ? "pointer-events-auto cursor-pointer"
                  : "pointer-events-none",
              )}
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
              }}
              title={m.label}
              {...(onMarkerClick
                ? {
                    role: "button" as const,
                    tabIndex: 0,
                    onClick: (e: MouseEvent<HTMLSpanElement>) => {
                      e.stopPropagation();
                      onMarkerClick(m.id);
                    },
                    onKeyDown: (e: KeyboardEvent<HTMLSpanElement>) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkerClick(m.id);
                      }
                    },
                  }
                : {})}
            >
              <span
                className="w-[14px] h-[14px] rounded-full [background:var(--ant-color-error,#ff4d4f)] border-2 border-white shadow-[0_1px_4px_rgb(0_0_0/25%)]"
                aria-hidden
              />
              {m.label ? (
                <span className="px-[6px] py-[2px] rounded text-[11px] leading-[1.2] [color:var(--ant-color-text,rgba(0,0,0,0.88))] [background:rgb(255_255_255/92%)] shadow-[0_1px_2px_rgb(0_0_0/12%)] text-center [overflow-wrap:anywhere]">
                  {m.label}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
