"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import styles from "./PageContentShell.module.css";

export type PageContentShellProps = {
  children: ReactNode;
  className?: string;
};

/** Единая ширина и поля контентной колонки (каталог, ресторан, чекаут и т.д.). */
export function PageContentShell({ children, className }: PageContentShellProps) {
  return <div className={cx(styles["shell"], className)}>{children}</div>;
}
