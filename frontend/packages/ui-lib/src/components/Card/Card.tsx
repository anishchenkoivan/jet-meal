"use client";

import { Card as AntCard } from "antd";
import cx from "classnames";
import type { ComponentType } from "react";
import type { CatalogItem } from "../../types/catalogItem";
import { ImageCarousel } from "../ImageCarousel/ImageCarousel";
import type { CardFooterDetailLinkProps } from "./CardFooter";
import { CardFooter } from "./CardFooter";
import { CardHeader } from "./CardHeader";
import styles from "./Card.module.css";

export type CardProps = {
  item: CatalogItem;
  DetailLinkComponent?: ComponentType<CardFooterDetailLinkProps>;
  /** Скрыть кнопки бронирования и доставки (карточка товара) */
  omitBookingActions?: boolean;
  /** Не показывать «Подробнее» */
  omitDetailLink?: boolean;
  /** Узкая карточка блюда в каталоге */
  density?: "default" | "compact";
  /** `false`, если карточка обёрнута в ссылку */
  hoverable?: boolean;
};

export function Card({
  item,
  DetailLinkComponent,
  omitBookingActions = false,
  omitDetailLink = false,
  density = "default",
  hoverable = true,
}: CardProps) {
  const addressLine = item.address ?? item.city;
  const images = item.images ?? [];
  const compact = density === "compact";

  return (
    <AntCard
      className={cx(styles["card"], compact && styles["cardCompact"])}
      hoverable={hoverable}
    >
      <div className={cx(styles["shell"], compact && styles["shellCompact"])}>
        <div className={cx(styles["media"])}>
          <ImageCarousel
            fillColumn
            compact={compact}
            listCard
            images={images}
            label={item.name}
            keyPrefix={item.id}
          />
        </div>
        <div className={cx(styles["body"])}>
          <div className={cx(styles["main"])}>
            <CardHeader
              name={item.name}
              addressLine={addressLine}
              rating={item.rating}
            />
            {item.description ? (
              <p className={cx(styles["description"])}>{item.description}</p>
            ) : null}
            {item.priceLabel ? (
              <p className={cx(styles["priceLabel"])}>{item.priceLabel}</p>
            ) : null}
          </div>
          <CardFooter
            bookHref={item.bookHref}
            deliveryHref={item.deliveryHref}
            detailHref={item.detailHref}
            omitBookingActions={omitBookingActions}
            omitDetailLink={omitDetailLink}
            DetailLinkComponent={DetailLinkComponent}
          />
        </div>
      </div>
    </AntCard>
  );
}
