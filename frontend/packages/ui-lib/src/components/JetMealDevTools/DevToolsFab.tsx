"use client";

import type { ReactNode } from "react";
import { useDrawer } from "../DrawerProvider/DrawerProvider";

const DEFAULT_DRAWER_ID = "jet-meal-dev-tools";

export type DevToolsFabProps = {
  /** Обычно `process.env.NODE_ENV === "development"` */
  enabled: boolean;
  drawerTitle?: string;
  drawerId?: string;
  /** Контент дровера; `close` — закрыть верхний слой */
  renderPanel: (api: { close: () => void }) => ReactNode;
};

/**
 * Плавающая кнопка dev-инструментов: открывает дровер с переданным контентом.
 * Должна рендериться внутри `DrawerProvider` (например внутри `AppLayout`).
 */
export function DevToolsFab({
  enabled,
  drawerTitle = "DEV",
  drawerId = DEFAULT_DRAWER_ID,
  renderPanel,
}: DevToolsFabProps) {
  const { open, close } = useDrawer();

  if (!enabled) {
    return null;
  }

  return (
    <button
      type="button"
      className="pointer-events-auto fixed bottom-5 right-5 z-[6000] flex h-14 w-14 items-center justify-center rounded-full border-none text-2xl shadow-lg [background:var(--ant-color-warning,#faad14)] [color:#000000d9] [box-shadow:0_6px_20px_rgba(0,0,0,0.18)] transition-transform hover:scale-105"
      aria-label="Dev: инструменты"
      title="Dev"
      onClick={() =>
        open(
          drawerId,
          () => renderPanel({ close }),
          { replace: true, title: drawerTitle },
        )
      }
    >
      🐛
    </button>
  );
}
