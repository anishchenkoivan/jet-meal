import type { CachedImageLoadResult } from "./cache";
import { deleteCachedImageEntry } from "./cache";
import type { defaultImageTransport } from "./defaultImageTransport";

export type CachedImageTransport = typeof defaultImageTransport;

export function bustCachedImageUrl(src: string): void {
  deleteCachedImageEntry(src);
}

function isAbortedError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

/**
 * Загрузка с сигналом отмены. Промис **всегда** fulfilled с `CachedImageLoadResult` (без `reject`).
 * Нет shared in-flight по URL: у каждого монтирования свой `AbortSignal`.
 */
export function loadCachedImageDisplay(
  src: string,
  signal: AbortSignal,
  transport: CachedImageTransport,
): Promise<CachedImageLoadResult> {
  return transport(src, { signal }).catch((e): CachedImageLoadResult => {
    if (isAbortedError(e)) {
      return { kind: "error", message: "Aborted" };
    }
    const message = e instanceof Error ? e.message : String(e);
    return {
      kind: "error",
      message: message || "Load failed",
    };
  });
}
