"use client";

import { HeaderMobileNavDrawerBody } from "@jet-meal/ui-lib/src/components/Header/HeaderMobileNavDrawerBody";
import type { HeaderTab, LinkRenderProps } from "@jet-meal/ui-lib/src/components/Header/Header";
import { MobileDrawer } from "@jet-meal/ui-lib/src/components/MobileDrawer/MobileDrawer";
import {
  SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY,
  useSingleMobileDrawer,
} from "@jet-meal/ui-lib/src/components/SingleMobileDrawer/SingleMobileDrawerProvider";
import { RestaurantCartPanel } from "../RestaurantCartPanel/RestaurantCartPanel";
import { RESTAURANT_MOBILE_DRAWER_CART_KEY } from "./restaurantMobileDrawerKeys";
import styles from "./RestaurantMobileDrawerHost.module.css";

export type RestaurantMobileDrawerHostProps = {
  tabs: HeaderTab[];
  selectedKey?: string;
  LinkComponent?: React.ComponentType<LinkRenderProps>;
};

export function RestaurantMobileDrawerHost({
  tabs,
  selectedKey,
  LinkComponent,
}: RestaurantMobileDrawerHostProps) {
  const { activeKey, close } = useSingleMobileDrawer();

  const open = activeKey !== null;
  const isCart = activeKey === RESTAURANT_MOBILE_DRAWER_CART_KEY;
  const isNav = activeKey === SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY;

  return (
    <MobileDrawer
      open={open}
      onClose={close}
      topOffsetPx={68}
      closable={false}
      destroyOnClose={false}
      bodyClassName={isCart ? styles["cartBody"] : undefined}
    >
      {isNav ? (
        <HeaderMobileNavDrawerBody
          tabs={tabs}
          selectedKey={selectedKey}
          LinkComponent={LinkComponent}
          onNavigate={close}
        />
      ) : null}
      {isCart ? <RestaurantCartPanel /> : null}
    </MobileDrawer>
  );
}
