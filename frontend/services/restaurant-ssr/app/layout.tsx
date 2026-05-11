import "./globals.css";

import { Footer } from "@jet-meal/ui-lib/src/components/Footer/Footer";
import { JetMealDevFab } from "@jet-meal/ui-lib/src/components/JetMealDevTools/JetMealDevFab";
import { AppLayout } from "@jet-meal/ui-lib/src/containers/AppLayout/AppLayout";
import {
  getLogoHrefFromPublicEnv,
  getMainNavUrlsFromPublicEnv,
} from "@jet-meal/ui-lib/src/navigation/mainNavEnv";
import { createMainNavTabs } from "@jet-meal/ui-lib/src/navigation/mainNavTabs";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import { RestaurantDevCartBridge } from "../src/components/dev/RestaurantDevCartBridge";
import { RestaurantHeader } from "../src/components/RestaurantHeader/RestaurantHeader";
import { RestaurantLayoutClient } from "../src/components/RestaurantLayoutClient/RestaurantLayoutClient";
import { RestaurantCartProvider } from "../src/context/restaurant-cart-context";
import { RestaurantDevMockProvider } from "../src/context/restaurant-dev-mock-context";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const tabs = createMainNavTabs(getMainNavUrlsFromPublicEnv());
  const logoHref = getLogoHrefFromPublicEnv();

  return (
    <html lang="ru">
      <body suppressHydrationWarning>
        <RestaurantCartProvider>
          <RestaurantDevMockProvider>
            <RestaurantDevCartBridge>
              <AppLayout
                header={<RestaurantHeader tabs={tabs} logoHref={logoHref} />}
                footer={<Footer text="© Jet Meal" />}
              >
                <RestaurantLayoutClient>{children}</RestaurantLayoutClient>
                <JetMealDevFab />
              </AppLayout>
            </RestaurantDevCartBridge>
          </RestaurantDevMockProvider>
        </RestaurantCartProvider>
      </body>
    </html>
  );
}
