"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { CachedImage } from "@jet-meal/ui-lib/src/components/CachedImage/CachedImage";
import cx from "classnames";
import type { CartRecommendationItem } from "../../types/cartRecommendation";
import styles from "./CartRecommendations.module.css";

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
    <section className={cx(styles["host"], className)} aria-label={title}>
      <h3 className={styles["title"]}>{title}</h3>
      <div className={styles["catalog"]}>
        {items.map((item) => {
          const q = quantityForId?.(item.id) ?? 0;
          return (
            <article key={item.id} className={styles["card"]}>
              <div className={styles["thumbWrap"]}>
                <CachedImage
                  src={item.imageUrl?.trim() ? item.imageUrl : ""}
                  alt=""
                  fill
                  className={styles["thumbImage"]}
                  imgClassName={styles["thumbImg"]}
                  aria-hidden
                />
              </div>
              <h4 className={styles["name"]}>{item.name}</h4>
              <p className={styles["price"]}>{item.priceRub} ₽</p>
              <Button
                type="default"
                size="small"
                className={styles["addBtn"]}
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
