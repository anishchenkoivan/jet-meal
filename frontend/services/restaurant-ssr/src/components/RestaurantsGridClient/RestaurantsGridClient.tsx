"use client";

import { Catalog } from "@jet-meal/ui-lib/src/components/Catalog/Catalog";
import { Col } from "@jet-meal/ui-lib/src/components/Col/Col";
import { ExpandableCard } from "@jet-meal/ui-lib/src/components/ExpandableCard/ExpandableCard";
import { useRouter } from "next/navigation";
import type { Restaurant } from "../../types/restaurant";

function addressLine(r: Restaurant): string {
  const p = r.preview;
  if (!p) {
    return "";
  }
  const parts = [p.city, p.address].filter(Boolean);
  return parts.join(", ");
}

export function RestaurantsGridClient({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const isEmpty = restaurants.length === 0;
  const router = useRouter();

  return (
    <Catalog isEmpty={isEmpty} emptyDescription="Рестораны не найдены">
      {restaurants.map((restaurant) => {
        const p = restaurant.preview;
        const thumb = p?.images?.[0];
        const tags =
          p?.cuisineTags?.map((label) => ({
            value: label,
            label,
          })) ?? undefined;
        const rating = p?.rating != null ? String(p.rating) : undefined;

        return (
          <Col key={restaurant.id} xs={24}>
            <ExpandableCard
              mode="catalog"
              title={restaurant.name}
              rating={rating}
              subtitle={addressLine(restaurant)}
              averageDelivery={p?.deliveryTimeLabel}
              pinDeliveryNextToTitle
              thumbnailUrl={thumb}
              thumbnailAlt={restaurant.name}
              description={p?.description}
              tags={tags}
              disableExpansion
              onCardNavigate={() => {
                router.push(`/restaurant/${restaurant.id}`);
              }}
            />
          </Col>
        );
      })}
    </Catalog>
  );
}
