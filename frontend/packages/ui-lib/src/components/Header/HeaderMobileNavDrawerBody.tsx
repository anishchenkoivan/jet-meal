"use client";

import { Menu } from "antd";
import type { MenuProps } from "antd";
import cx from "classnames";
import { useMemo } from "react";
import type { HeaderTab, LinkRenderProps } from "./HeaderTypes";
import styles from "./Header.module.css";

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

export type HeaderMobileNavDrawerBodyProps = {
  tabs: HeaderTab[];
  selectedKey?: string;
  LinkComponent?: React.ComponentType<LinkRenderProps>;
  /** После перехода по ссылке из меню */
  onNavigate: () => void;
};

export function HeaderMobileNavDrawerBody({
  tabs,
  selectedKey,
  LinkComponent = DefaultLink,
  onNavigate,
}: HeaderMobileNavDrawerBodyProps) {
  const menuItems: MenuProps["items"] = useMemo(
    () =>
      tabs.map((tab) => {
        if (tab.submenu?.length) {
          return {
            key: tab.key,
            label: tab.label,
            children: tab.submenu.map((item) => ({
              key: item.key,
              label: (
                <LinkComponent href={item.href} onClick={onNavigate}>
                  {item.label}
                </LinkComponent>
              ),
            })),
          };
        }
        return {
          key: tab.key,
          label: (
            <LinkComponent href={tab.href} onClick={onNavigate}>
              {tab.label}
            </LinkComponent>
          ),
        };
      }),
    [tabs, LinkComponent, onNavigate],
  );

  return (
    <>
      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={selectedKey ? [selectedKey] : []}
        onClick={onNavigate}
        className={cx(styles["drawerMenu"])}
        style={{
          border: "none",
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "auto",
        }}
      />
      <div className={cx(styles["drawerFooterStrip"])} role="contentinfo">
        © Jet Meal
      </div>
    </>
  );
}
