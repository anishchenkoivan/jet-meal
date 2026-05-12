"use client";

import { CatalogPageLayout } from "@jet-meal/ui-lib/src/containers/CatalogPageLayout/CatalogPageLayout";
import { PageContentShell } from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
import { MAIN_NAV_KEYS } from "@jet-meal/ui-lib/src/navigation/mainNavTabs";
import { useRef, useState } from "react";
import type { CatalogFiltersMobileHandlers } from "../../components/CatalogFiltersClient/CatalogFiltersClient";
import { CatalogFiltersClient } from "../../components/CatalogFiltersClient/CatalogFiltersClient";
import { CatalogGridClient } from "../../components/CatalogGridClient/CatalogGridClient";
import type { CatalogMenuItem } from "../../types/catalog-menu-item";

export type CatalogPageProps = {
  items: CatalogMenuItem[];
};

export function CatalogPage({ items }: CatalogPageProps) {
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
        selectedNavKey={MAIN_NAV_KEYS.catalog}
        mobileSearchField={{
          value: headerSearch,
          onChange: (v) => {
            setHeaderSearch(v);
            setSearchCallbackRef.current(v);
          },
          placeholder: "Название блюда, ингредиенты…",
        }}
        onMobileApply={() => mobileRef.current.apply()}
        onMobileResetNav={() => {
          mobileRef.current.reset();
          setHeaderSearch("");
        }}
        sidebarBody={
          <CatalogFiltersClient
            registerMobileHandlers={(api) => {
              mobileRef.current = api;
              setSearchCallbackRef.current = api.setSearch;
            }}
          />
        }
      >
        <CatalogGridClient items={items} />
      </CatalogPageLayout>
    </PageContentShell>
  );
}
