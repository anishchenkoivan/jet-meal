"use client";

import type { ReactNode } from "react";
import { CatalogFilterSection } from "./CatalogFilterSection";

export type FilterSectionProps = {
  id: string;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Обёртка секции: заголовок + произвольное содержимое (кнопки, поля и т.д.). */
export function FilterSection({
  id,
  title,
  children,
  className,
}: FilterSectionProps) {
  return (
    <CatalogFilterSection id={id} title={title} className={className}>
      {children}
    </CatalogFilterSection>
  );
}
