"use client";

import { Drawer } from "antd";
import cx from "classnames";
import type { ReactNode } from "react";
import { CloseIcon } from "../Icons/Icons";
import styles from "./MobileDrawer.module.css";

/**
 * Z-index ниже липкой шапки SiteAppHeader (950), чтобы хедер оставался поверх маски.
 */
export const MOBILE_DRAWER_BELOW_HEADER_Z_INDEX = 900;

export type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Смещение маски и панели от верха вьюпорта (высота шапки), px */
  topOffsetPx?: number;
  zIndex?: number;
  title?: ReactNode;
  /** Строка заголовка с кнопкой закрытия (например корзина) */
  closable?: boolean;
  /** Передаётся в antd Drawer: не переносить фокус в панель при открытии */
  autoFocus?: boolean;
  rootClassName?: string;
  bodyClassName?: string;
  destroyOnClose?: boolean;
};

export function MobileDrawer({
  open,
  onClose,
  children,
  topOffsetPx = 64,
  zIndex = MOBILE_DRAWER_BELOW_HEADER_Z_INDEX,
  title,
  closable = false,
  autoFocus,
  rootClassName,
  bodyClassName,
  destroyOnClose,
}: MobileDrawerProps) {
  const top = topOffsetPx;
  const drawerHeight = `calc(100vh - ${top}px)`;
  const showTitleRow = Boolean(title) || closable;

  return (
    <Drawer
      placement="bottom"
      closable={false}
      title={null}
      autoFocus={autoFocus}
      onClose={onClose}
      open={open}
      size={drawerHeight}
      zIndex={zIndex}
      destroyOnClose={destroyOnClose}
      rootClassName={cx(
        styles["drawerInstant"],
        styles["drawerBottomFullWidth"],
        rootClassName,
      )}
      styles={{
        body: {
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        },
        header: { display: "none" },
        mask: { top },
        wrapper: {
          top,
          width: "100%",
          maxWidth: "100vw",
          left: 0,
          right: 0,
        },
        section: {
          borderRadius: "16px 16px 0 0",
        },
      }}
    >
      <div className={styles["sheet"]}>
        {showTitleRow ? (
          <div className={styles["sheetHeader"]}>
            <div className={styles["sheetTitle"]}>
              {typeof title === "string" ? (
                <h2 className={styles["titleHeading"]}>{title}</h2>
              ) : (
                title
              )}
            </div>
            {closable ? (
              <button
                type="button"
                className={styles["sheetClose"]}
                onClick={onClose}
                aria-label="Закрыть"
              >
                <CloseIcon />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={cx(styles["sheetBody"], bodyClassName)}>{children}</div>
      </div>
    </Drawer>
  );
}
