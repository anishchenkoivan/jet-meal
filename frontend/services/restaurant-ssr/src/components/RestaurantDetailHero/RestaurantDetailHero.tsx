"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { ImageCarousel } from "@jet-meal/ui-lib/src/components/ImageCarousel/ImageCarousel";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import type { Restaurant } from "../../types/restaurant";

export type RestaurantDetailHeroProps = {
  restaurant: Restaurant;
  onBookClick?: () => void;
};

export function RestaurantDetailHero({ restaurant, onBookClick }: RestaurantDetailHeroProps) {
  const p = restaurant.preview;
  const canBook = Boolean(p?.bookHref || p?.bookingPhone);

  return (
    <div style={{ marginBottom: "2rem" }}>
      {p?.images ? (
        <div style={{ marginBottom: "1.5rem" }}>
          <ImageCarousel
            images={p.images}
            label={restaurant.name}
            keyPrefix={restaurant.id}
          />
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "10px 14px",
          marginBottom: "0.75rem",
        }}
      >
        {p?.rating != null ? (
          <span
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "rgba(0,0,0,0.65)",
              whiteSpace: "nowrap",
            }}
            aria-label={`Рейтинг ${p.rating}`}
          >
            ⭐ {p.rating}
          </span>
        ) : null}
        <Typography.Title level={1} style={{ margin: 0 }}>
          {restaurant.name}
        </Typography.Title>
      </div>

      <Typography.Paragraph style={{ fontSize: "1.1rem", color: "#666" }}>
        {p?.description}
      </Typography.Paragraph>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          fontSize: "0.95rem",
          color: "#666",
        }}
      >
        {p?.city ? <Typography.Text>{p.city}</Typography.Text> : null}
        {p?.address ? (
          <Typography.Text type="secondary">{p.address}</Typography.Text>
        ) : null}
      </div>

      {canBook && onBookClick ? (
        <div style={{ marginBottom: "1.5rem" }}>
          <Button type="primary" onClick={onBookClick}>
            Забронировать
          </Button>
        </div>
      ) : null}
    </div>
  );
}
