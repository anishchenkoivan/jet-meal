"use client";

import cx from "classnames";
import type { ComponentType, ReactNode } from "react";
import styles from "./Card.module.css";
import { CardActions } from "./CardActions";

export type CardFooterDetailLinkProps = {
  href: string;
  className?: string;
  children?: ReactNode;
};

export type CardFooterProps = {
  bookHref?: string;
  deliveryHref?: string;
  detailHref?: string;
  detailLabel?: string;
  detailUnavailableTitle?: string;
  /** Не показывать блок «Забронировать / Доставка» (например карточка блюда) */
  omitBookingActions?: boolean;
  /** Скрыть ссылку «Подробнее» (карточка кликабельна целиком) */
  omitDetailLink?: boolean;
  /** Например `next/link` для клиентской навигации без полной перезагрузки */
  DetailLinkComponent?: ComponentType<CardFooterDetailLinkProps>;
};

export function CardFooter({
  bookHref,
  deliveryHref,
  detailHref,
  detailLabel = "Подробнее",
  detailUnavailableTitle = "Подробности пока недоступны",
  omitBookingActions = false,
  omitDetailLink = false,
  DetailLinkComponent,
}: CardFooterProps) {
  const detailInner = omitDetailLink ? null : detailHref ? (
    DetailLinkComponent ? (
      <DetailLinkComponent
        href={detailHref}
        className={cx(styles["moreLink"])}
      >
        {detailLabel}
      </DetailLinkComponent>
    ) : (
      <a className={cx(styles["moreLink"])} href={detailHref}>
        {detailLabel}
      </a>
    )
  ) : (
    <span
      className={cx(styles["moreLink"])}
      aria-disabled="true"
      role="link"
      title={detailUnavailableTitle}
    >
      {detailLabel}
    </span>
  );

  if (omitBookingActions && omitDetailLink) {
    return null;
  }

  return (
    <div className={cx(styles["footer"])}>
      {omitBookingActions ? null : (
        <CardActions bookHref={bookHref} deliveryHref={deliveryHref} />
      )}
      {detailInner}
    </div>
  );
}
