"use client";

import { createContext, type ReactNode, useContext } from "react";

export type MobileFiltersDrawerController = {
  closeDrawer: () => void;
  /** Синхронизация шапки/стейта снаружи после сброса (как бывший футер дроуера). */
  afterFilterReset: () => void;
};

const MobileFiltersDrawerControllerContext =
  createContext<MobileFiltersDrawerController | null>(null);

/** Оборачивает тело мобильного дроуера фильтров каталога: закрытие после «Готово» / сброса. */
export function MobileFiltersDrawerProvider({
  children,
  closeDrawer,
  afterFilterReset,
}: {
  children: ReactNode;
  closeDrawer: () => void;
  afterFilterReset: () => void;
}) {
  return (
    <MobileFiltersDrawerControllerContext.Provider
      value={{ closeDrawer, afterFilterReset }}
    >
      {children}
    </MobileFiltersDrawerControllerContext.Provider>
  );
}

export function useMobileFiltersDrawerController(): MobileFiltersDrawerController | null {
  return useContext(MobileFiltersDrawerControllerContext);
}
