/**
 * In-memory cache: один запрос на URL, повторные монтирования получают тот же результат.
 * Позже сюда можно подставить IndexedDB / SW / свой origin без смены API компонента.
 */

export type CachedImageLoadOk = {
  kind: "ok";
  /** `blob:` URL или исходный `http(s):` — что передать в `img[src]` */
  displaySrc: string;
  /** Если `displaySrc` — `blob:`, вызвать при вытеснении из кэша */
  revoke?: () => void;
};

export type CachedImageLoadErr = {
  kind: "error";
  message: string;
};

export type CachedImageLoadResult = CachedImageLoadOk | CachedImageLoadErr;

type Entry = {
  promise: Promise<CachedImageLoadResult>;
  revoke?: () => void;
};

const entries = new Map<string, Entry>();

export function clearCachedImageMemoryCache(): void {
  for (const e of entries.values()) {
    e.revoke?.();
  }
  entries.clear();
}

export function getCachedImageEntry(src: string): Entry | undefined {
  return entries.get(src);
}

export function setCachedImageEntry(src: string, entry: Entry): void {
  entries.set(src, entry);
}

export function deleteCachedImageEntry(src: string): void {
  const e = entries.get(src);
  e?.revoke?.();
  entries.delete(src);
}
