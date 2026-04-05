import type { ReactNode } from "react";
import type { Metadata } from "next";
import cx from "classnames";
import { AntdProvider } from "../../../packages/ui-lib/src/components/AntdProvider/AntdProvider";
import { ApolloProvider } from "../src/components/ApolloProvider/ApolloProvider";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Jet Meal — restaurant",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className={cx(styles["body"])}>
        <AntdProvider>
          <ApolloProvider>{children}</ApolloProvider>
        </AntdProvider>
      </body>
    </html>
  );
}
