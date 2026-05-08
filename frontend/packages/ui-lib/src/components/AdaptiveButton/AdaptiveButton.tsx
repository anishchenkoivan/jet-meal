"use client";

import cx from "classnames";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import styles from "./AdaptiveButton.module.css";

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

export function AdaptiveButton(props: AdaptiveButtonProps) {
  const { children, variant = "secondary", className } = props;
  const cls = cx(styles["root"], styles[variant], className);

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
