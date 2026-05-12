"use client";

import { ExpandableCard } from "@jet-meal/ui-lib/src/components/ExpandableCard/ExpandableCard";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { primaryBlockImage } from "../../lib/contentBlockImages";
import type { Restaurant } from "../../types/restaurant";
import { DishOrderControls } from "../DishOrderControls/DishOrderControls";

export type RestaurantMenuBodyProps = {
  restaurant: Restaurant;
  parsePriceRub: (raw?: string | null) => number;
};

export function RestaurantMenuBody({
  restaurant,
  parsePriceRub,
}: RestaurantMenuBodyProps) {
  const sections = restaurant.mainSections;
  if (!sections?.length) {
    return null;
  }

  return (
    <>
      {sections.map((section) => (
        <div key={section.id}>
          {section.title ? (
            <Typography.Title level={2} style={{ marginBottom: "2rem" }}>
              {section.title}
            </Typography.Title>
          ) : null}

          {section.divisions.map((division) => (
            <div key={division.id} style={{ marginBottom: "2rem" }}>
              {division.title ? (
                <Typography.Title level={3} style={{ marginBottom: "1rem" }}>
                  {division.title}
                </Typography.Title>
              ) : null}

              <div style={{ display: "grid", gap: "1rem" }}>
                {division.blocks.map((block) => (
                  <div key={block.id} id={block.id}>
                    <ExpandableCard
                      mode="restaurant"
                      title={block.title}
                      price={block.subtitle ?? undefined}
                      subtitle={division.title ?? undefined}
                      thumbnailUrl={primaryBlockImage(block)}
                      thumbnailAlt={block.title}
                      description={block.extraText ?? undefined}
                      defaultExpanded
                      restaurantFooterStart={
                        <DishOrderControls
                          restaurantId={restaurant.id}
                          restaurantName={restaurant.name}
                          dishId={block.id}
                          dishName={block.title}
                          priceRub={parsePriceRub(block.subtitle)}
                        />
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
