"use client";

import cx from "classnames";
import { AdaptiveButton } from "../AdaptiveButton/AdaptiveButton";

export type CardActionsProps = {
  bookHref?: string;
  deliveryHref?: string;
  className?: string;
};

export function CardActions({
  bookHref,
  deliveryHref,
  className,
}: CardActionsProps) {
  return (
    <div className={cx("flex flex-col flex-wrap gap-[10px] sm:flex-row sm:items-stretch", className)}>
      {bookHref ? (
        <AdaptiveButton variant="primary" href={bookHref}>
          Забронировать
        </AdaptiveButton>
      ) : (
        <AdaptiveButton
          variant="primary"
          disabled
          title="Ссылка на бронирование пока недоступна"
        >
          Забронировать
        </AdaptiveButton>
      )}
      {deliveryHref ? (
        <AdaptiveButton variant="secondary" href={deliveryHref}>
          Доставка
        </AdaptiveButton>
      ) : (
        <AdaptiveButton
          variant="secondary"
          disabled
          title="Ссылка на доставку пока недоступна"
        >
          Доставка
        </AdaptiveButton>
      )}
    </div>
  );
}
