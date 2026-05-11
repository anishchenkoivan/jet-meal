"use client";

import cx from "classnames";
import { AppDropdown } from "../AppDropdown/AppDropdown";
import { useCallback } from "react";
import { useDrawer } from "../DrawerProvider/DrawerProvider";
import { CloseIcon, MenuIcon } from "../Icons/Icons";
import { HeaderMobileNavDrawerBody } from "./HeaderMobileNavDrawerBody";

export type {
  HeaderSubmenuItem,
  HeaderTab,
  LinkRenderProps,
} from "./HeaderTypes";

export const HEADER_DESKTOP_MIN_PX = 768;

const HEADER_NAV_DRAWER_ID = "header-nav";

function DefaultLink({
  href,
  className,
  children,
  onClick,
}: import("./HeaderTypes").LinkRenderProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export type HeaderProps = {
  tabs: import("./HeaderTypes").HeaderTab[];
  selectedKey?: string;
  LinkComponent?: React.ComponentType<import("./HeaderTypes").LinkRenderProps>;
};

export function Header({
  tabs,
  selectedKey,
  LinkComponent = DefaultLink,
}: HeaderProps) {
  const { open, close, isOpen } = useDrawer();

  const navOpen = isOpen(HEADER_NAV_DRAWER_ID);

  const closeNav = useCallback(() => {
    close();
  }, [close]);

  const toggleNav = useCallback(() => {
    if (navOpen) {
      close();
    } else {
      open(
        HEADER_NAV_DRAWER_ID,
        <HeaderMobileNavDrawerBody
          tabs={tabs}
          selectedKey={selectedKey}
          LinkComponent={LinkComponent}
          onNavigate={closeNav}
        />,
        { replace: true },
      );
    }
  }, [navOpen, open, close, closeNav, tabs, selectedKey, LinkComponent]);

  return (
    <>
      <nav
        className="hidden wide:flex flex-1 flex-wrap items-center justify-start gap-y-0 min-w-0"
        aria-label="Основное меню"
      >
        {tabs.map((tab) => {
          const active =
            selectedKey === tab.key ||
            tab.submenu?.some((s) => selectedKey === s.key);
          if (tab.submenu?.length) {
            return (
              <span key={tab.key} className="inline-flex items-center shrink-0">
                {tab.dividerBefore ? (
                  <span
                    className="self-center shrink-0 w-px h-[22px] mr-[10px] ml-[6px] rounded-[1px] [background:var(--ant-color-border,#d9d9d9)]"
                    aria-hidden
                  />
                ) : null}
                <AppDropdown
                  trigger={["hover", "click"]}
                  placement="bottomLeft"
                  menu={{
                    className:
                      "min-w-[200px] !p-[6px] !rounded-xl border border-[var(--ant-color-border-secondary,#f0f0f0)] shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
                    items: tab.submenu.map((item) => ({
                      key: item.key,
                      label: (
                        <LinkComponent
                          href={item.href}
                          className="block px-3 py-[10px] text-sm leading-[1.45] [color:var(--ant-color-text,rgba(0,0,0,0.88))] no-underline rounded-lg transition-colors duration-200 hover:[color:var(--ant-color-primary,#1677ff)]"
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
                      "inline-flex items-center px-[14px] py-[10px] -mb-px border-b-2 border-transparent text-sm leading-[1.5] [color:var(--ant-color-text,rgba(0,0,0,0.88))] no-underline transition-colors duration-200 hover:[color:var(--ant-color-primary,#1677ff)] cursor-pointer border-0 bg-transparent font-[inherit]",
                      active && "font-medium [border-bottom-color:var(--ant-color-primary,#1677ff)]",
                    )}
                  >
                    {tab.label}
                  </span>
                </AppDropdown>
              </span>
            );
          }
          return (
            <span key={tab.key} className="inline-flex items-center shrink-0">
              {tab.dividerBefore ? (
                <span
                  className="self-center shrink-0 w-px h-[22px] mr-[10px] ml-[6px] rounded-[1px] [background:var(--ant-color-border,#d9d9d9)]"
                  aria-hidden
                />
              ) : null}
              <LinkComponent
                href={tab.href}
                className={cx(
                  "inline-flex items-center px-[14px] py-[10px] -mb-px border-b-2 border-transparent text-sm leading-[1.5] [color:var(--ant-color-text,rgba(0,0,0,0.88))] no-underline transition-colors duration-200 hover:[color:var(--ant-color-primary,#1677ff)]",
                  selectedKey === tab.key && "font-medium [border-bottom-color:var(--ant-color-primary,#1677ff)]",
                )}
              >
                {tab.label}
              </LinkComponent>
            </span>
          );
        })}
      </nav>

      <div className="flex wide:hidden shrink-0 items-center">
        <button
          type="button"
          className="box-border inline-flex shrink-0 items-center justify-center w-10 h-10 p-0 m-0 border-0 [border-radius:var(--ant-border-radius-sm,6px)] bg-transparent [color:var(--ant-color-text,rgba(0,0,0,0.88))] text-[18px] leading-none cursor-pointer [-webkit-tap-highlight-color:transparent] hover:[background:var(--ant-color-fill-secondary,rgba(0,0,0,0.06))] focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2"
          aria-label={navOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={navOpen}
          onClick={toggleNav}
        >
          {navOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </>
  );
}
