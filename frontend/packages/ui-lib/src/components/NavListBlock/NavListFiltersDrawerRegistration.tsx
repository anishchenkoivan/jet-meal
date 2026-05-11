"use client";

import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import {
  SINGLE_MOBILE_DRAWER_NAV_LIST_FILTERS_KEY,
  type SingleMobileDrawerSlotConfig,
  useOptionalSingleMobileDrawer,
} from "../SingleMobileDrawer/SingleMobileDrawerProvider";

export type NavListFiltersDrawerRegistrationProps = {
  enabled: boolean;
  asideTitle?: ReactNode;
  filtersSlotContent: ReactNode;
  filtersBodyClassName: string;
};

export function NavListFiltersDrawerRegistration({
  enabled,
  asideTitle,
  filtersSlotContent,
  filtersBodyClassName,
}: NavListFiltersDrawerRegistrationProps) {
  const single = useOptionalSingleMobileDrawer();
  const singleRef = useRef(single);
  singleRef.current = single;

  useLayoutEffect(() => {
    const s = singleRef.current;
    if (!s || !enabled) {
      return;
    }
    const cfg: SingleMobileDrawerSlotConfig = {
      content: filtersSlotContent,
      title: asideTitle ?? undefined,
      closable: false,
      bodyClassName: filtersBodyClassName,
    };
    s.registerMobileDrawerSlot(SINGLE_MOBILE_DRAWER_NAV_LIST_FILTERS_KEY, cfg);
    return () => {
      singleRef.current?.registerMobileDrawerSlot(
        SINGLE_MOBILE_DRAWER_NAV_LIST_FILTERS_KEY,
        null,
      );
    };
  }, [
    enabled,
    asideTitle,
    filtersSlotContent,
    filtersBodyClassName,
  ]);

  useEffect(() => {
    return () => {
      const s = singleRef.current;
      if (!s) return;
      if (s.isActive(SINGLE_MOBILE_DRAWER_NAV_LIST_FILTERS_KEY)) {
        s.close();
      }
      s.registerMobileDrawerSlot(
        SINGLE_MOBILE_DRAWER_NAV_LIST_FILTERS_KEY,
        null,
      );
    };
  }, []);

  return null;
}
