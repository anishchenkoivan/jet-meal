"use client";

import { CloseIcon, MenuIcon } from "../Icons/Icons";
import { Dropdown } from "antd";
import { MobileDrawer, MOBILE_DRAWER_BELOW_HEADER_Z_INDEX } from "../MobileDrawer/MobileDrawer";
import {
  SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY,
  useOptionalSingleMobileDrawer,
} from "../SingleMobileDrawer/SingleMobileDrawerProvider";
import cx from "classnames";
import { useCallback, useState } from "react";
import type { HeaderTab, LinkRenderProps } from "./HeaderTypes";
import { HeaderMobileNavDrawerBody } from "./HeaderMobileNavDrawerBody";
import styles from "./Header.module.css";

export type { HeaderSubmenuItem, HeaderTab, LinkRenderProps } from "./HeaderTypes";

export const HEADER_DESKTOP_MIN_PX = 768;

export const HEADER_MOBILE_DRAWER_Z_INDEX = MOBILE_DRAWER_BELOW_HEADER_Z_INDEX;

function DefaultLink({
  href,
  className,
  children,
  onClick,
}: LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export type HeaderProps = {
  tabs: HeaderTab[];
  selectedKey?: string;
  LinkComponent?: React.ComponentType<LinkRenderProps>;
  mobileDrawerTopOffsetPx?: number;
};

export function Header({
  tabs,
  selectedKey,
  LinkComponent = DefaultLink,
  mobileDrawerTopOffsetPx = 64,
}: HeaderProps) {
  const singleDrawer = useOptionalSingleMobileDrawer();
  const [localOpen, setLocalOpen] = useState(false);

  const navKey = SINGLE_MOBILE_DRAWER_HEADER_NAV_KEY;
  const navOpen = singleDrawer ? singleDrawer.isActive(navKey) : localOpen;

  const closeNav = useCallback(() => {
    if (singleDrawer) {
      singleDrawer.close();
    } else {
      setLocalOpen(false);
    }
  }, [singleDrawer]);

  const toggleNav = () => {
    if (singleDrawer) {
      singleDrawer.toggle(navKey);
    } else {
      setLocalOpen((v) => !v);
    }
  };

  return (
    <>
      <nav className={cx(styles["desktopNav"])} aria-label="Основное меню">
        {tabs.map((tab) => {
          const active =
            selectedKey === tab.key ||
            tab.submenu?.some((s) => selectedKey === s.key);
          if (tab.submenu?.length) {
            return (
              <span key={tab.key} className={styles["navItemRow"]}>
                {tab.dividerBefore ? (
                  <span
                    className={styles["navDivider"]}
                    aria-hidden
                  />
                ) : null}
                <Dropdown
                  trigger={["hover", "click"]}
                  placement="bottomLeft"
                  classNames={{ root: styles["desktopDropdown"] }}
                  menu={{
                    className: styles["desktopDropdownMenu"],
                    items: tab.submenu.map((item) => ({
                      key: item.key,
                      label: (
                        <LinkComponent
                          href={item.href}
                          className={styles["desktopDropdownLink"]}
                        >
                          {item.label}
                        </LinkComponent>
                      ),
                    })),
                  }}
                >
                  <span
                    tabIndex={0}
                    role="button"
                    className={cx(
                      styles["navLink"],
                      styles["navLinkDropdownTrigger"],
                      active && styles["navLinkActive"],
                    )}
                  >
                    {tab.label}
                  </span>
                </Dropdown>
              </span>
            );
          }
          return (
            <span key={tab.key} className={styles["navItemRow"]}>
              {tab.dividerBefore ? (
                <span className={styles["navDivider"]} aria-hidden />
              ) : null}
              <LinkComponent
                href={tab.href}
                className={cx(
                  styles["navLink"],
                  selectedKey === tab.key && styles["navLinkActive"],
                )}
              >
                {tab.label}
              </LinkComponent>
            </span>
          );
        })}
      </nav>

      <div className={cx(styles["mobileNav"])}>
        <button
          type="button"
          className={cx(styles["menuToggle"])}
          aria-label={navOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={navOpen}
          onClick={toggleNav}
        >
          {navOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        {!singleDrawer ? (
          <MobileDrawer
            open={localOpen}
            onClose={() => setLocalOpen(false)}
            topOffsetPx={mobileDrawerTopOffsetPx}
            zIndex={HEADER_MOBILE_DRAWER_Z_INDEX}
          >
            <HeaderMobileNavDrawerBody
              tabs={tabs}
              selectedKey={selectedKey}
              LinkComponent={LinkComponent}
              onNavigate={closeNav}
            />
          </MobileDrawer>
        ) : null}
      </div>
    </>
  );
}
