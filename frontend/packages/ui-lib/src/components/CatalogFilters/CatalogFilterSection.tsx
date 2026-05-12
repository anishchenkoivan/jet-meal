"use client";

import cx from "classnames";
import type { ReactNode } from "react";

export type CatalogFilterSectionProps = {
  id: string;
  title?: ReactNode;
  children: ReactNode;
  /** Индекс для замера верха секции (оверлей-иконки в панели фильтров каталога). */
  sectionIndex?: number;
  className?: string;
};

/** Тело секции фильтров; при `sectionIndex` вешается data-атрибут для якоря. */
export function CatalogFilterSection({
  id,
  title,
  children,
  sectionIndex,
  className,
}: CatalogFilterSectionProps) {
  return (
    <section
      id={id}
      data-filter-section-index={
        sectionIndex === undefined ? undefined : sectionIndex
      }
      className={cx("min-w-0 scroll-mt-2", className)}
      aria-labelledby={title ? `${id}-heading` : undefined}
    >
      <div className="flex flex-col gap-[0.45rem]">
        {title ? (
          <span
            id={`${id}-heading`}
            className="font-semibold text-[0.9rem] [color:var(--jm-color-text,rgba(0,0,0,0.88))]"
          >
            {title}
          </span>
        ) : null}
        {children}
      </div>
    </section>
  );
}
