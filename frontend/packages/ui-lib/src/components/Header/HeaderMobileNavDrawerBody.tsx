"use client";

import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useMemo } from "react";
import type { HeaderTab, LinkRenderProps } from "./HeaderTypes";

function DefaultLink({ href, className, children, onClick }: LinkRenderProps) {
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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch] pb-[env(safe-area-inset-bottom,0px)]">
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={selectedKey ? [selectedKey] : []}
          onClick={onNavigate}
          className="border-none text-[18px] leading-[1.45]"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
