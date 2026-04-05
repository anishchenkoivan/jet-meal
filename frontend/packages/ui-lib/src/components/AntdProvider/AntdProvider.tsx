"use client";

import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import type { ReactNode } from "react";

export function AntdProvider({ children }: { children: ReactNode }) {
  return <ConfigProvider locale={ruRU}>{children}</ConfigProvider>;
}
