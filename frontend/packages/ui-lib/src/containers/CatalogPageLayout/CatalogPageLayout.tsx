"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import { Footer } from "../../components/Footer/Footer";
import type { LinkRenderProps } from "../../components/Header/Header";
import {
  NavListBlock,
  type NavListMobileSearchProps,
} from "../../components/NavListBlock/NavListBlock";
import { SiteAppHeader } from "../../components/SiteAppHeader/SiteAppHeader";
import { PageLayout } from "../PageLayout/PageLayout";
import {
  getLogoHrefFromPublicEnv,
  getMainNavUrlsFromPublicEnv,
} from "../../navigation/mainNavEnv";
import {
  createMainNavTabs,
  MAIN_NAV_KEYS,
  type MainNavUrls,
} from "../../navigation/mainNavTabs";
import styles from "./CatalogPageLayout.module.css";

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
   * `true` (по умолчанию) — полный сайт: `PageLayout` + шапка + футер.
   * `false` — только колонка каталога (родитель уже дал общий `PageLayout` / шапку / футер).
   */
  includeSiteChrome?: boolean;
  navUrls?: MainNavUrls;
  /** Активная вкладка в шапке (`MAIN_NAV_KEYS`) */
  selectedNavKey?: string;
  logoHref?: string;
  footerText?: string;
  LinkComponent?: React.ComponentType<LinkRenderProps>;
  /** Слоты левой колонки навигации — без привязки к конкретным полям */
  sidebarTitle?: ReactNode;
  sidebarBody?: ReactNode;
  sidebarFooter?: ReactNode;
  /** Высота верхней панели (мобильная полоска под хедером) */
  pageHeaderHeightPx?: number;
  /** Оверлей карточки (`/catalog/dish/…`, `/restaurants/[id]`) — скрыть боковую колонку и мобильную полоску. */
  hideNavListChrome?: boolean;
  /** Первая загрузка: скелет боковой колонки и мобильной полоски. */
  navListLoading?: boolean;
  onMobileApply?: () => void;
  onMobileResetNav?: () => void;
  /** Мобильная строка поиска (синхронизация с query). */
  mobileSearchField?: NavListMobileSearchProps;
  /** Если `true`, внутренний блок на всю ширину родителя (родитель задаёт max-width и поля). */
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
  sidebarBody,
  sidebarFooter,
  pageHeaderHeightPx = 64,
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
        styles["contentInner"],
        relaxContentInnerWidth && styles["contentInnerFullWidth"],
      )}
    >
      <NavListBlock
        pageHeaderHeightPx={pageHeaderHeightPx}
        asideTitle={sidebarTitle}
        asideBody={sidebarBody}
        asideFooter={sidebarFooter}
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
    <PageLayout
      top={
        <SiteAppHeader
          tabs={tabs}
          selectedKey={selectedNavKey}
          LinkComponent={LinkComponent}
          logoHref={logoHref}
        />
      }
      footer={<Footer text={footerText} />}
      contentPadding={hideChrome ? 0 : 24}
    >
      {catalogBody}
    </PageLayout>
  );
}
