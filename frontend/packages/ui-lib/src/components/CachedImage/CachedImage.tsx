"use client";

/**
 * Кэшированное изображение: `fetch` + in-memory дедуп; пустой `src` — крупная иконка «нет фото» на весь блок.
 * Размеры задаёт контейнер; при `fill` — заполняет родителя с `position: relative` и заданной площадью.
 */

import cx from "classnames";
import type { CSSProperties, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CachedImageLoadResult } from "./cache";
import { bustCachedImageUrl, loadCachedImageDisplay } from "./cachedImageLoad";
import type { CachedImageTransport } from "./cachedImageLoad";
import { createMockImageTransport } from "./cachedImageMocks";
import type { CachedImageMockOptions } from "./cachedImageMocks";
import { defaultImageTransport } from "./defaultImageTransport";
import {
  CachedImageBrokenIcon,
  CachedImageEmptyIcon,
  CachedImageRetryIcon,
  CachedImageSpinnerIcon,
} from "./CachedImageIcons";
import styles from "./CachedImage.module.css";

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
    styles["root"],
    fill && styles["rootFill"],
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
        <div className={styles["stateLayer"]}>
          <div className={styles["iconFull"]}>
            <CachedImageEmptyIcon fillSlot className={styles["stateIcon"]} />
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
        <div className={styles["stateLayer"]}>
          <CachedImageSpinnerIcon
            size={32}
            className={cx(styles["stateIcon"], styles["spinner"])}
          />
        </div>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div
        className={cx(rootCls, styles["rootError"])}
        style={{ ...style, zIndex: 6 }}
        role="img"
        aria-label={alt}
        aria-hidden={ariaHiddenProp}
        onClick={blockParentClick}
      >
        <div className={styles["stateLayer"]}>
          <div className={styles["iconFull"]}>
            <CachedImageBrokenIcon fillSlot className={styles["stateIcon"]} />
          </div>
        </div>
        <div className={styles["errorActions"]} aria-hidden={false}>
          <button
            type="button"
            className={styles["refreshOverlay"]}
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
        className={cx(styles["img"], imgClassName)}
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
