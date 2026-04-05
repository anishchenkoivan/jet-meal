"use client";

import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Grid, Menu } from "antd";
import { useState } from "react";

export type HeaderTab = {
  key: string;
  label: string;
  href: string;
};

export type LinkRenderProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

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
};

export function Header({
  tabs,
  selectedKey,
  LinkComponent = DefaultLink,
}: HeaderProps) {
  const screens = Grid.useBreakpoint();
  const [open, setOpen] = useState(false);
  const desktop = Boolean(screens.md);

  const menuItems = tabs.map((tab) => ({
    key: tab.key,
    label: (
      <LinkComponent href={tab.href} onClick={() => setOpen(false)}>
        {tab.label}
      </LinkComponent>
    ),
  }));

  if (desktop) {
    return (
      <Menu
        mode="horizontal"
        items={menuItems}
        selectedKeys={selectedKey ? [selectedKey] : []}
        style={{ borderBottom: "none", flex: 1, minWidth: 0 }}
      />
    );
  }

  return (
    <>
      <Button
        type="text"
        icon={<MenuOutlined />}
        aria-label="Меню"
        onClick={() => setOpen(true)}
      />
      <Drawer
        title="Меню"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        size="default"
      >
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={selectedKey ? [selectedKey] : []}
          onClick={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
