"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { AntdProvider } from "@jet-meal/ui-lib/src/components/AntdProvider/AntdProvider";
import { Footer } from "@jet-meal/ui-lib/src/components/Footer/Footer";
import type { HeaderTab, LinkRenderProps } from "@jet-meal/ui-lib/src/components/Header/Header";
import { SiteAppHeader } from "@jet-meal/ui-lib/src/components/SiteAppHeader/SiteAppHeader";
import { PageLayout } from "@jet-meal/ui-lib/src/containers/PageLayout/PageLayout";
import { selectMainNavKeyFromPathname } from "@jet-meal/ui-lib/src/navigation/selectMainNavKeyFromPathname";
import { SingleMobileDrawerProvider, useSingleMobileDrawer } from "@jet-meal/ui-lib/src/components/SingleMobileDrawer/SingleMobileDrawerProvider";
import { RestaurantCartProvider } from "../../context/restaurant-cart-context";
import { RestaurantCartMobileNav } from "../RestaurantCartMobileNav/RestaurantCartMobileNav";
import { RestaurantMobileDrawerHost } from "../RestaurantMobileDrawerHost/RestaurantMobileDrawerHost";

function HardNavLink({ href, className, children, onClick }: LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

/** Закрывает общий нижний дроуер при переходе на оформление заказа. */
function CloseDrawerOnCheckoutRoute() {
  const pathname = usePathname();
  const { close } = useSingleMobileDrawer();

  useEffect(() => {
    if (pathname?.includes("/restaurant/") && pathname.endsWith("/checkout")) {
      close();
    }
  }, [pathname, close]);

  return null;
}

export type RestaurantAppShellProps = {
  tabs: HeaderTab[];
  logoHref: string;
  children: ReactNode;
};

export function RestaurantAppShell({
  tabs,
  logoHref,
  children,
}: RestaurantAppShellProps) {
  const pathname = usePathname();
  const selectedKey = selectMainNavKeyFromPathname(pathname);

  return (
    <AntdProvider>
      <RestaurantCartProvider>
        <SingleMobileDrawerProvider>
          <CloseDrawerOnCheckoutRoute />
          <PageLayout
            contentPadding={0}
            top={
              <SiteAppHeader
                tabs={tabs}
                selectedKey={selectedKey}
                LinkComponent={HardNavLink}
                logoHref={logoHref}
                navAfter={<RestaurantCartMobileNav />}
              />
            }
            footer={<Footer text="© Jet Meal" />}
          >
            {children}
          </PageLayout>
          <RestaurantMobileDrawerHost
            tabs={tabs}
            selectedKey={selectedKey}
            LinkComponent={HardNavLink}
          />
        </SingleMobileDrawerProvider>
      </RestaurantCartProvider>
    </AntdProvider>
  );
}
