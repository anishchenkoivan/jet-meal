"use client";

import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { Footer } from "../../../../../packages/ui-lib/src/components/Footer/Footer";
import type { LinkRenderProps } from "../../../../../packages/ui-lib/src/components/Header/Header";
import { SiteAppHeader } from "../../../../../packages/ui-lib/src/components/SiteAppHeader/SiteAppHeader";
import { PageLayout } from "../../../../../packages/ui-lib/src/containers/PageLayout/PageLayout";
import { getLogoHrefFromPublicEnv, getMainNavUrlsFromPublicEnv } from "../../../../../packages/ui-lib/src/navigation/mainNavEnv";
import { createMainNavTabs } from "../../../../../packages/ui-lib/src/navigation/mainNavTabs";
import { selectMainNavKeyFromPathname } from "../../../../../packages/ui-lib/src/navigation/selectMainNavKeyFromPathname";

function HardNavLink({ href, className, children, onClick }: LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export function SiteChromeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const navUrls = useMemo(() => getMainNavUrlsFromPublicEnv(), []);
  const tabs = useMemo(() => createMainNavTabs(navUrls), [navUrls]);
  const selectedKey = useMemo(
    () => selectMainNavKeyFromPathname(pathname),
    [pathname],
  );
  const logoHref = useMemo(() => getLogoHrefFromPublicEnv(), []);

  const isHome = pathname === "/";
  const accountArea = pathname === "/my" || pathname?.startsWith("/my/");

  return (
    <PageLayout
      top={
        <SiteAppHeader
          tabs={tabs}
          selectedKey={selectedKey}
          LinkComponent={HardNavLink}
          logoHref={logoHref}
        />
      }
      footer={isHome ? undefined : <Footer text="© Jet Meal" />}
      contentPadding={isHome || accountArea ? 0 : 24}
    >
      {children}
    </PageLayout>
  );
}
