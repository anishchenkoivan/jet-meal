"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { ImageCarousel } from "@jet-meal/ui-lib/src/components/ImageCarousel/ImageCarousel";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import type { Restaurant } from "../../types/restaurant";

export type RestaurantDetailHeroProps = {
  restaurant: Restaurant;
  onBookClick?: () => void;
};

export function RestaurantDetailHero({
  restaurant,
  onBookClick,
}: RestaurantDetailHeroProps) {
  const p = restaurant.preview;
  const canBook = Boolean(p?.bookHref || p?.bookingPhone);

  return (
    <div className="mb-8">
      {p?.images ? (
        <div>
          <ImageCarousel
            images={p.images}
            label={restaurant.name}
            keyPrefix={restaurant.id}
          />
        </div>
      ) : null}

      <div className="flex flex-row items-baseline flex-wrap gap-x-[14px] gap-y-2.5 mb-3">
        {p?.rating != null ? (
          <span
            className="text-[1.15rem] font-semibold text-black/65 whitespace-nowrap"
            role="img"
            aria-label={`Рейтинг ${p.rating}`}
          >
            ⭐ {p.rating}
          </span>
        ) : null}
        <Typography.Title level={1} style={{ margin: 0 }}>
          {restaurant.name}
        </Typography.Title>
      </div>

      <Typography.Paragraph className="!text-[1.1rem] !text-[#666]">
        {p?.description}
      </Typography.Paragraph>

      <div className="flex gap-4 items-center mb-6 flex-wrap text-[0.95rem] text-[#666]">
        {p?.city ? <Typography.Text>{p.city}</Typography.Text> : null}
        {p?.address ? (
          <Typography.Text type="secondary">{p.address}</Typography.Text>
        ) : null}
      </div>

      {canBook && onBookClick ? (
        <div className="mb-6">
          <Button type="primary" onClick={onBookClick}>
            Забронировать
          </Button>
        </div>
      ) : null}
    </div>
  );
}
