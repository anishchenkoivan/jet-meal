import "@jet-meal/ui-lib/src/css/jet-meal-global.css";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import cx from "classnames";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AntdProvider } from "../../../packages/ui-lib/src/components/AntdProvider/AntdProvider";
import { SiteChromeLayout } from "../src/containers/SiteChromeLayout/SiteChromeLayout";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Jet Meal — доставка еды",
  description: "Заказывайте блюда из ресторанов с доставкой на дом",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={cx(styles["html"])}>
      <body className={cx(styles["body"])} suppressHydrationWarning>
        <AntdRegistry>
          <AntdProvider>
            <SiteChromeLayout>{children}</SiteChromeLayout>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
