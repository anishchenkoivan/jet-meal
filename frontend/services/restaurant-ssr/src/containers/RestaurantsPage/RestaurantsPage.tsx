"use client";

import { PageContentShell } from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
import { useRef } from "react";
import { CatalogPageLayout } from "@jet-meal/ui-lib/src/containers/CatalogPageLayout/CatalogPageLayout";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { MAIN_NAV_KEYS } from "@jet-meal/ui-lib/src/navigation/mainNavTabs";
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
  });

  return (
    <PageContentShell>
      <CatalogPageLayout
        includeSiteChrome={false}
        relaxContentInnerWidth
        selectedNavKey={MAIN_NAV_KEYS.restaurants}
        onMobileApply={() => mobileRef.current.apply()}
        onMobileResetNav={() => mobileRef.current.reset()}
        sidebarTitle={
          <Typography.Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            Рестораны
          </Typography.Title>
        }
        sidebarBody={
          <RestaurantsFiltersClient
            registerMobileHandlers={(api) => {
              mobileRef.current = api;
            }}
          />
        }
      >
        <RestaurantsGridClient restaurants={restaurants} />
      </CatalogPageLayout>
    </PageContentShell>
  );
}
