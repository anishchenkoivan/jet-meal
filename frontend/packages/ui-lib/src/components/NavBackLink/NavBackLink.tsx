"use client";

import cx from "classnames";
import type { ComponentType, MouseEvent, ReactNode } from "react";

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

const variantCls = {
  overlayPill:
    "fixed z-[1150] [top:calc(var(--sheet-overlay-top,64px)+10px)] left-4 right-auto max-w-[min(280px,calc(100vw-32px))] box-border px-3 py-2 text-sm leading-[1.35] [color:rgba(0,0,0,0.88)] text-left no-underline bg-white border [border-color:rgba(0,0,0,0.08)] rounded-lg shadow-[0_1px_4px_rgb(0_0_0/12%)] hover:[color:var(--ant-color-primary,#1677ff)] max-md:left-3 max-md:[max-width:calc(100vw-24px)] [--sheet-overlay-top:64px]",
  inline:
    "text-sm no-underline text-inherit hover:[color:var(--ant-color-primary,#1677ff)]",
  inlineCenter:
    "block text-sm text-center no-underline [color:var(--ant-color-primary,#1677ff)] hover:opacity-85",
};

export function NavBackLink({
  href,
  children,
  variant,
  LinkComponent,
  className,
  onClick,
}: NavBackLinkProps) {
  const cls = cx(variantCls[variant], className);

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
