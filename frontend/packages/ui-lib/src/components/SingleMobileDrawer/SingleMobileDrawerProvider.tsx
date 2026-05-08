"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Ключ слота основного меню в шапке (мобильная версия). */
export const SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY = "jet-meal:header-main-nav";

export type SingleMobileDrawerContextValue = {
  /** Какой слот сейчас открыт, или null */
  activeKey: string | null;
  /**
   * Если key уже открыт — закрыть.
   * Иначе открыть этот слот (предыдущий, если был, заменяется).
   */
  toggle: (key: string) => void;
  /** Всегда открыть слот key (заменяет текущий; не закрывает по повтору). */
  open: (key: string) => void;
  close: () => void;
  isActive: (key: string) => boolean;
};

const SingleMobileDrawerContext =
  createContext<SingleMobileDrawerContextValue | null>(null);

export function SingleMobileDrawerProvider({ children }: { children: ReactNode }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const toggle = useCallback((key: string) => {
    setActiveKey((prev) => (prev === key ? null : key));
  }, []);

  const open = useCallback((key: string) => {
    setActiveKey(key);
  }, []);

  const close = useCallback(() => {
    setActiveKey(null);
  }, []);

  const isActive = useCallback(
    (key: string) => activeKey === key,
    [activeKey],
  );

  const value = useMemo<SingleMobileDrawerContextValue>(
    () => ({ activeKey, toggle, open, close, isActive }),
    [activeKey, toggle, open, close, isActive],
  );

  return (
    <SingleMobileDrawerContext.Provider value={value}>
      {children}
    </SingleMobileDrawerContext.Provider>
  );
}

export function useSingleMobileDrawer(): SingleMobileDrawerContextValue {
  const ctx = useContext(SingleMobileDrawerContext);
  if (!ctx) {
    throw new Error(
      "useSingleMobileDrawer must be used within SingleMobileDrawerProvider",
    );
  }
  return ctx;
}

export function useOptionalSingleMobileDrawer(): SingleMobileDrawerContextValue | null {
  return useContext(SingleMobileDrawerContext);
}
