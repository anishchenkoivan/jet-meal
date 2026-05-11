"use client";

import { CatalogFilters } from "../CatalogFilters/CatalogFilters";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CATALOG_POPULAR_TAG_VALUES,
  CATALOG_TAG_OPTIONS,
} from "../../lib/catalog-tag-options";
import {
  FILTER_CITY_OPTIONS,
  FILTER_DELIVERY_TIME_OPTIONS,
} from "../../lib/shared-catalog-filter-options";

function parseTagsParam(raw: string | null): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type CatalogFiltersMobileHandlers = {
  apply: () => void;
  reset: () => void;
  setSearch: (value: string) => void;
};

export type CatalogFiltersClientProps = {
  registerMobileHandlers?: (api: CatalogFiltersMobileHandlers) => void;
};

export function CatalogFiltersClient(props: CatalogFiltersClientProps = {}) {
  const { registerMobileHandlers } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState("");
  const searchValueRef = useRef("");
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const restaurantSearchRef = useRef("");
  const [cityValue, setCityValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [deliveryTimeValue, setDeliveryTimeValue] = useState("");
  const [deliveryWish, setDeliveryWish] = useState("");

  const syncFromUrl = useCallback(() => {
    const q = searchParams.get("q") ?? "";
    const rq = searchParams.get("rq") ?? "";
    searchValueRef.current = q;
    restaurantSearchRef.current = rq;
    setSearchValue(q);
    setRestaurantSearch(rq);
    setCityValue(searchParams.get("city") ?? "");
    setSelectedTags(parseTagsParam(searchParams.get("tags")));
    setTagSearch("");
    setDeliveryTimeValue(searchParams.get("dt") ?? "");
    setDeliveryWish(searchParams.get("wish") ?? "");
  }, [searchParams]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    // Read from refs to get the latest values even when called in the same
    // tick as setSearch (before the state update is flushed).
    const q = searchValueRef.current;
    const rq = restaurantSearchRef.current;

    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.delete("q");
    }

    if (rq.trim()) {
      params.set("rq", rq.trim());
    } else {
      params.delete("rq");
    }

    if (cityValue) {
      params.set("city", cityValue);
    } else {
      params.delete("city");
    }

    if (selectedTags.length) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }

    if (deliveryTimeValue === "custom") {
      if (deliveryWish.trim()) {
        params.set("dt", "custom");
        params.set("wish", deliveryWish.trim());
      } else {
        params.delete("dt");
        params.delete("wish");
      }
    } else if (deliveryTimeValue) {
      params.set("dt", deliveryTimeValue);
      params.delete("wish");
    } else {
      params.delete("dt");
      params.delete("wish");
    }

    params.delete("pmin");
    params.delete("pmax");

    const qs = params.toString();
    router.push(qs ? `?${qs}` : "?");
  }, [router, searchParams, cityValue, selectedTags, deliveryTimeValue, deliveryWish]);

  const resetFilters = useCallback(() => {
    searchValueRef.current = "";
    restaurantSearchRef.current = "";
    setSearchValue("");
    setRestaurantSearch("");
    setCityValue("");
    setSelectedTags([]);
    setTagSearch("");
    setDeliveryTimeValue("");
    setDeliveryWish("");
    router.push("?");
  }, [router]);

  const setSearch = useCallback((v: string) => {
    searchValueRef.current = v;
    setSearchValue(v);
  }, []);

  useLayoutEffect(() => {
    registerMobileHandlers?.({ apply: updateURL, reset: resetFilters, setSearch });
  }, [registerMobileHandlers, updateURL, resetFilters, setSearch]);

  return (
    <CatalogFilters
      searchLabel="Поиск"
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Название блюда, ингредиенты…"
      restaurantSearchLabel="Ресторан"
      restaurantSearchValue={restaurantSearch}
      onRestaurantSearchChange={setRestaurantSearch}
      restaurantSearchPlaceholder="Название ресторана"
      cityLabel="Город проживания"
      cityOptions={FILTER_CITY_OPTIONS}
      cityValue={cityValue}
      onCityChange={setCityValue}
      filtersLabel="Фильтры"
      tagCatalogOptions={[...CATALOG_TAG_OPTIONS]}
      popularTagValues={[...CATALOG_POPULAR_TAG_VALUES]}
      selectedTagValues={selectedTags}
      onSelectedTagValuesChange={setSelectedTags}
      tagSearchValue={tagSearch}
      onTagSearchChange={setTagSearch}
      deliveryTimeLabel="Время доставки"
      deliveryTimeOptions={FILTER_DELIVERY_TIME_OPTIONS}
      deliveryTimeValue={deliveryTimeValue}
      onDeliveryTimeChange={(v) => {
        setDeliveryTimeValue(v);
        if (v !== "custom") {
          setDeliveryWish("");
        }
      }}
      deliveryWishLabel="Желаемое время доставки"
      deliveryWishPlaceholder="Выберите дату и время"
      deliveryWishValue={deliveryWish}
      onDeliveryWishChange={setDeliveryWish}
      onApplyFilters={updateURL}
      onResetFilters={resetFilters}
    />
  );
}
