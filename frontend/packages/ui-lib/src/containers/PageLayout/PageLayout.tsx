"use client";

import { Layout } from "antd";
import type { ReactNode } from "react";

const { Content } = Layout;

export type PageLayoutProps = {
  top: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  contentPadding?: number;
};

const layoutBg = "var(--ant-color-bg-layout, #f5f5f5)";

export function PageLayout({
  top,
  footer,
  children,
  contentPadding = 24,
}: PageLayoutProps) {
  return (
    <Layout
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: layoutBg,
      }}
    >
      {top}
      <Content
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          padding: contentPadding,
          background: "transparent",
        }}
      >
        {children}
      </Content>
      {footer ?? null}
    </Layout>
  );
}
