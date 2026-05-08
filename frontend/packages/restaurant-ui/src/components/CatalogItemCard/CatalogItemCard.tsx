"use client";

import { ExpandableCard } from "@jet-meal/ui-lib/src/components/ExpandableCard/ExpandableCard";
import type { MenuItem } from "../../types/restaurant";
import type { Restaurant } from "../../types/restaurant";

export interface CatalogItemCardProps {
  item: MenuItem;
  restaurant: Restaurant;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onItemClick?: (item: MenuItem, restaurant: Restaurant) => void;
  onDeliveryClick?: (item: MenuItem, restaurant: Restaurant) => void;
  onTagClick?: (tag: string) => void;
  className?: string;
}

export function CatalogItemCard({
  item,
  restaurant,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  onItemClick: _onItemClick,
  onDeliveryClick,
  onTagClick,
  className,
}: CatalogItemCardProps) {
  const formatPrice = (price: { amount: string; currency: string }) => {
    return `${price.amount} ${price.currency === "RUB" ? "₽" : price.currency}`;
  };

  const formatPrepTime = (prepTimeMinutes?: number) => {
    if (!prepTimeMinutes) {
      return "";
    }
    return `🕐 ${prepTimeMinutes} мин`;
  };

  const formatRestaurantInfo = () => {
    const parts = [formatPrepTime(restaurant.prepTimeMinutes)].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : undefined;
  };

  const buildExtendedContent = () => {
    const sections = [];

    sections.push(
      <div key="restaurant" style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#262626",
            marginBottom: "4px",
          }}
        >
          Ресторан: {restaurant.name}
        </div>
        <div style={{ fontSize: "13px", color: "#8c8c8c" }}>
          {restaurant.cuisines.join(", ")}
        </div>
        {restaurant.description ? (
          <div
            style={{
              fontSize: "13px",
              color: "#595959",
              marginTop: "4px",
              lineHeight: "1.4",
            }}
          >
            {restaurant.description}
          </div>
        ) : null}
      </div>,
    );

    if (item.ingredients && item.ingredients.length > 0) {
      sections.push(
        <div key="ingredients" style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#262626",
              marginBottom: "4px",
            }}
          >
            Состав:
          </div>
          <div style={{ fontSize: "13px", color: "#595959" }}>
            {item.ingredients.join(", ")}
          </div>
        </div>,
      );
    }

    const additionalInfo = [];
    if (item.allergens && item.allergens.length > 0) {
      additionalInfo.push(`⚠️ Аллергены: ${item.allergens.join(", ")}`);
    }
    if (item.calories) {
      additionalInfo.push(`🔥 ${item.calories} ккал`);
    }

    if (additionalInfo.length > 0) {
      sections.push(
        <div
          key="additional"
          style={{
            fontSize: "13px",
            color: "#8c8c8c",
            lineHeight: "1.4",
          }}
        >
          {additionalInfo.join(" • ")}
        </div>,
      );
    }

    return <div>{sections}</div>;
  };

  const detailLink =
    restaurant.isOpen && item.isAvailable && onDeliveryClick ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeliveryClick(item, restaurant);
        }}
        style={{
          padding: 0,
          border: "none",
          background: "none",
          cursor: "pointer",
          font: "inherit",
          fontSize: 14,
          color: "var(--ant-color-primary, #1677ff)",
          textDecoration: "underline",
        }}
      >
        Подробнее...
      </button>
    ) : null;

  return (
    <ExpandableCard
      mode="catalog"
      className={className}
      title={item.name}
      price={formatPrice(item.price)}
      subtitle={restaurant.name}
      tags={
        item.tags.length > 0
          ? item.tags.map((t) => ({ value: t, label: t }))
          : undefined
      }
      onTagClick={onTagClick}
      meta={formatRestaurantInfo()}
      thumbnailUrl={item.imageUrl}
      thumbnailAlt={`${item.name} · ${restaurant.name}`}
      description={item.description}
      expandedContent={buildExtendedContent()}
      defaultExpanded={defaultExpanded}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      disabled={!restaurant.isOpen || !item.isAvailable}
      catalogFooterEnd={detailLink}
    />
  );
}
