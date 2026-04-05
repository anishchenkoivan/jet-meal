"use client";

import { Layout } from "antd";
import type { ReactNode } from "react";

const { Content } = Layout;

export type PageLayoutProps = {
  /** Верхняя зона (логотип, табы в `Header` и т.д.) — собирается в сервисе. */
  top: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function PageLayout({ top, footer, children }: PageLayoutProps) {
  return (
    <Layout style={{ minHeight: "100dvh" }}>
      {top}
      <Content style={{ padding: 24 }}>{children}</Content>
      {footer ?? null}
    </Layout>
  );
}
