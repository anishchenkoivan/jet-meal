/**
 * Стек карточек поверх списка: query `ov=p:dish-1,r:demo-1` (верхний — последний).
 * Совместимость: одиночные `p` и `r` без `ov` трактуются как стек из одного кадра.
 */

export type OverlayFrameKind = "p" | "r";

export type OverlayFrame = {
  kind: OverlayFrameKind;
  id: string;
};

function recordToSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        p.append(key, v);
      }
    } else {
      p.set(key, value);
    }
  }
  return p;
}

export function serializeOverlayFrames(frames: OverlayFrame[]): string {
  return frames.map((f) => `${f.kind}:${f.id}`).join(",");
}

export function parseOverlayFramesFromSearchParams(
  sp: URLSearchParams,
): OverlayFrame[] {
  const ov = sp.get("ov")?.trim();
  if (ov) {
    const out: OverlayFrame[] = [];
    for (const seg of ov.split(",")) {
      const idx = seg.indexOf(":");
      if (idx === -1) {
        continue;
      }
      const kind = seg.slice(0, idx) as OverlayFrameKind;
      const id = seg.slice(idx + 1);
      if ((kind === "p" || kind === "r") && id) {
        out.push({ kind, id });
      }
    }
    if (out.length > 0) {
      return out;
    }
  }
  const p = sp.get("p")?.trim();
  if (p) {
    return [{ kind: "p", id: p }];
  }
  const r = sp.get("r")?.trim();
  if (r) {
    return [{ kind: "r", id: r }];
  }
  return [];
}

export function parseOverlayFramesFromRecord(
  raw: Record<string, string | string[] | undefined>,
): OverlayFrame[] {
  return parseOverlayFramesFromSearchParams(recordToSearchParams(raw));
}

/** Список без оверлея: убираем `ov`, `p`, `r`. */
export function buildListHrefWithoutOverlay(
  pathname: string,
  sp: URLSearchParams,
): string {
  const p = new URLSearchParams(sp.toString());
  p.delete("ov");
  p.delete("p");
  p.delete("r");
  const q = p.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/** URL с удалённым верхним кадром (или список, если кадр один). */
export function buildPopOverlayHref(
  pathname: string,
  sp: URLSearchParams,
): string {
  const frames = parseOverlayFramesFromSearchParams(sp);
  if (frames.length <= 1) {
    return buildListHrefWithoutOverlay(pathname, sp);
  }
  const next = frames.slice(0, -1);
  const p = new URLSearchParams(sp.toString());
  p.delete("p");
  p.delete("r");
  p.set("ov", serializeOverlayFrames(next));
  const q = p.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/** Добавить кадр к текущему стеку (например ресторан поверх товара). */
export function buildPushOverlayHref(
  pathname: string,
  sp: URLSearchParams,
  frame: OverlayFrame,
): string {
  const frames = parseOverlayFramesFromSearchParams(sp);
  const next = [...frames, frame];
  const p = new URLSearchParams(sp.toString());
  p.delete("p");
  p.delete("r");
  p.set("ov", serializeOverlayFrames(next));
  const q = p.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/** Одна карточка товара / ресторана поверх списка. */
export function buildSingleOverlayHref(
  pathname: string,
  sp: URLSearchParams,
  frame: OverlayFrame,
): string {
  const p = new URLSearchParams(sp.toString());
  p.delete("p");
  p.delete("r");
  p.set("ov", serializeOverlayFrames([frame]));
  const q = p.toString();
  return q ? `${pathname}?${q}` : pathname;
}
