"use client";

import type { LinkRenderProps } from "@jet-meal/ui-lib/src/components/Header/Header";
import { SiteAppHeader } from "@jet-meal/ui-lib/src/components/SiteAppHeader/SiteAppHeader";
import { LayoutBandSlot } from "@jet-meal/ui-lib/src/containers/PageLayout/LayoutBandContext";
import {
  getLogoHrefFromPublicEnv,
  getMainNavUrlsFromPublicEnv,
} from "@jet-meal/ui-lib/src/navigation/mainNavEnv";
import { createMainNavTabs } from "@jet-meal/ui-lib/src/navigation/mainNavTabs";
import { selectMainNavKeyFromPathname } from "@jet-meal/ui-lib/src/navigation/selectMainNavKeyFromPathname";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

function HardNavLink({ href, className, children, onClick }: LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export function AuthHeader() {
  const pathname = usePathname();
  const navUrls = useMemo(() => getMainNavUrlsFromPublicEnv(), []);
  const tabs = useMemo(() => createMainNavTabs(navUrls), [navUrls]);
  const selectedKey = useMemo(
    () => selectMainNavKeyFromPathname(pathname),
    [pathname],
  );
  const logoHref = useMemo(() => getLogoHrefFromPublicEnv(), []);

  return (
    <SiteAppHeader
      tabs={tabs}
      selectedKey={selectedKey}
      LinkComponent={HardNavLink}
      logoHref={logoHref}
      bandSlot={<LayoutBandSlot />}
    />
  );
}
