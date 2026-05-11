"use client";

import { ExpandableCard } from "@jet-meal/ui-lib/src/components/ExpandableCard/ExpandableCard";
import type { MenuItem, Restaurant } from "../../types/restaurant";

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
      <div key="restaurant" className="mb-4">
        <div className="text-sm font-semibold text-[#262626] mb-1">
          Ресторан: {restaurant.name}
        </div>
        <div className="text-[13px] text-[#8c8c8c]">
          {restaurant.cuisines.join(", ")}
        </div>
        {restaurant.description ? (
          <div className="text-[13px] text-[#595959] mt-1 leading-[1.4]">
            {restaurant.description}
          </div>
        ) : null}
      </div>,
    );

    if (item.ingredients && item.ingredients.length > 0) {
      sections.push(
        <div key="ingredients" className="mb-3">
          <div className="text-[13px] font-semibold text-[#262626] mb-1">
            Состав:
          </div>
          <div className="text-[13px] text-[#595959]">
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
          className="text-[13px] text-[#8c8c8c] leading-[1.4]"
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
        className="p-0 border-none bg-none cursor-pointer font-[inherit] text-sm [color:var(--ant-color-primary,#1677ff)] underline"
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
