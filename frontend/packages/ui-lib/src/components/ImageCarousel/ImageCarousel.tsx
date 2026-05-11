"use client";

import { Button } from "antd";
import cx from "classnames";
import { useCallback, useState } from "react";
import { CachedImage } from "../CachedImage/CachedImage";
import { DeleteIcon, LeftIcon, PlusIcon, RightIcon } from "../Icons/Icons";

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

  /** Один блок по размеру фото: без отдельного «лишнего» фона снаружи кадра (серый только у CachedImage при загрузке/плейсхолдере). */
  const mediaRootCls = cx(
    "relative w-full min-h-0 overflow-hidden [border-radius:var(--ant-border-radius-lg,8px)]",
    "max-md:rounded-none",
    listCard && "max-md:[border-radius:var(--ant-border-radius-lg,8px)]",
    fillColumn && "flex-[0_1_auto] max-h-full min-h-0 max-w-full self-stretch",
    fillColumn
      ? cx(
          compact &&
            "aspect-[16/9] max-h-[200px] min-h-[120px] md:max-h-[200px]",
          mobileTallMedia &&
            "aspect-[16/10] max-md:aspect-[16/18] max-md:max-h-[min(72dvh,720px)] max-md:min-h-[min(52dvw,420px)] md:max-h-[min(78dvh,840px)] md:min-h-[min(36dvw,520px)]",
          !compact &&
            !mobileTallMedia &&
            "max-md:aspect-[16/10] md:h-full md:min-h-[200px] md:max-h-full",
        )
      : cx(
          "aspect-[16/10] w-full max-w-full",
          mobileTallMedia &&
            "max-md:aspect-[16/18] max-md:max-h-[min(72dvh,720px)] max-md:min-h-[min(52dvw,420px)] md:max-h-[min(78dvh,840px)] md:min-h-[min(36dvw,520px)]",
        ),
    editMode &&
      "cursor-pointer outline-2 outline-transparent outline-offset-2 [transition:outline-color_0.15s_ease] hover:outline-[var(--ant-color-primary,#1677ff)]",
  );

  const emptyRootCls = cx(
    "relative flex min-h-[200px] w-full flex-col overflow-hidden [border-radius:var(--ant-border-radius-lg,8px)] [background-color:var(--ant-color-fill-quaternary,rgba(0,0,0,0.04))]",
    "max-md:rounded-none",
    listCard && "max-md:[border-radius:var(--ant-border-radius-lg,8px)]",
    editMode &&
      "cursor-pointer outline-2 outline-transparent outline-offset-2 [transition:outline-color_0.15s_ease] hover:outline-[var(--ant-color-primary,#1677ff)]",
  );

  if (count === 0) {
    return (
      <div className={cx(emptyRootCls, editMode && "cursor-pointer")}>
        <div className="flex min-h-[200px] flex-1 items-center justify-center p-4 [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))] text-sm text-center">
          Нет фотографий
        </div>
        {editMode && onEditAddSlide ? (
          <div className="absolute right-2 bottom-10 z-[3] flex gap-[6px] pointer-events-auto">
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
      className={cx(mediaRootCls, editMode && "cursor-pointer")}
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
      {images.map((src, i) => (
        <CachedImage
          key={`${keyPrefix}-${i}-${src}`}
          className={cx(
            "absolute inset-0 block h-full w-full max-w-none",
            i === index
              ? "z-[1] opacity-100 visible"
              : "z-0 opacity-0 invisible pointer-events-none",
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
            className="absolute top-1/2 z-[2] left-2 flex items-center justify-center w-9 h-9 p-0 border-none [border-radius:var(--ant-border-radius-lg,8px)] [background-color:rgb(255_255_255_/_0.92)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] shadow-[0_1px_4px_rgb(0_0_0/12%)] cursor-pointer -translate-y-1/2 [transition:background-color_0.15s_ease] hover:not-disabled:bg-white focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Предыдущее фото"
            onClick={() => go(-1)}
          >
            <LeftIcon />
          </button>
          <button
            type="button"
            className="absolute top-1/2 z-[2] right-2 flex items-center justify-center w-9 h-9 p-0 border-none [border-radius:var(--ant-border-radius-lg,8px)] [background-color:rgb(255_255_255_/_0.92)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] shadow-[0_1px_4px_rgb(0_0_0/12%)] cursor-pointer -translate-y-1/2 [transition:background-color_0.15s_ease] hover:not-disabled:bg-white focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Следующее фото"
            onClick={() => go(1)}
          >
            <RightIcon />
          </button>
          <span className="absolute right-2 bottom-2 z-[2] px-2 py-[2px] rounded-full [background-color:rgb(0_0_0/_55%)] text-white text-xs leading-[1.5]" aria-hidden>
            {index + 1} / {count}
          </span>
        </>
      ) : null}
      {editMode ? (
        <div
          className="absolute right-2 bottom-10 z-[3] flex gap-[6px] pointer-events-auto"
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
  );
}
