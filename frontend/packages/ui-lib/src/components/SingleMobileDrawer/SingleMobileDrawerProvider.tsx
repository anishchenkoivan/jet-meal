"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { MobileDrawer } from "../MobileDrawer/MobileDrawer";

export const SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY = "jet-meal:header-main-nav";

export const SINGLE_MOBILE_DRAWER_NAV_LIST_FILTERS_KEY =
  "jet-meal:nav-list-filters";

export type SingleMobileDrawerSlotConfig = {
  content: ReactNode;
  title?: ReactNode;
  closable?: boolean;
  bodyClassName?: string;
};

export type SingleMobileDrawerContextValue = {
  activeKey: string | null;
  slots: Record<string, SingleMobileDrawerSlotConfig>;
  toggle: (key: string) => void;
  open: (key: string) => void;
  close: () => void;
  isActive: (key: string) => boolean;
  registerMobileDrawerSlot: (
    key: string,
    config: SingleMobileDrawerSlotConfig | null,
  ) => void;
};

const SingleMobileDrawerContext =
  createContext<SingleMobileDrawerContextValue | null>(null);

function SingleMobileDrawerView() {
  const { activeKey, close, slots } = useSingleMobileDrawer();
  const slot = activeKey ? (slots[activeKey] ?? null) : null;
  const open = Boolean(activeKey && slot);

  return (
    <MobileDrawer
      open={open}
      onClose={close}
      title={slot?.title}
      closable={slot?.closable ?? false}
      bodyClassName={slot?.bodyClassName}
    >
      {slot?.content ?? null}
    </MobileDrawer>
  );
}

export function SingleMobileDrawerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [slots, setSlots] = useState<
    Record<string, SingleMobileDrawerSlotConfig>
  >({});

  const registerMobileDrawerSlot = useCallback(
    (key: string, config: SingleMobileDrawerSlotConfig | null) => {
      if (config === null) {
        setSlots((prev) => {
          if (!(key in prev)) return prev;
          const next = { ...prev };
          delete next[key];
          return next;
        });
        return;
      }
      setSlots((prev) => ({ ...prev, [key]: config }));
    },
    [],
  );

  const toggle = useCallback((key: string) => {
    setActiveKey((prev) => (prev === key ? null : key));
  }, []);

  const open = useCallback((key: string) => {
    setActiveKey(key);
  }, []);

  const close = useCallback(() => {
    setActiveKey(null);
  }, []);

  const isActive = useCallback((key: string) => activeKey === key, [activeKey]);

  const value = useMemo<SingleMobileDrawerContextValue>(
    () => ({
      activeKey,
      slots,
      toggle,
      open,
      close,
      isActive,
      registerMobileDrawerSlot,
    }),
    [activeKey, slots, toggle, open, close, isActive, registerMobileDrawerSlot],
  );

  return (
    <SingleMobileDrawerContext.Provider value={value}>
      {children}
      <SingleMobileDrawerView />
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
