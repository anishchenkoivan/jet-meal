import "@jet-meal/ui-lib/src/css/jet-meal-global.css";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { ReactNode } from "react";
import { DeliveryAppShell } from "../src/components/DeliveryAppShell/DeliveryAppShell";
import { createMainNavTabs } from "@jet-meal/ui-lib/src/navigation/mainNavTabs";
import {
  getLogoHrefFromPublicEnv,
  getMainNavUrlsFromPublicEnv,
} from "@jet-meal/ui-lib/src/navigation/mainNavEnv";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tabs = createMainNavTabs(getMainNavUrlsFromPublicEnv());
  const logoHref = getLogoHrefFromPublicEnv();

  return (
    <html lang="ru">
      <body suppressHydrationWarning>
        <AntdRegistry>
          <DeliveryAppShell tabs={tabs} logoHref={logoHref}>
            {children}
          </DeliveryAppShell>
        </AntdRegistry>
      </body>
    </html>
  );
}
