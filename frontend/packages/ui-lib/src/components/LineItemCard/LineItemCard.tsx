"use client";

import { MinusIcon, PlusIcon } from "../Icons/Icons";
import { Button } from "antd";
import cx from "classnames";
import type { ComponentType, ReactNode } from "react";
import styles from "./LineItemCard.module.css";

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
          className={cx(styles["media"], slim && styles["mediaSlimCatalog"])}
        >
          {media}
        </div>
      ) : null}
      <div className={cx(styles["body"], slim && styles["bodySlimCatalog"])}>
        <div className={styles["top"]}>
          <h3 className={styles["title"]}>{title}</h3>
          {description ? (
            <div className={styles["description"]}>{description}</div>
          ) : null}
        </div>
        <div className={styles["meta"]}>
          <span className={styles["unitPrice"]}>{unitPriceLabel}</span>
          {lineTotalLabel ? (
            <span className={styles["lineTotal"]}>{lineTotalLabel}</span>
          ) : null}
        </div>
        {navMode ? (
          <p className={styles["navHint"]} aria-hidden>
            ×{quantity}
          </p>
        ) : (
          <div className={styles["actions"]}>
            <div className={styles["stepper"]}>
              <Button
                type="default"
                size="small"
                icon={<MinusIcon />}
                aria-label="Меньше"
                disabled={quantity <= minQuantity}
                onClick={dec}
              />
              <span className={styles["qty"]} aria-live="polite">
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
    styles["root"],
    slim && styles["rootCatalogSlim"],
    navMode && styles["rootNav"],
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
