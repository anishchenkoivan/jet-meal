"use client";

import { createContext, useContext, type ReactNode } from "react";

const CatalogFiltersMobileDrawerContext = createContext(false);

/** Оборачивает тело мобильного дроуера фильтров: скрывает нижние «Готово»/«Сбросить» внутри `CatalogFilters` (они в футере `NavListBlock`). */
export function CatalogFiltersMobileDrawerScope({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CatalogFiltersMobileDrawerContext.Provider value={true}>
      {children}
    </CatalogFiltersMobileDrawerContext.Provider>
  );
}

export function useCatalogFiltersInMobileDrawer(): boolean {
  return useContext(CatalogFiltersMobileDrawerContext);
}
