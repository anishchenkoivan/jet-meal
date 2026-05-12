"use client";

import { Catalog } from "@jet-meal/ui-lib/src/components/Catalog/Catalog";
import { Col } from "@jet-meal/ui-lib/src/components/Col/Col";
import { ExpandableCard } from "@jet-meal/ui-lib/src/components/ExpandableCard/ExpandableCard";
import {
  NavBackLink,
  type NavBackLinkRenderProps,
} from "@jet-meal/ui-lib/src/components/NavBackLink/NavBackLink";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCatalogTagLabel } from "../../lib/catalog-tag-options";
import { formatAverageDelivery } from "../../lib/format-delivery";
import type { CatalogMenuItem } from "../../types/catalog-menu-item";

const INITIAL_VISIBLE = 8;
const PAGE_SIZE = 8;

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
  const itemsKey = useMemo(() => items.map((i) => i.id).join("\0"), [items]);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_VISIBLE, items.length),
  );

  useEffect(() => {
    setVisibleCount(Math.min(INITIAL_VISIBLE, items.length));
  }, [itemsKey, items.length]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visibleCount >= items.length) {
      return undefined;
    }
    const el = loadMoreSentinelRef.current;
    if (!el) {
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((v) => Math.min(v + PAGE_SIZE, items.length));
        }
      },
      { root: null, rootMargin: "280px 0px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visibleCount, items.length]);

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
      {visibleItems.map((item) => {
        const thumb = item.images[0];

        return (
          <Col key={item.id} xs={24}>
            <ExpandableCard
              mode="catalog"
              title={item.name}
              price={item.priceLabel}
              rating={item.rating != null ? String(item.rating) : undefined}
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
      {visibleCount < items.length ? (
        <Col xs={24}>
          <div
            ref={loadMoreSentinelRef}
            className="h-3 w-full shrink-0"
            aria-hidden
          />
        </Col>
      ) : null}
    </Catalog>
  );
}
