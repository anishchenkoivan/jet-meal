"use client";

import { Layout } from "antd";
import type { ReactNode } from "react";
import {
  Header,
  type HeaderTab,
  type LinkRenderProps,
} from "../Header/Header";
import { Logo } from "../Logo/Logo";
import styles from "./SiteAppHeader.module.css";

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
  /** Без значения подсветка вкладок не совпадает с URL (норм для SSR без pathname). */
  selectedKey?: string;
  /** По умолчанию обычный `<a href>` (жёсткая навигация между сервисами). */
  LinkComponent?: React.ComponentType<LinkRenderProps>;
  logoHref?: string;
  className?: string;
  navAfter?: ReactNode;
};

export function SiteAppHeader({
  tabs,
  selectedKey,
  LinkComponent = DefaultSiteLink,
  logoHref = "/",
  className,
  navAfter,
}: SiteAppHeaderProps) {
  return (
    <>
      <AntHeader className={className ?? styles["header"]}>
        <LinkComponent href={logoHref} className={styles["logoLink"]}>
          <Logo />
        </LinkComponent>
        <div className={styles["nav"]}>
          <Header
            tabs={tabs}
            selectedKey={selectedKey}
            LinkComponent={LinkComponent}
          />
        </div>
        {navAfter}
      </AntHeader>
      <div className={styles["headerSpacer"]} aria-hidden />
    </>
  );
}
