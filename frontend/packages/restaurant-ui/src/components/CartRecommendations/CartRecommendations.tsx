"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { CachedImage } from "@jet-meal/ui-lib/src/components/CachedImage/CachedImage";
import cx from "classnames";
import type { CartRecommendationItem } from "../../types/cartRecommendation";

export type CartRecommendationsProps = {
  items: CartRecommendationItem[];
  /** Подпись над каталогом */
  title?: string;
  /** Добавить позицию в корзину */
  onAdd: (item: CartRecommendationItem) => void;
  /** Количество в корзине (для подписи кнопки) */
  quantityForId?: (id: string) => number;
  className?: string;
};

/**
 * Каталог рекомендаций под строками корзины: при широком контейнере —
 * горизонтальный скролл, при узком — вертикальный скролл в 2 или 1 колонку.
 *
 * Container query layout is handled via a named container on the host.
 */
export function CartRecommendations({
  items,
  title = "С этим заказывают",
  onAdd,
  quantityForId,
  className,
}: CartRecommendationsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={cx("w-full min-w-0 @container/cartrec", className)}
      aria-label={title}
    >
      <h3 className="m-0 mb-2 text-[13px] font-semibold [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
        {title}
      </h3>
      {/* Narrow: 2-col vertical scroll. @cartrec ≥420px: horizontal scroll row. @cartrec ≤239px: 1-col */}
      <div className="grid grid-cols-2 gap-2 [max-height:min(220px,32vh)] overflow-x-hidden overflow-y-auto pb-0.5 @[420px]/cartrec:flex @[420px]/cartrec:flex-row @[420px]/cartrec:flex-nowrap @[420px]/cartrec:gap-[10px] @[420px]/cartrec:max-h-none @[420px]/cartrec:overflow-x-auto @[420px]/cartrec:overflow-y-hidden @[420px]/cartrec:pb-1.5 @[239px]/cartrec:grid-cols-1">
        {items.map((item) => {
          const q = quantityForId?.(item.id) ?? 0;
          return (
            <article
              key={item.id}
              className="box-border flex flex-col min-w-0 p-2 border border-[var(--ant-color-border-secondary,#f0f0f0)] [border-radius:var(--ant-border-radius,6px)] [background:var(--ant-color-bg-container,#fff)] @[420px]/cartrec:shrink-0 @[420px]/cartrec:w-[140px]"
            >
              <div className="relative w-full aspect-[4/3] mb-1.5 rounded overflow-hidden [background:var(--ant-color-fill-quaternary,#f5f5f5)]">
                <CachedImage
                  src={item.imageUrl?.trim() ? item.imageUrl : ""}
                  alt=""
                  fill
                  className="absolute inset-0"
                  imgClassName="rounded"
                  aria-hidden
                />
              </div>
              <h4 className="m-0 mb-1 text-xs font-semibold leading-[1.3] [color:var(--ant-color-text,rgba(0,0,0,0.88))] line-clamp-2">
                {item.name}
              </h4>
              <p className="m-0 mb-1.5 text-xs [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
                {item.priceRub} ₽
              </p>
              <Button
                type="default"
                size="small"
                className="mt-auto w-full"
                onClick={() => onAdd(item)}
              >
                {q > 0 ? `В корзине · ${q}` : "Добавить"}
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
