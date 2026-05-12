"use client";

import { CatalogPageLayout } from "@jet-meal/ui-lib/src/containers/CatalogPageLayout/CatalogPageLayout";
import { PageContentShell } from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
import { MAIN_NAV_KEYS } from "@jet-meal/ui-lib/src/navigation/mainNavTabs";
import { useRef, useState } from "react";
import type { CatalogFiltersMobileHandlers } from "../../components/CatalogFiltersClient/CatalogFiltersClient";
import { RestaurantsFiltersClient } from "../../components/RestaurantsFiltersClient/RestaurantsFiltersClient";
import { RestaurantsGridClient } from "../../components/RestaurantsGridClient/RestaurantsGridClient";
import type { Restaurant } from "../../types/restaurant";

export type RestaurantsPageProps = {
  restaurants: Restaurant[];
};

export function RestaurantsPage({ restaurants }: RestaurantsPageProps) {
  const mobileRef = useRef<CatalogFiltersMobileHandlers>({
    apply: () => {},
    reset: () => {},
    setSearch: () => {},
  });
  const [headerSearch, setHeaderSearch] = useState("");
  const setSearchCallbackRef = useRef<(v: string) => void>(() => {});

  return (
    <PageContentShell className="min-h-0 flex-1">
      <CatalogPageLayout
        includeSiteChrome={false}
        relaxContentInnerWidth
        selectedNavKey={MAIN_NAV_KEYS.restaurants}
        mobileSearchField={{
          value: headerSearch,
          onChange: (v) => {
            setHeaderSearch(v);
            setSearchCallbackRef.current(v);
          },
          placeholder: "Название ресторана…",
        }}
        onMobileApply={() => mobileRef.current.apply()}
        onMobileResetNav={() => {
          mobileRef.current.reset();
          setHeaderSearch("");
        }}
        sidebarBody={
          <RestaurantsFiltersClient
            registerMobileHandlers={(api) => {
              mobileRef.current = api;
              setSearchCallbackRef.current = api.setSearch;
            }}
          />
        }
      >
        <RestaurantsGridClient restaurants={restaurants} />
      </CatalogPageLayout>
    </PageContentShell>
  );
}
