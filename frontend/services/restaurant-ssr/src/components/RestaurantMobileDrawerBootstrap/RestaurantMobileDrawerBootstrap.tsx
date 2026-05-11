"use client";

import type {
  HeaderTab,
  LinkRenderProps,
} from "@jet-meal/ui-lib/src/components/Header/Header";
import { HeaderMobileNavDrawerBody } from "@jet-meal/ui-lib/src/components/Header/HeaderMobileNavDrawerBody";
import {
  SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY,
  type SingleMobileDrawerSlotConfig,
  useSingleMobileDrawer,
} from "@jet-meal/ui-lib/src/components/SingleMobileDrawer/SingleMobileDrawerProvider";
import { useLayoutEffect } from "react";
import { RestaurantCartPanel } from "../RestaurantCartPanel/RestaurantCartPanel";
import { RESTAURANT_MOBILE_DRAWER_CART_KEY } from "./restaurantMobileDrawerKeys";

export type RestaurantMobileDrawerBootstrapProps = {
  tabs: HeaderTab[];
  selectedKey?: string;
  LinkComponent?: React.ComponentType<LinkRenderProps>;
};

export function RestaurantMobileDrawerBootstrap({
  tabs,
  selectedKey,
  LinkComponent,
}: RestaurantMobileDrawerBootstrapProps) {
  const { registerMobileDrawerSlot, close } = useSingleMobileDrawer();

  useLayoutEffect(() => {
    const navCfg: SingleMobileDrawerSlotConfig = {
      content: (
        <HeaderMobileNavDrawerBody
          tabs={tabs}
          selectedKey={selectedKey}
          LinkComponent={LinkComponent}
          onNavigate={close}
        />
      ),
    };
    registerMobileDrawerSlot(SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY, navCfg);
    return () =>
      registerMobileDrawerSlot(SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY, null);
  }, [tabs, selectedKey, LinkComponent, registerMobileDrawerSlot, close]);

  useLayoutEffect(() => {
    const cartCfg: SingleMobileDrawerSlotConfig = {
      content: <RestaurantCartPanel />,
      bodyClassName:
        "box-border flex flex-col flex-[1_1_auto] min-h-0 !overflow-hidden px-4 pt-3 pb-4 h-full",
    };
    registerMobileDrawerSlot(RESTAURANT_MOBILE_DRAWER_CART_KEY, cartCfg);
    return () =>
      registerMobileDrawerSlot(RESTAURANT_MOBILE_DRAWER_CART_KEY, null);
  }, [registerMobileDrawerSlot]);

  return null;
}
