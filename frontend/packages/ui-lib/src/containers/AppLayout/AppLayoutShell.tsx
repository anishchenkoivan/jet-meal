"use client";

import type { ReactNode } from "react";
import { AntdProvider } from "../../components/AntdProvider/AntdProvider";
import {
  DrawerProvider,
  DrawerZone,
} from "../../components/DrawerProvider/DrawerProvider";
import { LayoutBandProvider } from "../PageLayout/LayoutBandContext";

export type AppLayoutShellProps = {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AppLayoutShell({
  header,
  children,
  footer,
}: AppLayoutShellProps) {
  return (
    <AntdProvider>
      <LayoutBandProvider>
        <DrawerProvider>
          <div className="flex h-svh max-h-dvh min-h-0 flex-col overflow-hidden [background:var(--ant-color-bg-layout,#f5f5f5)]">
            <div className="flex-shrink-0">{header}</div>
            <DrawerZone>
              {/* Регион «main» между шапкой и футером: ограниченная высота; скролл у контента страницы */}
              <div className="flex flex-1 min-h-0 flex-col overflow-y-auto [-webkit-overflow-scrolling:touch]">
                {children}
              </div>
            </DrawerZone>
            {footer ? <div className="flex-shrink-0">{footer}</div> : null}
          </div>
        </DrawerProvider>
      </LayoutBandProvider>
    </AntdProvider>
  );
}
