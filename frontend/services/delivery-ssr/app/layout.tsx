import "./globals.css";

import { Footer } from "@jet-meal/ui-lib/src/components/Footer/Footer";
import { JetMealDevFab } from "@jet-meal/ui-lib/src/components/JetMealDevTools/JetMealDevFab";
import { AppLayout } from "@jet-meal/ui-lib/src/containers/AppLayout/AppLayout";
import { JetMealDevMockProvider } from "@jet-meal/ui-lib/src/context/JetMealDevMockContext";
import {
  getLogoHrefFromPublicEnv,
  getMainNavUrlsFromPublicEnv,
} from "@jet-meal/ui-lib/src/navigation/mainNavEnv";
import { createMainNavTabs } from "@jet-meal/ui-lib/src/navigation/mainNavTabs";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import { DeliveryHeader } from "../src/components/DeliveryHeader/DeliveryHeader";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const tabs = createMainNavTabs(getMainNavUrlsFromPublicEnv());
  const logoHref = getLogoHrefFromPublicEnv();

  return (
    <html lang="ru">
      <body suppressHydrationWarning>
        <JetMealDevMockProvider>
          <AppLayout
            header={<DeliveryHeader tabs={tabs} logoHref={logoHref} />}
            footer={<Footer text="© Jet Meal" />}
          >
            {children}
            <JetMealDevFab />
          </AppLayout>
        </JetMealDevMockProvider>
      </body>
    </html>
  );
}
