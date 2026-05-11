"use client";

import cx from "classnames";
import type { CSSProperties, ReactNode } from "react";
import { Fragment, useCallback, useMemo, useRef } from "react";

export const CATALOG_FILTER_RAIL_SCROLLBAR_HIDE =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const ICON_STACK_STEP_PX = 36;

const RAIL_ICON_CELL_CLASS = [
  "sticky self-start",
  "flex h-8 w-8 shrink-0 items-center justify-center",
  "rounded-lg border",
  "[border-color:var(--jm-color-border-secondary,#e8e8e8)]",
  "[background:var(--ant-color-bg-container,#fff)]",
  "[color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))]",
  // CSS-переменные задаются на wrapper .contents
  "[grid-column:1/2] [grid-row:var(--row-i)/var(--row-end)]",
  "[top:var(--icon-top)] [bottom:var(--icon-bot)] [z-index:var(--icon-z)]",
].join(" ");

function scrollSectionInRoot(
  root: HTMLElement | null,
  sectionId: string,
  offsetTopPx = 8,
) {
  if (!root || typeof document === "undefined") return;
  const el = document.getElementById(sectionId);
  if (!el) return;
  const rootRect = root.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const y = root.scrollTop + (elRect.top - rootRect.top) - offsetTopPx;
  root.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function scrollSectionInNearestViewport(sectionId: string) {
  if (typeof document === "undefined") return;
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export type CatalogFilterRailLayer = {
  rowKey: string;
  sectionId: string;
  icon: ReactNode | null;
  section: ReactNode;
};

export type CatalogFilterRailScrollMode = "scrollRoot" | "nearestViewport";

export type CatalogFilterRailScrollProps = {
  layers: CatalogFilterRailLayer[];
  railIconAriaLabel: (rowKey: string) => string;
  scrollMode: CatalogFilterRailScrollMode;
  className?: string;
  children?: ReactNode;
};

export function CatalogFilterRailScroll({
  layers,
  railIconAriaLabel,
  scrollMode,
  className,
  children,
}: CatalogFilterRailScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback(
    (sectionId: string) => {
      if (scrollMode === "nearestViewport") {
        scrollSectionInNearestViewport(sectionId);
      } else {
        scrollSectionInRoot(scrollRef.current, sectionId);
      }
    },
    [scrollMode],
  );

  const hasRail = layers.some((l) => l.icon != null);

  const body = useMemo(() => {
    if (!hasRail) {
      return (
        <>
          {layers.map((layer) => (
            <Fragment key={layer.rowKey}>{layer.section}</Fragment>
          ))}
        </>
      );
    }

    const total = layers.length;

    return (
      <div className="grid w-full min-w-0 grid-cols-[46px_minmax(0,1fr)] gap-x-3 gap-y-3">
        {layers.map((layer, i) => {
          // CSS custom properties — динамические значения для grid/sticky без прямых style-свойств
          const rowVars = {
            "--row-i": i + 1,
            "--row-end": total + 1,
            "--icon-top": `${i * ICON_STACK_STEP_PX}px`,
            "--icon-bot": `${(total - 1 - i) * ICON_STACK_STEP_PX}px`,
            "--icon-z": 20 + i,
          } as CSSProperties;

          return (
            <Fragment key={layer.rowKey}>
              {/*
                display:contents — элемент убирается из лэйаута, его дети становятся
                прямыми grid-items. CSS custom properties наследуются дочерним элементам.
              */}
              <div className="contents" style={rowVars}>
                {layer.icon != null ? (
                  <div
                    className={cx(
                      RAIL_ICON_CELL_CLASS,
                      "cursor-pointer outline-none focus-visible:ring-2",
                      "focus-visible:ring-[var(--jm-color-primary,#1677ff)] focus-visible:ring-offset-1",
                    )}
                    role="button"
                    tabIndex={0}
                    aria-label={`Показать: ${railIconAriaLabel(layer.rowKey)}`}
                    onClick={() => scrollTo(layer.sectionId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        scrollTo(layer.sectionId);
                      }
                    }}
                  >
                    {layer.icon}
                  </div>
                ) : (
                  <div
                    className="h-8 w-8 shrink-0 [grid-column:1/2] [grid-row:var(--row-i)/var(--row-end)]"
                    aria-hidden
                  />
                )}
                <div className="min-h-0 min-w-0 pr-1 [grid-column:2/3] [grid-row:var(--row-i)/calc(var(--row-i)+1)]">
                  {layer.section}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    );
  }, [hasRail, layers, railIconAriaLabel, scrollTo]);

  return (
    <div
      ref={scrollRef}
      className={cx(
        "box-border flex min-w-0 flex-col gap-3",
        CATALOG_FILTER_RAIL_SCROLLBAR_HIDE,
        className,
      )}
    >
      {body}
      {children}
    </div>
  );
}
