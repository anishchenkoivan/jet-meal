"use client";

import { Button, ConfigProvider, Input } from "antd";
import cx from "classnames";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSetLayoutBandFn } from "../../containers/PageLayout/LayoutBandContext";
import { PageTwoColumnSticky } from "../../containers/PageTwoColumnSticky/PageTwoColumnSticky";
import { MobileFiltersDrawerProvider } from "../CatalogFilters/CatalogFiltersLayoutContext";
import { useDrawer } from "../DrawerProvider/DrawerProvider";
import { StickyAsidePanel } from "../StickyAsidePanel/StickyAsidePanel";

export const NAV_LIST_LAYOUT_DESKTOP_MIN_PX = 1292;
export const NAV_LIST_MOBILE_FILTER_BAR_HEIGHT_PX = 48;

export type NavListMobileSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/** Управление мобильным drawer с телом `asideBody` (как «Фильтры» в каталоге). */
export type NavListMobileAsideControls = {
  toggleAsideDrawer: () => void;
  asideDrawerOpen: boolean;
  asideRegionDomId: string;
};

export type NavListBlockProps = {
  asideTitle?: ReactNode;
  /** `aria-label` боковой панели, если заголовок не строка или нужен текст без видимого `asideTitle`. */
  asideAriaLabel?: string;
  /** Доп. классы для `StickyAsidePanel` (десктопный слот). */
  asideClassName?: string;
  asideBody?: ReactNode;
  asideFooter?: ReactNode;
  mobileSearchField?: NavListMobileSearchProps;
  /** Кастомная полоса в шапке на мобильной ширине; можно передать функцию с API drawer. */
  mobileTopBar?:
    | ReactNode
    | ((controls: NavListMobileAsideControls) => ReactNode);
  hideNavListChrome?: boolean;
  navListLoading?: boolean;
  onMobileApply?: () => void;
  onMobileResetNav?: () => void;
  children: ReactNode;
};

const FILTERS_DRAWER_ID = "nav-list-filters";
const SEARCH_DEBOUNCE_MS = 2000;

const FILTERS_DRAWER_BODY_SCROLL =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export function NavListBlock({
  asideTitle,
  asideAriaLabel: asideAriaLabelProp,
  asideClassName,
  asideBody,
  asideFooter,
  mobileSearchField,
  mobileTopBar,
  hideNavListChrome,
  navListLoading,
  onMobileApply,
  onMobileResetNav,
  children,
}: NavListBlockProps) {
  const hideChrome = hideNavListChrome ?? false;
  const loading = navListLoading ?? false;
  const hasLeftAside =
    asideTitle != null || asideBody != null || asideFooter != null;

  const navRegionId = useId();
  const { open, close, isOpen } = useDrawer();
  const setLayoutBandFn = useSetLayoutBandFn();

  // Debounced search state
  const [inputValue, setInputValue] = useState(mobileSearchField?.value ?? "");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. on reset)
  useEffect(() => {
    setInputValue(mobileSearchField?.value ?? "");
  }, [mobileSearchField?.value]);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    },
    [],
  );

  const handleSearchInput = useCallback(
    (value: string) => {
      setInputValue(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        mobileSearchField?.onChange(value);
        onMobileApply?.();
      }, SEARCH_DEBOUNCE_MS);
    },
    [mobileSearchField, onMobileApply],
  );

  const mobileOpen = isOpen(FILTERS_DRAWER_ID);

  // Close on resize to desktop
  useEffect(() => {
    if (hideChrome) return;
    const mq = window.matchMedia(
      `(min-width: ${NAV_LIST_LAYOUT_DESKTOP_MIN_PX}px)`,
    );
    const onChange = () => {
      if (mq.matches) close();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [hideChrome, close]);

  const filtersContent = useRef<ReactNode>(null);

  const buildFiltersContent = useCallback(
    () => (
      <MobileFiltersDrawerProvider
        closeDrawer={close}
        afterFilterReset={() => onMobileResetNav?.()}
      >
        <ConfigProvider
          popupOverflow="scroll"
          getPopupContainer={() =>
            typeof document === "undefined"
              ? (null as unknown as HTMLElement)
              : document.body
          }
        >
          <div
            className={cx(
              "box-border flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4",
              FILTERS_DRAWER_BODY_SCROLL,
            )}
            data-nav-list-aside-scroll=""
          >
            {asideBody}
          </div>
        </ConfigProvider>
      </MobileFiltersDrawerProvider>
    ),
    [asideBody, onMobileResetNav, close],
  );

  const toggleFilters = useCallback(() => {
    if (mobileOpen) {
      close();
    } else {
      const content = buildFiltersContent();
      filtersContent.current = content;
      open(FILTERS_DRAWER_ID, content, {
        replace: true,
      });
    }
  }, [mobileOpen, open, close, buildFiltersContent]);

  // Keep drawer content fresh when asideBody changes while open
  useEffect(() => {
    if (!mobileOpen) return;
    const content = buildFiltersContent();
    filtersContent.current = content;
    open(FILTERS_DRAWER_ID, content, {
      replace: true,
    });
  }, [mobileOpen, asideBody, open, buildFiltersContent]);

  // Build render function for the header band slot (null when chrome is hidden).
  // useCallback keeps the reference stable so useLayoutEffect only re-fires on real changes.
  const renderHeaderControls = useCallback((): ReactNode => {
    if (hideChrome || !hasLeftAside) return null;
    const asideControls: NavListMobileAsideControls = {
      toggleAsideDrawer: toggleFilters,
      asideDrawerOpen: mobileOpen,
      asideRegionDomId: navRegionId,
    };
    const topBarNode =
      typeof mobileTopBar === "function"
        ? mobileTopBar(asideControls)
        : mobileTopBar;
    return (
      <div className="hidden max-wide:flex flex-1 items-center gap-2 min-w-0">
        {topBarNode ??
          (loading ? (
            <>
              <div
                className="flex-1 min-w-0 h-8 rounded-[6px] bg-black/[0.06]"
                aria-hidden
              />
              <div
                className="flex-shrink-0 w-24 h-8 rounded-[6px] bg-black/[0.06]"
                aria-hidden
              />
            </>
          ) : (
            <>
              <Input
                placeholder={mobileSearchField?.placeholder ?? "Поиск"}
                value={inputValue}
                onChange={(e) => handleSearchInput(e.target.value)}
                onClear={() => handleSearchInput("")}
                className="flex-1 min-w-0"
                allowClear
                aria-label="Поиск"
              />
              <Button
                type="default"
                className="flex-shrink-0 px-3"
                aria-expanded={mobileOpen}
                aria-controls={navRegionId}
                aria-label={mobileOpen ? "Закрыть фильтры" : "Открыть фильтры"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleFilters}
              >
                Фильтры
              </Button>
            </>
          ))}
      </div>
    );
  }, [
    hideChrome,
    hasLeftAside,
    mobileTopBar,
    loading,
    mobileSearchField,
    inputValue,
    handleSearchInput,
    mobileOpen,
    navRegionId,
    toggleFilters,
  ]);

  // Inject into header's LayoutBandSlot synchronously before browser paint.
  useLayoutEffect(() => {
    setLayoutBandFn(renderHeaderControls);
    return () => setLayoutBandFn(null);
  }, [renderHeaderControls, setLayoutBandFn]);

  if (hideChrome || !hasLeftAside) {
    return <div className="relative z-0 min-w-0 w-full">{children}</div>;
  }

  const asideAriaLabel =
    asideAriaLabelProp ??
    (typeof asideTitle === "string" ? asideTitle : "Боковая панель");

  return (
    <PageTwoColumnSticky
      className="w-full min-h-0 flex-1 self-stretch"
      includeSideSlot
      sideSlotPosition="start"
      side={
        <StickyAsidePanel
          id={navRegionId}
          ariaLabel={asideAriaLabel}
          className={cx("gap-3", asideClassName)}
        >
          {asideTitle ? (
            <div className="m-0 shrink-0 p-0 text-base font-semibold leading-[1.35]">
              {asideTitle}
            </div>
          ) : null}
          <ConfigProvider
            popupOverflow="scroll"
            getPopupContainer={() =>
              typeof document === "undefined"
                ? (null as unknown as HTMLElement)
                : document.body
            }
          >
            <div
              className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col"
              data-nav-list-aside-scroll=""
            >
              {asideBody}
            </div>
          </ConfigProvider>
          {asideFooter ? (
            <div className="shrink-0 border-t pt-1 [border-color:var(--ant-color-border-secondary,#f0f0f0)]">
              {asideFooter}
            </div>
          ) : null}
        </StickyAsidePanel>
      }
      main={
        <div className="relative z-0 min-w-0 w-full overflow-x-hidden">
          {children}
        </div>
      }
    />
  );
}
