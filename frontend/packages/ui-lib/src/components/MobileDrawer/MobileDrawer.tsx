"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDrawerZonePortal } from "../DrawerProvider/DrawerProvider";
import { CloseIcon } from "../Icons/Icons";

export type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  closable?: boolean;
  bodyClassName?: string;
};

export function MobileDrawer({
  open,
  onClose,
  children,
  title,
  closable = false,
  bodyClassName,
}: MobileDrawerProps) {
  const portalEl = useDrawerZonePortal();
  const showTitleRow = Boolean(title) || closable;

  if (!open) return null;

  const content = (
    <div className="absolute inset-0 z-[900] flex flex-col [background:var(--ant-color-bg-container,#fff)]">
      {showTitleRow ? (
        <div className="flex flex-shrink-0 items-center gap-3 px-4 py-[14px] border-b [border-color:var(--ant-color-border-secondary,#f0f0f0)]">
          <div className="flex-[1_1_auto] min-w-0 text-base font-semibold leading-[1.35] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            {typeof title === "string" ? (
              <h2 className="m-0 font-[inherit] text-inherit">{title}</h2>
            ) : (
              title
            )}
          </div>
          {closable ? (
            <button
              type="button"
              className="box-border inline-flex flex-shrink-0 items-center justify-center w-10 h-10 p-0 m-0 -mr-2 border-none [border-radius:var(--ant-border-radius-sm,6px)] bg-transparent [color:var(--ant-color-text,rgba(0,0,0,0.88))] text-[18px] leading-none cursor-pointer [-webkit-tap-highlight-color:transparent] hover:[background:var(--ant-color-fill-secondary,rgba(0,0,0,0.06))] focus-visible:outline-2 focus-visible:[outline-color:var(--ant-color-primary,#1677ff)] focus-visible:outline-offset-2"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        className={cx("flex-[1_1_auto] min-h-0 overflow-auto", bodyClassName)}
      >
        {children}
      </div>
    </div>
  );

  return portalEl ? createPortal(content, portalEl) : content;
}
