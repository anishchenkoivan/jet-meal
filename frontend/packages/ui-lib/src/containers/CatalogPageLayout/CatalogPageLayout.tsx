"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import { Footer } from "../../components/Footer/Footer";
import type { LinkRenderProps } from "../../components/Header/Header";
import {
  NavListBlock,
  type NavListBlockProps,
  type NavListMobileSearchProps,
} from "../../components/NavListBlock/NavListBlock";
import { SiteAppHeader } from "../../components/SiteAppHeader/SiteAppHeader";
import {
  getLogoHrefFromPublicEnv,
  getMainNavUrlsFromPublicEnv,
} from "../../navigation/mainNavEnv";
import {
  createMainNavTabs,
  MAIN_NAV_KEYS,
  type MainNavUrls,
} from "../../navigation/mainNavTabs";
import { AppLayout } from "../AppLayout/AppLayout";

function DefaultLink({ href, className, children, onClick }: LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export type CatalogPageLayoutProps = {
  children: ReactNode;
  /**
   * `true` (по умолчанию) — полный сайт: `AppLayout` + шапка + футер.
   * `false` — только колонка каталога (родитель уже дал общий `AppLayout` / шапку / футер).
   */
  includeSiteChrome?: boolean;
  navUrls?: MainNavUrls;
  selectedNavKey?: string;
  logoHref?: string;
  footerText?: string;
  LinkComponent?: React.ComponentType<LinkRenderProps>;
  sidebarTitle?: ReactNode;
  sidebarAriaLabel?: string;
  sidebarBody?: ReactNode;
  sidebarFooter?: ReactNode;
  sidebarClassName?: string;
  /** Кастомная полоса в шапке на мобильной ширине вместо поиска+фильтров. */
  mobileTopBar?: NavListBlockProps["mobileTopBar"];
  pageHeaderHeightPx?: number;
  hideNavListChrome?: boolean;
  navListLoading?: boolean;
  onMobileApply?: () => void;
  onMobileResetNav?: () => void;
  mobileSearchField?: NavListMobileSearchProps;
  relaxContentInnerWidth?: boolean;
};

export function CatalogPageLayout({
  children,
  includeSiteChrome = true,
  navUrls = getMainNavUrlsFromPublicEnv(),
  selectedNavKey = MAIN_NAV_KEYS.restaurants,
  logoHref = getLogoHrefFromPublicEnv(),
  footerText = "© Jet Meal",
  LinkComponent = DefaultLink,
  sidebarTitle,
  sidebarAriaLabel,
  sidebarBody,
  sidebarFooter,
  sidebarClassName,
  mobileTopBar,
  hideNavListChrome,
  navListLoading,
  onMobileApply,
  onMobileResetNav,
  mobileSearchField,
  relaxContentInnerWidth,
}: CatalogPageLayoutProps) {
  const hideChrome = hideNavListChrome ?? false;
  const listLoading = navListLoading ?? false;
  const onReset = onMobileResetNav;

  const catalogBody = (
    <div
      className={cx(
        "flex flex-1 flex-col min-h-0 box-border w-full max-w-[min(992px,100%)] mx-auto",
        relaxContentInnerWidth && "max-w-none mx-0",
      )}
    >
      <NavListBlock
        asideTitle={sidebarTitle}
        asideAriaLabel={sidebarAriaLabel}
        asideBody={sidebarBody}
        asideFooter={sidebarFooter}
        asideClassName={sidebarClassName}
        mobileTopBar={mobileTopBar}
        mobileSearchField={mobileSearchField}
        hideNavListChrome={hideChrome}
        navListLoading={listLoading}
        onMobileApply={onMobileApply}
        onMobileResetNav={onReset}
      >
        {children}
      </NavListBlock>
    </div>
  );

  if (!includeSiteChrome) {
    return catalogBody;
  }

  const tabs = createMainNavTabs(navUrls);

  return (
    <AppLayout
      header={
        <SiteAppHeader
          tabs={tabs}
          selectedKey={selectedNavKey}
          LinkComponent={LinkComponent}
          logoHref={logoHref}
        />
      }
      footer={<Footer text={footerText} />}
    >
      <div className={hideChrome ? undefined : "p-6"}>
        {catalogBody}
      </div>
    </AppLayout>
  );
}
