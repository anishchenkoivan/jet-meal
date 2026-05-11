"use client";

import { Card as AntCard } from "antd";
import cx from "classnames";
import type { ComponentType } from "react";
import type { CatalogItem } from "../../types/catalogItem";
import { ImageCarousel } from "../ImageCarousel/ImageCarousel";
import type { CardFooterDetailLinkProps } from "./CardFooter";
import { CardFooter } from "./CardFooter";
import { CardHeader } from "./CardHeader";

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
      className="overflow-hidden"
      hoverable={hoverable}
      styles={{
        body: {
          padding: compact ? 12 : 16,
        },
      }}
    >
      <div
        className={cx(
          "grid grid-cols-1 gap-4 items-stretch md:gap-5 md:grid-cols-[minmax(260px,min(38%,480px))_1fr]",
          compact && "gap-[10px]",
        )}
      >
        <div
          className={cx(
            "flex w-full min-w-0 min-h-0 max-md:box-border max-md:w-full max-md:max-w-full",
            !compact && "md:h-full md:max-w-[min(480px,100%)]",
          )}
        >
          <ImageCarousel
            fillColumn
            compact={compact}
            listCard
            images={images}
            label={item.name}
            keyPrefix={item.id}
          />
        </div>
        <div
          className={cx(
            "flex flex-col min-w-0 min-h-0 box-border max-w-full md:min-h-full",
            "max-md:flex-[0_1_auto] max-md:self-stretch max-md:w-full max-md:max-w-full max-md:min-h-auto max-md:px-4 max-md:pt-3 max-md:pb-4",
          )}
        >
          <div className="flex-[0_1_auto] max-md:w-full max-md:min-w-0">
            <CardHeader
              name={item.name}
              addressLine={addressLine}
              rating={item.rating}
            />
            {item.description ? (
              <p
                className={cx(
                  "m-0 [color:var(--ant-color-text,rgba(0,0,0,0.88))] text-sm leading-[1.55]",
                  compact && "hidden",
                )}
              >
                {item.description}
              </p>
            ) : null}
            {item.priceLabel ? (
              <p
                className={cx(
                  "mt-2 text-base font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]",
                  compact && "mt-1 text-[15px]",
                )}
              >
                {item.priceLabel}
              </p>
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
