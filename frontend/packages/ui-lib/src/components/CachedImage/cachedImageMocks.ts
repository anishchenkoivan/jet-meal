import type { CachedImageLoadResult } from "./cache";
import type { CachedImageTransport } from "./cachedImageLoad";
import type { ImageTransportLoadContext } from "./defaultImageTransport";

/** Полноэкранный векторный плейсхолдер (без текста): `object-fit: cover` в контейнере. */
const PLACEHOLDER_SVG_BODY = `
  <rect width="480" height="320" fill="#f0ebe5"/>
  <rect width="480" height="320" fill="#e2dbd4" opacity="0.45"/>
  <rect x="150" y="88" width="180" height="148" rx="10" fill="none" stroke="#c9c0b6" stroke-width="3" stroke-dasharray="14 10"/>
  <circle cx="206" cy="144" r="20" fill="#d8d0c8"/>
  <path d="M248 128 L318 188 L318 220 L188 220 L188 196 Z" fill="#d8d0c8"/>
`;

function placeholderDataUrl(): string {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice">${PLACEHOLDER_SVG_BODY}</svg>`,
    )
  );
}

/** Нет фото / пустой `src` — на весь размер блока как обычное изображение. */
export const NO_PHOTO_PLACEHOLDER_DATA_URL = placeholderDataUrl();

/** Совместимость со сторибуком: тот же плейсхолдер, что и «нет фото». */
export const MOCK_OK_DATA_URL = NO_PHOTO_PLACEHOLDER_DATA_URL;

const DEV_MOCK_DELAY_MS = 100;

export type CachedImageMockKind = "ok" | "error" | "slowOk";

export type CachedImageMockOptions = {
  kind: CachedImageMockKind;
  /** Задержка для `slowOk` / `error` */
  delayMs?: number;
};

/** При `abort` завершаем ожидание без `reject`, чтобы цепочка не давала unhandled rejection. */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const t = globalThis.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        globalThis.clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * Мок-транспорт для Storybook / локальной отладки. Не ходит в сеть при `kind !== slowOk` с реальным fetch —
 * для `slowOk` после задержки всё равно вызывает `realTransport`.
 */
export function createMockImageTransport(
  options: CachedImageMockOptions,
  realTransport: CachedImageTransport,
) {
  return async (
    src: string,
    ctx: ImageTransportLoadContext,
  ): Promise<CachedImageLoadResult> => {
    const delay = options.delayMs ?? 600;
    if (options.kind === "slowOk") {
      await sleep(delay, ctx.signal);
      if (ctx.signal.aborted) {
        return { kind: "error", message: "Aborted" };
      }
      return realTransport(src, ctx);
    }
    await sleep(
      options.kind === "ok" ? Math.min(delay, 200) : delay,
      ctx.signal,
    );
    if (ctx.signal.aborted) {
      return { kind: "error", message: "Aborted" };
    }
    if (options.kind === "error") {
      return { kind: "error", message: "Mock network error" };
    }
    return { kind: "ok", displaySrc: NO_PHOTO_PLACEHOLDER_DATA_URL };
  };
}

/** В development подменяет загрузку плейсхолдером без сетевого `fetch`. */
export function createDevelopmentImageTransport(
  realTransport: CachedImageTransport,
): CachedImageTransport {
  return createMockImageTransport(
    { kind: "ok", delayMs: DEV_MOCK_DELAY_MS },
    realTransport,
  );
}
