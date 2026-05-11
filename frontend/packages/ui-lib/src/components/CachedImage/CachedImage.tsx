"use client";

/**
 * Кэшированное изображение: `fetch` + in-memory дедуп; пустой `src` — крупная иконка «нет фото» на весь блок.
 * Размеры задаёт контейнер; при `fill` — заполняет родителя с `position: relative` и заданной площадью.
 */

import cx from "classnames";
import type { CSSProperties, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CachedImageBrokenIcon,
  CachedImageEmptyIcon,
  CachedImageRetryIcon,
  CachedImageSpinnerIcon,
} from "./CachedImageIcons";
import type { CachedImageLoadResult } from "./cache";
import type { CachedImageTransport } from "./cachedImageLoad";
import { bustCachedImageUrl, loadCachedImageDisplay } from "./cachedImageLoad";
import type { CachedImageMockOptions } from "./cachedImageMocks";
import { createMockImageTransport } from "./cachedImageMocks";
import { defaultImageTransport } from "./defaultImageTransport";

type Phase =
  | { kind: "loading" }
  | { kind: "ready"; displaySrc: string }
  | { kind: "error" }
  | { kind: "empty" };

export type CachedImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Класс для внутреннего `img` (например только скругление) */
  imgClassName?: string;
  style?: CSSProperties;
  /** Родитель с `position: relative` и заданными размерами — картинка заполняет его */
  fill?: boolean;
  objectFit?: CSSProperties["objectFit"];
  "aria-hidden"?: boolean | "true" | "false";
  /** После ошибки основного `src` */
  fallbackSrc?: string;
  /** Как у `<img loading>` */
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  /** Свой загрузчик вместо `fetch` (подпишите URL позже на своём origin) */
  transport?: CachedImageTransport;
  /** Мок задержки / ошибки — Storybook и локальная отладка */
  mockOptions?: CachedImageMockOptions;
};

export function CachedImage({
  src,
  alt,
  className,
  imgClassName,
  style,
  fill,
  objectFit = "cover",
  fallbackSrc,
  loading = "lazy",
  fetchPriority = "auto",
  transport,
  mockOptions,
  "aria-hidden": ariaHiddenProp,
}: CachedImageProps) {
  const [phase, setPhase] = useState<Phase>(() =>
    !src.trim() ? { kind: "empty" } : { kind: "loading" },
  );
  const [retryToken, setRetryToken] = useState(0);

  const effectiveTransport = useMemo<CachedImageTransport>(() => {
    if (transport) {
      return transport;
    }
    const base = defaultImageTransport;
    if (mockOptions) {
      return createMockImageTransport(mockOptions, base);
    }
    return base;
  }, [mockOptions, transport]);

  useEffect(() => {
    if (!src.trim()) {
      setPhase({ kind: "empty" });
      return;
    }

    let cancelled = false;
    const ac = new AbortController();
    setPhase({ kind: "loading" });

    const apply = (r: CachedImageLoadResult) => {
      if (cancelled) {
        return;
      }
      if (r.kind === "ok") {
        setPhase({ kind: "ready", displaySrc: r.displaySrc });
        return;
      }
      setPhase({ kind: "error" });
    };

    const run = async () => {
      try {
        const primary = await loadCachedImageDisplay(
          src,
          ac.signal,
          effectiveTransport,
        );
        if (
          cancelled ||
          (primary.kind === "error" && primary.message === "Aborted")
        ) {
          return;
        }
        if (primary.kind === "ok") {
          apply(primary);
          return;
        }
        if (fallbackSrc?.trim()) {
          const secondary = await loadCachedImageDisplay(
            fallbackSrc,
            ac.signal,
            effectiveTransport,
          );
          if (
            cancelled ||
            (secondary.kind === "error" && secondary.message === "Aborted")
          ) {
            return;
          }
          if (secondary.kind === "ok") {
            apply(secondary);
            return;
          }
          setPhase({ kind: "error" });
          return;
        }
        apply(primary);
      } catch {
        if (!cancelled) {
          setPhase({ kind: "error" });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [src, fallbackSrc, effectiveTransport, retryToken]);

  const onRetry = useCallback(() => {
    bustCachedImageUrl(src);
    if (fallbackSrc?.trim()) {
      bustCachedImageUrl(fallbackSrc);
    }
    setRetryToken((t) => t + 1);
  }, [src, fallbackSrc]);

  /** Не всплывать на родителя (например клик по карточке). */
  const blockParentClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const rootCls = cx(
    "relative block w-full h-full min-w-0 min-h-0 overflow-hidden [background-color:var(--ant-color-fill-quaternary,rgba(0,0,0,0.04))]",
    fill && "absolute inset-0 w-full h-full",
    className,
  );

  if (phase.kind === "empty") {
    return (
      <div
        className={rootCls}
        style={style}
        role="img"
        aria-label={alt}
        aria-hidden={ariaHiddenProp}
        onClick={blockParentClick}
      >
        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-[10px] [color:var(--ant-color-text-quaternary,rgba(0,0,0,0.35))] [background-color:var(--ant-color-fill-quaternary,rgba(0,0,0,0.04))]">
          <div className="flex-[0_0_auto] w-[min(48vmin,100%)] h-[min(48vmin,100%)] max-w-[min(320px,100%)] max-h-[min(320px,100%)] min-w-[72px] min-h-[72px] [color:var(--ant-color-text-tertiary,rgba(0,0,0,0.42))] [&_svg]:block [&_svg]:w-full [&_svg]:h-full">
            <CachedImageEmptyIcon fillSlot className="[color:var(--ant-color-text-tertiary,rgba(0,0,0,0.45))]" />
          </div>
        </div>
      </div>
    );
  }

  if (phase.kind === "loading") {
    return (
      <div
        className={rootCls}
        style={style}
        aria-busy="true"
        aria-label={alt}
        aria-hidden={ariaHiddenProp}
        onClick={blockParentClick}
      >
        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-[10px] [color:var(--ant-color-text-quaternary,rgba(0,0,0,0.35))] [background-color:var(--ant-color-fill-quaternary,rgba(0,0,0,0.04))]">
          <CachedImageSpinnerIcon
            size={32}
            className="[color:var(--ant-color-text-tertiary,rgba(0,0,0,0.45))] [animation:jet-spin_0.75s_linear_infinite]"
          />
        </div>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div
        className={cx(rootCls, "overflow-visible")}
        style={{ ...style, zIndex: 6 }}
        role="img"
        aria-label={alt}
        aria-hidden={ariaHiddenProp}
        onClick={blockParentClick}
      >
        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-[10px] [color:var(--ant-color-text-quaternary,rgba(0,0,0,0.35))] [background-color:var(--ant-color-fill-quaternary,rgba(0,0,0,0.04))]">
          <div className="flex-[0_0_auto] w-[min(48vmin,100%)] h-[min(48vmin,100%)] max-w-[min(320px,100%)] max-h-[min(320px,100%)] min-w-[72px] min-h-[72px] [color:var(--ant-color-text-tertiary,rgba(0,0,0,0.42))] [&_svg]:block [&_svg]:w-full [&_svg]:h-full">
            <CachedImageBrokenIcon fillSlot className="[color:var(--ant-color-text-tertiary,rgba(0,0,0,0.45))]" />
          </div>
        </div>
        <div className="absolute inset-0 z-[8] flex items-center justify-center p-2 pointer-events-none" aria-hidden={false}>
          <button
            type="button"
            className="relative z-[1] inline-flex items-center gap-[6px] px-[14px] py-2 text-[13px] leading-[1.4] font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))] cursor-pointer pointer-events-auto [background:rgb(255_255_255/0.96)] border [border-color:var(--ant-color-border,#d9d9d9)] [border-radius:var(--ant-border-radius-lg,8px)] shadow-[0_2px_12px_rgb(0_0_0/14%)] hover:[color:var(--ant-color-primary,#1677ff)] hover:[border-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2"
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            aria-label="Обновить изображение"
          >
            <CachedImageRetryIcon size={16} />
            <span>Обновить</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={rootCls}
      style={style}
      aria-hidden={ariaHiddenProp}
      onClick={blockParentClick}
    >
      <img
        className={cx(
          "block h-full w-full object-cover object-center",
          imgClassName,
        )}
        src={phase.displaySrc}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        draggable={false}
        style={{ objectFit }}
      />
    </div>
  );
}
