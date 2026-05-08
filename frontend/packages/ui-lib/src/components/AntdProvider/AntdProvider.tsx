"use client";

import React, { useMemo } from "react";
import { ConfigProvider } from "antd";
import type { ThemeConfig } from "antd/es/config-provider/context";
import ruRU from "antd/locale/ru_RU";

const defaultTheme: ThemeConfig = {
  token: {
    fontFamily:
      "'Yandex Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Modal: {
      boxShadow: "none",
      boxShadowSecondary: "none",
    },
  },
};

export type AntdProviderProps = {
  children: React.ReactNode;
  theme?: ThemeConfig;
};

export function AntdProvider({ children, theme }: AntdProviderProps) {
  const mergedTheme = useMemo((): ThemeConfig => {
    return {
      ...defaultTheme,
      ...theme,
      token: {
        ...defaultTheme.token,
        ...theme?.token,
      },
      components: {
        ...defaultTheme.components,
        ...theme?.components,
        Modal: {
          ...defaultTheme.components?.Modal,
          ...theme?.components?.Modal,
          boxShadow: "none",
          boxShadowSecondary: "none",
        },
      },
    };
  }, [theme]);

  return (
    <ConfigProvider locale={ruRU} theme={mergedTheme}>
      {children}
    </ConfigProvider>
  );
}
