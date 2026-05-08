import type { CachedImageLoadResult } from "./cache";

export type ImageTransportLoadContext = {
  signal: AbortSignal;
};

/**
 * Загрузка по URL (статика / CDN). По умолчанию — `fetch` + `blob:` для дедупликации и единого пути «проверили — показали».
 * Позже можно заменить на свой слой (signed URL, прокси, офлайн).
 */
export async function defaultImageTransport(
  src: string,
  ctx: ImageTransportLoadContext,
): Promise<CachedImageLoadResult> {
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return { kind: "ok", displaySrc: src };
  }
  try {
    const res = await fetch(src, {
      signal: ctx.signal,
      mode: "cors",
      credentials: "omit",
      cache: "force-cache",
    });
    if (!res.ok) {
      return {
        kind: "error",
        message: `HTTP ${String(res.status)}`,
      };
    }
    const blob = await res.blob();
    const displaySrc = URL.createObjectURL(blob);
    return {
      kind: "ok",
      displaySrc,
      revoke: () => {
        URL.revokeObjectURL(displaySrc);
      },
    };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { kind: "error", message: "Aborted" };
    }
    const message = e instanceof Error ? e.message : "Load failed";
    return { kind: "error", message };
  }
}
