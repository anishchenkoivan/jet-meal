"use client";

import { Layout } from "antd";
import type { ReactNode } from "react";
import { Footer } from "../../../../../packages/ui-lib/src/components/Footer/Footer";
import { Header, type LinkRenderProps } from "../../../../../packages/ui-lib/src/components/Header/Header";
import { Logo } from "../../../../../packages/ui-lib/src/components/Logo/Logo";
import { PageLayout } from "../../../../../packages/ui-lib/src/containers/PageLayout/PageLayout";
import {
  createMainNavTabs,
  MAIN_NAV_KEYS,
  type MainNavUrls,
} from "../../../../../packages/ui-lib/src/navigation/mainNavTabs";
import styles from "./CatalogPageLayout.module.css";

const { Header: AntHeader } = Layout;

function defaultNavUrls(): MainNavUrls {
  return {
    home: process.env['NEXT_PUBLIC_NAV_HOME'] ?? "/",
    menu: process.env['NEXT_PUBLIC_NAV_MENU'] ?? "/",
    restaurants: process.env['NEXT_PUBLIC_NAV_RESTAURANTS'] ?? "/",
    orders: process.env['NEXT_PUBLIC_NAV_ORDERS'] ?? "/",
    account: process.env['NEXT_PUBLIC_NAV_ACCOUNT'] ?? "/",
    business: process.env['NEXT_PUBLIC_NAV_BUSINESS'] ?? "/",
  };
}

function DefaultLink({ href, className, children, onClick }: LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export type CatalogPageLayoutProps = {
  children: ReactNode;
  navUrls?: MainNavUrls;
  logoHref?: string;
  footerText?: string;
  LinkComponent?: React.ComponentType<LinkRenderProps>;
};

export function CatalogPageLayout({
  children,
  navUrls = defaultNavUrls(),
  logoHref = process.env['NEXT_PUBLIC_NAV_HOME'] ?? "/",
  footerText = "© Jet Meal",
  LinkComponent = DefaultLink,
}: CatalogPageLayoutProps) {
  const tabs = createMainNavTabs(navUrls);

  return (
    <PageLayout
      top={
        <AntHeader className={styles["header"]}>
          <LinkComponent href={logoHref} className={styles["logoLink"]}>
            <Logo />
          </LinkComponent>
          <div className={styles["nav"]}>
            <Header
              tabs={tabs}
              selectedKey={MAIN_NAV_KEYS.restaurants}
              LinkComponent={LinkComponent}
            />
          </div>
        </AntHeader>
      }
      footer={<Footer text={footerText} />}
    >
      <div className={styles["contentInner"]}>{children}</div>
    </PageLayout>
  );
}
