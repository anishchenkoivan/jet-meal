"use client";

import { CachedImage } from "../CachedImage/CachedImage";
import { DeleteIcon, LeftIcon, PlusIcon, RightIcon } from "../Icons/Icons";
import { Button } from "antd";
import cx from "classnames";
import { useCallback, useState } from "react";
import styles from "./ImageCarousel.module.css";

export type ImageCarouselProps = {
  images: string[];
  /** Подпись для `img[alt]` и префикса ключей */
  label: string;
  /** Префикс стабильных ключей (например id ресторана) */
  keyPrefix: string;
  /** Заполнить высоту колонки (рядом с текстом в карточке) */
  fillColumn?: boolean;
  /** Ниже превью в списке каталога (блюда) */
  compact?: boolean;
  /** Карточка в сетке каталога: скругление превью на мобилке, не «вылезать» на весь экран */
  listCard?: boolean;
  /** Узкий экран: выше блок фото (шапка страницы ресторана) */
  mobileTallMedia?: boolean;
  editMode?: boolean;
  /** Клик по области фото (замена) — индекс текущего слайда */
  onSlideActivate?: (slideIndex: number) => void;
  onEditDeleteSlide?: (slideIndex: number) => void;
  onEditAddSlide?: () => void;
};

export function ImageCarousel({
  images,
  label,
  keyPrefix,
  fillColumn = false,
  compact = false,
  listCard = false,
  mobileTallMedia = false,
  editMode = false,
  onSlideActivate,
  onEditDeleteSlide,
  onEditAddSlide,
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const hasMany = count > 1;

  const go = useCallback(
    (delta: number) => {
      if (count === 0) {
        return;
      }
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  const wrapCls = cx(
    styles["wrap"],
    fillColumn && styles["fillColumn"],
    compact && styles["compact"],
    listCard && styles["listCard"],
    mobileTallMedia && styles["mobileTallMedia"],
  );
  const viewCls = cx(
    styles["viewport"],
    fillColumn && styles["fillColumn"],
    compact && styles["compact"],
  );

  if (count === 0) {
    return (
      <div
        className={cx(
          wrapCls,
          editMode && styles["wrapEdit"],
        )}
      >
        <div className={styles["empty"]}>Нет фотографий</div>
        {editMode && onEditAddSlide ? (
          <div className={styles["editBar"]}>
            <Button
              type="default"
              size="small"
              icon={<PlusIcon />}
              aria-label="Добавить фото"
              onClick={onEditAddSlide}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cx(wrapCls, editMode && styles["wrapEdit"])}
      onClick={
        editMode && onSlideActivate
          ? (e) => {
              if ((e.target as HTMLElement).closest("button")) {
                return;
              }
              onSlideActivate(index);
            }
          : undefined
      }
      data-edit-carousel={editMode ? "true" : undefined}
    >
      <div className={viewCls}>
        {images.map((src, i) => (
          <CachedImage
            key={`${keyPrefix}-${i}-${src}`}
            className={cx(
              styles["slide"],
              i === index ? styles["slideVisible"] : styles["slideHidden"],
            )}
            src={src}
            alt={`${label} — фото ${i + 1} из ${count}`}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            aria-hidden={i !== index}
          />
        ))}
        {hasMany ? (
          <>
            <button
              type="button"
              className={`${styles["nav"]} ${styles["navPrev"]}`}
              aria-label="Предыдущее фото"
              onClick={() => go(-1)}
            >
              <LeftIcon />
            </button>
            <button
              type="button"
              className={`${styles["nav"]} ${styles["navNext"]}`}
              aria-label="Следующее фото"
              onClick={() => go(1)}
            >
              <RightIcon />
            </button>
            <span className={styles["counter"]} aria-hidden>
              {index + 1} / {count}
            </span>
          </>
        ) : null}
        {editMode ? (
          <div
            className={styles["editBar"]}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {onEditDeleteSlide ? (
              <Button
                type="default"
                size="small"
                icon={<DeleteIcon />}
                aria-label="Удалить текущее фото"
                onClick={() => onEditDeleteSlide(index)}
              />
            ) : null}
            {onEditAddSlide ? (
              <Button
                type="default"
                size="small"
                icon={<PlusIcon />}
                aria-label="Добавить фото"
                onClick={onEditAddSlide}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
