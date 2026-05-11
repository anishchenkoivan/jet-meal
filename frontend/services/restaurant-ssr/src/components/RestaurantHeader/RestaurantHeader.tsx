"use client";

import type {
  HeaderTab,
  LinkRenderProps,
} from "@jet-meal/ui-lib/src/components/Header/Header";
import { SiteAppHeader } from "@jet-meal/ui-lib/src/components/SiteAppHeader/SiteAppHeader";
import { LayoutBandSlot } from "@jet-meal/ui-lib/src/containers/PageLayout/LayoutBandContext";
import { selectMainNavKeyFromPathname } from "@jet-meal/ui-lib/src/navigation/selectMainNavKeyFromPathname";
import { usePathname } from "next/navigation";
import { RestaurantCartMobileNav } from "../RestaurantCartMobileNav/RestaurantCartMobileNav";

function HardNavLink({ href, className, children, onClick }: LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export type RestaurantHeaderProps = {
  tabs: HeaderTab[];
  logoHref: string;
};

export function RestaurantHeader({ tabs, logoHref }: RestaurantHeaderProps) {
  const pathname = usePathname();
  const selectedKey = selectMainNavKeyFromPathname(pathname);

  return (
    <SiteAppHeader
      tabs={tabs}
      selectedKey={selectedKey}
      LinkComponent={HardNavLink}
      logoHref={logoHref}
      bandSlot={<LayoutBandSlot />}
      navAfter={<RestaurantCartMobileNav />}
    />
  );
}
