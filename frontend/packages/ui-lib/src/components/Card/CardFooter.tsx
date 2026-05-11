"use client";

import cx from "classnames";
import type { ComponentType, ReactNode } from "react";
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

const moreLinkCls =
  "self-start box-border max-w-full m-0 p-0 border-none bg-none [color:var(--ant-color-primary,#1677ff)] font-[inherit] text-[13px] leading-[1.4] text-left underline [text-underline-offset:2px] cursor-pointer [overflow-wrap:anywhere] [word-break:break-word] hover:[color:var(--ant-color-primary-hover,#4096ff)] focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2 disabled:[color:var(--ant-color-text-disabled,rgba(0,0,0,0.25))] disabled:no-underline disabled:cursor-not-allowed aria-disabled:[color:var(--ant-color-text-disabled,rgba(0,0,0,0.25))] aria-disabled:no-underline aria-disabled:cursor-not-allowed";

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
      <DetailLinkComponent href={detailHref} className={cx(moreLinkCls)}>
        {detailLabel}
      </DetailLinkComponent>
    ) : (
      <a className={cx(moreLinkCls)} href={detailHref}>
        {detailLabel}
      </a>
    )
  ) : (
    <span
      className={cx(moreLinkCls)}
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
    <div className="flex flex-col gap-[10px] box-border w-full min-w-0 mt-auto pt-2">
      {omitBookingActions ? null : (
        <CardActions bookHref={bookHref} deliveryHref={deliveryHref} />
      )}
      {detailInner}
    </div>
  );
}
