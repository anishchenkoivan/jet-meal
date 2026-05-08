"use client";

import { PageContentShell } from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
import { useRef } from "react";
import { CatalogPageLayout } from "@jet-meal/ui-lib/src/containers/CatalogPageLayout/CatalogPageLayout";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { MAIN_NAV_KEYS } from "@jet-meal/ui-lib/src/navigation/mainNavTabs";
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
  });

  return (
    <PageContentShell>
      <CatalogPageLayout
        includeSiteChrome={false}
        relaxContentInnerWidth
        selectedNavKey={MAIN_NAV_KEYS.catalog}
        onMobileApply={() => mobileRef.current.apply()}
        onMobileResetNav={() => mobileRef.current.reset()}
        sidebarTitle={
          <Typography.Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            Ваши пожелания:
          </Typography.Title>
        }
        sidebarBody={
          <CatalogFiltersClient
            registerMobileHandlers={(api) => {
              mobileRef.current = api;
            }}
          />
        }
      >
        <CatalogGridClient items={items} />
      </CatalogPageLayout>
    </PageContentShell>
  );
}
