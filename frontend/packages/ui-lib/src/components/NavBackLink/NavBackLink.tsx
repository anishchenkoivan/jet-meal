"use client";

import cx from "classnames";
import type { ComponentType, MouseEvent, ReactNode } from "react";
import styles from "./NavBackLink.module.css";

export type NavBackLinkRenderProps = {
  href: string;
  className?: string;
  children?: ReactNode;
  scroll?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
};

export type NavBackLinkProps = {
  href: string;
  children: ReactNode;
  /** Плавающая плашка на оверлее или обычная ссылка в потоке страницы */
  variant: "overlayPill" | "inline" | "inlineCenter";
  /** Например `next/link` для клиентской навигации */
  LinkComponent?: ComponentType<NavBackLinkRenderProps>;
  className?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
};

export function NavBackLink({
  href,
  children,
  variant,
  LinkComponent,
  className,
  onClick,
}: NavBackLinkProps) {
  const cls = cx(
    variant === "overlayPill" && styles["overlayPill"],
    variant === "inline" && styles["inline"],
    variant === "inlineCenter" && styles["inlineCenter"],
    className,
  );

  if (LinkComponent) {
    return (
      <LinkComponent
        href={href}
        className={cls}
        scroll={false}
        onClick={onClick}
      >
        {children}
      </LinkComponent>
    );
  }

  return (
    <a href={href} className={cls} onClick={onClick}>
      {children}
    </a>
  );
}
