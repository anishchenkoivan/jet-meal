"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CatalogFilters } from "@jet-meal/ui-lib/src/components/CatalogFilters/CatalogFilters";
import type { CatalogFiltersMobileHandlers } from "../CatalogFiltersClient/CatalogFiltersClient";

export type RestaurantsFiltersClientProps = {
  registerMobileHandlers?: (api: CatalogFiltersMobileHandlers) => void;
};

export function RestaurantsFiltersClient(
  props: RestaurantsFiltersClientProps = {},
) {
  const { registerMobileHandlers } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams, searchValue]);

  const resetFilters = useCallback(() => {
    setSearchValue("");
    router.push("?");
  }, [router]);

  useLayoutEffect(() => {
    registerMobileHandlers?.({ apply: updateURL, reset: resetFilters });
  }, [registerMobileHandlers, updateURL, resetFilters]);

  return (
    <CatalogFilters
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Название, описание ресторана..."
      searchLabel=""
      onApplyFilters={updateURL}
      onResetFilters={resetFilters}
    />
  );
}
