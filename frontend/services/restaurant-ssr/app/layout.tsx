import "@jet-meal/ui-lib/src/css/jet-meal-global.css";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { ReactNode } from "react";
import { RestaurantAppShell } from "../src/components/RestaurantAppShell/RestaurantAppShell";
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
          <RestaurantAppShell tabs={tabs} logoHref={logoHref}>
            {children}
          </RestaurantAppShell>
        </AntdRegistry>
      </body>
    </html>
  );
}
