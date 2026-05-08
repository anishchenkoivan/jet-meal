"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Col } from "@jet-meal/ui-lib/src/components/Col/Col";
import { Catalog } from "@jet-meal/ui-lib/src/components/Catalog/Catalog";
import { ExpandableCard } from "@jet-meal/ui-lib/src/components/ExpandableCard/ExpandableCard";
import {
  NavBackLink,
  type NavBackLinkRenderProps,
} from "@jet-meal/ui-lib/src/components/NavBackLink/NavBackLink";
import { getCatalogTagLabel } from "../../lib/catalog-tag-options";
import { formatAverageDelivery } from "../../lib/format-delivery";
import type { CatalogMenuItem } from "../../types/catalog-menu-item";

function CatalogNextLink({
  href,
  className,
  children,
  onClick,
}: NavBackLinkRenderProps) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function CatalogGridClient({ items }: { items: CatalogMenuItem[] }) {
  const isEmpty = items.length === 0;
  const router = useRouter();
  const searchParams = useSearchParams();

  const appendTagToUrl = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const cur = (params.get("tags") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!cur.includes(tag)) {
        cur.push(tag);
      }
      params.set("tags", cur.join(","));
      const qs = params.toString();
      router.push(qs ? `?${qs}` : "?");
    },
    [router, searchParams],
  );

  return (
    <Catalog isEmpty={isEmpty} emptyDescription="Блюда не найдены">
      {items.map((item) => {
        const thumb = item.images[0];

        return (
          <Col key={item.id} xs={24}>
            <ExpandableCard
              mode="catalog"
              title={item.name}
              price={item.priceLabel}
              rating={
                item.rating != null ? String(item.rating) : undefined
              }
              subtitle={item.restaurantName}
              averageDelivery={formatAverageDelivery(item.deliveryMinutes)}
              tags={
                item.dishTags?.length
                  ? item.dishTags.map((v) => ({
                      value: v,
                      label: getCatalogTagLabel(v),
                    }))
                  : undefined
              }
              onTagClick={appendTagToUrl}
              thumbnailUrl={thumb}
              thumbnailAlt={item.name}
              description={item.description}
              defaultExpanded={false}
              catalogFooterEnd={
                <NavBackLink
                  variant="inline"
                  href={`/restaurant/${item.restaurantId}#dish-${item.id}`}
                  LinkComponent={CatalogNextLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  Подробнее...
                </NavBackLink>
              }
            />
          </Col>
        );
      })}
    </Catalog>
  );
}
