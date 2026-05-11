import type { RestaurantContentBlock } from "../types/restaurant";

/** Нормализованный список URL фото позиции меню (учитывает устаревшее поле `image`). */
export function getContentBlockImages(block: RestaurantContentBlock): string[] {
  const fromArr =
    block.images?.filter((x) => typeof x === "string" && x.trim()) ?? [];
  if (fromArr.length > 0) {
    return fromArr;
  }
  return block.image?.trim() ? [block.image.trim()] : [];
}

/** Первое фото для карточки в меню и корзине. */
export function primaryBlockImage(
  block: RestaurantContentBlock,
): string | undefined {
  const imgs = getContentBlockImages(block);
  return imgs[0];
}

export function patchBlockImagesFromUrls(
  urls: string[],
): Pick<RestaurantContentBlock, "images" | "image"> {
  const cleaned = urls.map((s) => s.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return { images: [], image: null };
  }
  return { images: cleaned, image: cleaned[0] ?? null };
}
