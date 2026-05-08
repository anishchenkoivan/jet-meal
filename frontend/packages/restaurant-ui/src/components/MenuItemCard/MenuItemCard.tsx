"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { ExpandableCard } from "@jet-meal/ui-lib/src/components/ExpandableCard/ExpandableCard";
import { useCart } from "../../providers/CartProvider";
import type { MenuItem } from "../../types/restaurant";
import type { Restaurant } from "../../types/restaurant";

export interface MenuItemCardProps {
  item: MenuItem;
  restaurant: Restaurant;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  showExtendedDescription?: boolean;
  showAddButton?: boolean;
  onItemClick?: (item: MenuItem) => void;
  /** Клик по тегу (например добавление в фильтр каталога) */
  onTagClick?: (tag: string) => void;
  className?: string;
}

export function MenuItemCard({
  item,
  restaurant,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  showExtendedDescription = true,
  showAddButton = false,
  onItemClick: _onItemClick,
  onTagClick,
  className,
}: MenuItemCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: { amount: string; currency: string }) => {
    return `${price.amount} ${price.currency === "RUB" ? "₽" : price.currency}`;
  };

  const formatIngredients = (ingredients?: string[]) => {
    if (!ingredients || ingredients.length === 0) {
      return undefined;
    }
    return `Состав: ${ingredients.join(", ")}`;
  };

  const formatAllergens = (allergens?: string[]) => {
    if (!allergens || allergens.length === 0) {
      return undefined;
    }
    return `⚠️ Аллергены: ${allergens.join(", ")}`;
  };

  const formatCalories = (calories?: number) => {
    if (!calories) {
      return undefined;
    }
    return `🔥 ${calories} ккал`;
  };

  const extendedInfo = showExtendedDescription
    ? [
        formatIngredients(item.ingredients),
        formatAllergens(item.allergens),
        formatCalories(item.calories),
      ]
        .filter(Boolean)
        .join("\n\n")
    : undefined;

  const addSlot =
    showAddButton && item.isAvailable && restaurant.isOpen ? (
      <Button
        type="primary"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          addToCart(item, restaurant, 1);
        }}
      >
        В корзину
      </Button>
    ) : null;

  return (
    <ExpandableCard
      mode="restaurant"
      className={className}
      title={item.name}
      price={formatPrice(item.price)}
      thumbnailUrl={item.imageUrl}
      thumbnailAlt={item.name}
      description={showExtendedDescription ? item.description : undefined}
      expandedContent={
        extendedInfo ? (
          <div
            style={{
              fontSize: "13px",
              color: "#8c8c8c",
              lineHeight: "1.4",
              whiteSpace: "pre-line",
            }}
          >
            {extendedInfo}
          </div>
        ) : null
      }
      defaultExpanded={defaultExpanded}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      disabled={!item.isAvailable}
      tags={
        item.tags.length > 0
          ? item.tags.map((t) => ({ value: t, label: t }))
          : undefined
      }
      onTagClick={onTagClick}
      restaurantFooterStart={addSlot}
    />
  );
}
