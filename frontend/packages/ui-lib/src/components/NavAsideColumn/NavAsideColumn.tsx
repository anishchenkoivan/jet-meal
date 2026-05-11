"use client";

import type { ReactNode } from "react";

export type NavAsideColumnProps = {
  children: ReactNode;
  footer?: ReactNode;
};

/** Колонка боковой панели (`NavListBlock`): тело + опциональный подвал. */
export function NavAsideColumn({ children, footer }: NavAsideColumnProps) {
  return (
    <div className="w-full">
      {children}
      {footer ? <div className="block mt-2">{footer}</div> : null}
    </div>
  );
}
