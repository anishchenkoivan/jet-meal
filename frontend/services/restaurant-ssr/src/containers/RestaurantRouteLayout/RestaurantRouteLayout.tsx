"use client";

import cx from "classnames";
import { Footer } from "../../../../../packages/ui-lib/src/components/Footer/Footer";
import { Header } from "../../../../../packages/ui-lib/src/components/Header/Header";
import { Logo } from "../../../../../packages/ui-lib/src/components/Logo/Logo";
import { PageLayout } from "../../../../../packages/ui-lib/src/containers/PageLayout/PageLayout";
import type { ReactNode } from "react";
import styles from "./RestaurantRouteLayout.module.css";

export function RestaurantRouteLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      top={
        <div className={cx(styles["topBar"])}>
          <Logo title="Restaurant" />
          <div className={cx(styles["headerWrap"])}>
            <Header
              tabs={[
                { key: "catalog", label: "Catalog", href: "/catalog" },
                { key: "restaurant", label: "Restaurant", href: "/restaurant" },
              ]}
              selectedKey="restaurant"
            />
          </div>
        </div>
      }
      footer={<Footer text="© Jet Meal. Restaurant service." />}
    >
      {children}
    </PageLayout>
  );
}
