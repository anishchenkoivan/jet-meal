"use client";

import cx from "classnames";
import type { MouseEvent } from "react";
import { useCallback } from "react";
import { CachedImage, type CachedImageProps } from "../CachedImage/CachedImage";

export type EditableImageProps = CachedImageProps & {
  onEdit?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
};

export function EditableImage({
  onEdit,
  onAdd,
  onDelete,
  className,
  fill = true,
  ...cachedProps
}: EditableImageProps) {
  const stop = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const btn =
    "m-0 flex h-6 min-w-[22px] cursor-pointer items-center justify-center rounded border border-solid px-1 text-[11px] font-semibold leading-none [-webkit-tap-highlight-color:transparent] [border-color:var(--ant-color-border,#d9d9d9)] [background:rgb(255_255_255/0.95)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] shadow-sm hover:[border-color:var(--ant-color-primary,#1677ff)] hover:[color:var(--ant-color-primary,#1677ff)]";

  const isEmpty = !cachedProps.src?.toString().trim();

  return (
    <div
      className={cx(
        "relative isolate h-full w-full min-h-0 min-w-0 overflow-hidden rounded-[inherit]",
        fill && "absolute inset-0",
      )}
    >
      {isEmpty ? (
        <div className="flex h-full w-full items-center justify-center [background:var(--ant-color-fill-quaternary,#f5f5f5)] [color:var(--ant-color-text-quaternary,rgba(0,0,0,0.25))] text-xs select-none">
          Добавьте фото
        </div>
      ) : (
        <CachedImage
          {...cachedProps}
          fill={fill}
          className={cx("h-full w-full", className)}
        />
      )}

      {!isEmpty && onDelete ? (
        <button
          type="button"
          className={cx(btn, "absolute left-0.5 top-0.5 z-[2]")}
          aria-label="Удалить изображение"
          onClick={(e) => {
            stop(e);
            onDelete();
          }}
        >
          ×
        </button>
      ) : null}

      <div className="absolute bottom-0.5 right-0.5 z-[2] flex flex-row gap-0.5">
        {!isEmpty && onEdit ? (
          <button
            type="button"
            className={btn}
            aria-label="Редактировать изображение"
            onClick={(e) => {
              stop(e);
              onEdit();
            }}
          >
            ✎
          </button>
        ) : null}
        {onAdd ? (
          <button
            type="button"
            className={btn}
            aria-label="Добавить изображение"
            onClick={(e) => {
              stop(e);
              onAdd();
            }}
          >
            +
          </button>
        ) : null}
      </div>
    </div>
  );
}
