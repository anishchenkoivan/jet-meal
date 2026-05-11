"use client";

import cx from "classnames";
import type { ReactNode } from "react";

export type PageContentShellProps = {
  children: ReactNode;
  className?: string;
};

/** Единая ширина и поля контентной колонки (каталог, ресторан, чекаут и т.д.). */
export function PageContentShell({
  children,
  className,
}: PageContentShellProps) {
  return (
    <div
      className={cx(
        "box-border mx-auto flex w-full max-w-[min(992px,100%)] min-h-0 flex-1 flex-col [padding-inline:clamp(12px,3vw,24px)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
