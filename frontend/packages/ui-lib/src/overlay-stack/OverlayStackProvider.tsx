"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  buildListHrefWithoutOverlay,
  buildPopOverlayHref,
  buildPushOverlayHref,
  buildSingleOverlayHref,
  parseOverlayFramesFromSearchParams,
  type OverlayFrame,
} from "./overlayStackUrl";

export type OverlayStackContextValue = {
  frames: OverlayFrame[];
  depth: number;
  listHref: string;
  /** Убрать верхний кадр (мягкая навигация). */
  popHref: string;
  pushFrame: (frame: OverlayFrame) => void;
  openSingle: (frame: OverlayFrame) => void;
};

const OverlayStackContext = createContext<OverlayStackContextValue | null>(
  null,
);

/**
 * Провайдер стека полноэкранных «карточек» поверх списка (`ov=` в query).
 * Оборачивает приложение Next.js (App Router) и даёт единую навигацию «назад».
 */
export function OverlayStackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const router = useRouter();

  const frames = useMemo(
    () => parseOverlayFramesFromSearchParams(sp),
    [sp],
  );

  const listHref = useMemo(
    () => buildListHrefWithoutOverlay(pathname, sp),
    [pathname, sp],
  );

  const popHref = useMemo(
    () => buildPopOverlayHref(pathname, sp),
    [pathname, sp],
  );

  const pushFrame = useCallback(
    (frame: OverlayFrame) => {
      router.push(buildPushOverlayHref(pathname, sp, frame));
    },
    [pathname, router, sp],
  );

  const openSingle = useCallback(
    (frame: OverlayFrame) => {
      router.push(buildSingleOverlayHref(pathname, sp, frame));
    },
    [pathname, router, sp],
  );

  const value = useMemo(
    (): OverlayStackContextValue => ({
      frames,
      depth: frames.length,
      listHref,
      popHref,
      pushFrame,
      openSingle,
    }),
    [frames, listHref, openSingle, popHref, pushFrame],
  );

  return (
    <OverlayStackContext.Provider value={value}>
      {children}
    </OverlayStackContext.Provider>
  );
}

export function useOverlayStack() {
  const ctx = useContext(OverlayStackContext);
  if (!ctx) {
    throw new Error("useOverlayStack must be used within OverlayStackProvider");
  }
  return ctx;
}
