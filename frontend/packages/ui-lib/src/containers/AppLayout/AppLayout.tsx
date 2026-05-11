import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { ReactNode } from "react";
import { AppLayoutShell } from "./AppLayoutShell";

export type AppLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AppLayout({ header, children, footer }: AppLayoutProps) {
  return (
    <AntdRegistry>
      <AppLayoutShell header={header} footer={footer}>
        {children}
      </AppLayoutShell>
    </AntdRegistry>
  );
}
