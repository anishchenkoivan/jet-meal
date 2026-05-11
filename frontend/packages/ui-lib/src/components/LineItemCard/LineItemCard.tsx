"use client";

import { Button } from "antd";
import cx from "classnames";
import type { ComponentType, ReactNode } from "react";
import { MinusIcon, PlusIcon } from "../Icons/Icons";

export type LineItemCardProps = {
  title: string;
  description?: ReactNode;
  /** Слот слева: превью, иконка и т.п. */
  media?: ReactNode;
  /**
   * `catalogSlim` — колонка как в каталоге (фото сверху на всю ширину), высота превью ~в 2.5 раза ниже лимита карточки каталога.
   */
  layout?: "row" | "catalogSlim";
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  /** Подпись цены за единицу */
  unitPriceLabel: string;
  /** Итог по строке (если не передан — считается только через слот) */
  lineTotalLabel?: string;
  onQuantityChange: (next: number) => void;
  onRemove?: () => void;
  className?: string;
  /** Переход в каталог (без степпера) */
  navigateHref?: string;
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children?: ReactNode;
    scroll?: boolean;
  }>;
};

export function LineItemCard({
  title,
  description,
  media,
  quantity,
  minQuantity = 0,
  maxQuantity = 99,
  unitPriceLabel,
  lineTotalLabel,
  onQuantityChange,
  onRemove,
  className,
  navigateHref,
  LinkComponent,
  layout = "row",
}: LineItemCardProps) {
  const dec = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };
  const inc = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const navMode = Boolean(navigateHref && LinkComponent);
  const slim = layout === "catalogSlim";

  const inner = (
    <>
      {media ? (
        <div
          className={cx(
            "flex-shrink-0 w-[72px] h-[72px] [border-radius:var(--ant-border-radius,6px)] overflow-hidden [background:var(--ant-color-fill-quaternary,rgba(0,0,0,0.02))]",
            slim &&
              "w-full h-auto min-h-[80px] max-h-[144px] aspect-[16/10] [border-radius:var(--ant-border-radius-lg,8px)] [&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:[object-fit:cover]",
          )}
        >
          {media}
        </div>
      ) : null}
      <div
        className={cx(
          "flex-[1_1_auto] min-w-0 flex flex-col gap-[6px]",
          slim && "flex-[0_1_auto]",
        )}
      >
        <div className="min-w-0">
          <h3 className="m-0 text-[15px] font-semibold leading-[1.35]">{title}</h3>
          {description ? (
            <div className="mt-1 text-[13px] leading-[1.45] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]">{description}</div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-2 items-baseline text-[13px]">
          <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]">{unitPriceLabel}</span>
          {lineTotalLabel ? (
            <span className="font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">{lineTotalLabel}</span>
          ) : null}
        </div>
        {navMode ? (
          <p className="mt-1 text-[13px] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]" aria-hidden>
            ×{quantity}
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
            <div className="inline-flex items-center gap-2">
              <Button
                type="default"
                size="small"
                icon={<MinusIcon />}
                aria-label="Меньше"
                disabled={quantity <= minQuantity}
                onClick={dec}
              />
              <span className="min-w-[2ch] text-center [font-variant-numeric:tabular-nums] font-medium" aria-live="polite">
                {quantity}
              </span>
              <Button
                type="default"
                size="small"
                icon={<PlusIcon />}
                aria-label="Больше"
                disabled={quantity >= maxQuantity}
                onClick={inc}
              />
            </div>
            {onRemove ? (
              <Button type="link" size="small" danger onClick={onRemove}>
                Убрать
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </>
  );

  const rootCls = cx(
    "flex gap-3 box-border p-3 border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [border-radius:var(--ant-border-radius-lg,8px)] [background:var(--ant-color-bg-container,#fff)]",
    slim && "flex-col items-stretch gap-[10px] w-full max-w-none",
    navMode &&
      "w-full no-underline text-inherit [transition:border-color_0.15s_ease,box-shadow_0.15s_ease] hover:[border-color:var(--ant-color-primary,#1677ff)] hover:shadow-[0_2px_8px_rgb(0_0_0/6%)] focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2",
    className,
  );

  if (navMode && navigateHref && LinkComponent) {
    return (
      <LinkComponent href={navigateHref} className={rootCls} scroll={false}>
        {inner}
      </LinkComponent>
    );
  }

  return <article className={rootCls}>{inner}</article>;
}
