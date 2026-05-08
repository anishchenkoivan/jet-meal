"use client";

import type { ReactNode } from "react";
import styles from "./NavAsideColumn.module.css";

export type NavAsideColumnProps = {
  children: ReactNode;
  footer?: ReactNode;
};

/** Колонка боковой панели (`NavListBlock`): тело + опциональный подвал. */
export function NavAsideColumn({ children, footer }: NavAsideColumnProps) {
  return (
    <div className={styles["root"]}>
      {children}
      {footer ? <div className={styles["footer"]}>{footer}</div> : null}
    </div>
  );
}
