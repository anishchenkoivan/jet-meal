"use client";

import cx from "classnames";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Base = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

type ButtonBranch = Base &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

export type AdaptiveButtonProps =
  | (Base & {
      href: string;
    } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className">)
  | ButtonBranch;

const rootBase =
  "box-border inline-flex items-center justify-center gap-2 w-full min-h-[40px] px-4 py-2 border border-transparent [border-radius:var(--ant-border-radius-lg,8px)] font-[inherit] text-sm font-medium leading-[1.35] text-center no-underline cursor-pointer [transition:background-color_0.15s_ease,border-color_0.15s_ease,color_0.15s_ease,opacity_0.15s_ease] focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto sm:min-w-40";

const variantCls = {
  primary:
    "[border-color:var(--ant-color-primary,#1677ff)] [background-color:var(--ant-color-primary,#1677ff)] [color:var(--ant-color-text-light-solid,#fff)] hover:not-disabled:[background-color:var(--ant-color-primary-hover,#4096ff)] hover:not-disabled:[border-color:var(--ant-color-primary-hover,#4096ff)]",
  secondary:
    "[border-color:var(--ant-color-border,#d9d9d9)] [background-color:var(--ant-color-bg-container,#fff)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] hover:not-disabled:[border-color:var(--ant-color-primary,#1677ff)] hover:not-disabled:[color:var(--ant-color-primary,#1677ff)]",
};

export function AdaptiveButton(props: AdaptiveButtonProps) {
  const { children, variant = "secondary", className } = props;
  const cls = cx(rootBase, variantCls[variant], className);

  if ("href" in props && props.href) {
    const { href, variant: _v, children: _c, className: _cl, ...rest } = props;
    return (
      <a className={cls} href={href} {...rest}>
        {children}
      </a>
    );
  }

  const {
    variant: _v2,
    children: _c2,
    className: _cl2,
    type: _ignoredType,
    ...rest
  } = props as ButtonBranch;
  return (
    <button className={cls} {...rest} type="button">
      {children}
    </button>
  );
}
