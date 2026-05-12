import "./globals.css";

import { Footer } from "@jet-meal/ui-lib/src/components/Footer/Footer";
import { JetMealDevFab } from "@jet-meal/ui-lib/src/components/JetMealDevTools/JetMealDevFab";
import { AppLayout } from "@jet-meal/ui-lib/src/containers/AppLayout/AppLayout";
import { JetMealDevMockProvider } from "@jet-meal/ui-lib/src/context/JetMealDevMockContext";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AuthHeader } from "../src/components/AuthHeader/AuthHeader";

export const metadata: Metadata = {
  title: "Jet Meal — доставка еды",
  description: "Заказывайте блюда из ресторанов с доставкой на дом",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body suppressHydrationWarning>
        <JetMealDevMockProvider>
          <AppLayout
            header={<AuthHeader />}
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
