"use client";

import { Layout } from "antd";
import cx from "classnames";
import type { ReactNode } from "react";
import { Header, type HeaderTab, type LinkRenderProps } from "../Header/Header";
import { Logo } from "../Logo/Logo";

const { Header: AntHeader } = Layout;

function DefaultSiteLink({
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

export type SiteAppHeaderProps = {
  tabs: HeaderTab[];
  selectedKey?: string;
  LinkComponent?: React.ComponentType<LinkRenderProps>;
  logoHref?: string;
  className?: string;
  /** Mobile search + filter controls portaled from NavListBlock. */
  bandSlot?: ReactNode;
  navAfter?: ReactNode;
};

export function SiteAppHeader({
  tabs,
  selectedKey,
  LinkComponent = DefaultSiteLink,
  logoHref = "/",
  className,
  bandSlot,
  navAfter,
}: SiteAppHeaderProps) {
  return (
    <AntHeader
      style={{
        background: "var(--ant-color-bg-container, #fff)",
        padding: 0,
      }}
      className={cx(
        "flex-shrink-0 box-border flex flex-col items-stretch leading-none border-b [border-color:var(--ant-color-border-secondary,#f0f0f0)]",
        className,
      )}
    >
      <div
        className="shrink-0 w-full"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
        aria-hidden
      />
      <div className="flex box-border min-h-[var(--site-app-header-height,64px)] h-[var(--site-app-header-height,64px)] w-full items-center gap-3 flex-nowrap px-5">
        <LinkComponent
          href={logoHref}
          className="no-underline flex-shrink-0 [color:var(--ant-color-text,rgba(0,0,0,0.88))] hover:[color:var(--ant-color-text,rgba(0,0,0,0.88))]"
        >
          <Logo />
        </LinkComponent>

        {/* Nav tabs (desktop) / hamburger (mobile) */}
        <div className="flex items-center min-w-0 wide:flex-1">
          <Header
            tabs={tabs}
            selectedKey={selectedKey}
            LinkComponent={LinkComponent}
          />
        </div>

        {/* Spacer: pushes bandSlot to far right on mobile (on desktop the nav div is flex-1) */}
        <div className="flex-1 wide:hidden" aria-hidden />

        {/* Filter controls injected by NavListBlock via LayoutBandSlot portal */}
        {bandSlot ?? null}

        {navAfter}
      </div>
    </AntHeader>
  );
}
