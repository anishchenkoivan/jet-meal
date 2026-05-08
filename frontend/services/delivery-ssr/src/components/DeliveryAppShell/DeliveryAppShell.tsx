"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AntdProvider } from "@jet-meal/ui-lib/src/components/AntdProvider/AntdProvider";
import { Footer } from "@jet-meal/ui-lib/src/components/Footer/Footer";
import type { HeaderTab, LinkRenderProps } from "@jet-meal/ui-lib/src/components/Header/Header";
import { SiteAppHeader } from "@jet-meal/ui-lib/src/components/SiteAppHeader/SiteAppHeader";
import { PageLayout } from "@jet-meal/ui-lib/src/containers/PageLayout/PageLayout";
import { selectMainNavKeyFromPathname } from "@jet-meal/ui-lib/src/navigation/selectMainNavKeyFromPathname";

function HardNavLink({ href, className, children, onClick }: LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export type DeliveryAppShellProps = {
  tabs: HeaderTab[];
  logoHref: string;
  children: ReactNode;
};

export function DeliveryAppShell({
  tabs,
  logoHref,
  children,
}: DeliveryAppShellProps) {
  const pathname = usePathname();
  const selectedKey = selectMainNavKeyFromPathname(pathname);

  return (
    <AntdProvider>
          <PageLayout
            contentPadding={0}
            top={
          <SiteAppHeader
            tabs={tabs}
            selectedKey={selectedKey}
            LinkComponent={HardNavLink}
            logoHref={logoHref}
          />
        }
        footer={<Footer text="© Jet Meal" />}
      >
        {children}
      </PageLayout>
    </AntdProvider>
  );
}
