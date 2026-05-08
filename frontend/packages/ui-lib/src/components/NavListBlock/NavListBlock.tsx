"use client";

import { Button, ConfigProvider, Input } from "antd";
import cx from "classnames";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AppConfirmModal } from "../AppConfirmModal/AppConfirmModal";
import { CatalogFiltersMobileDrawerScope } from "../CatalogFilters/CatalogFiltersLayoutContext";
import { MobileDrawer } from "../MobileDrawer/MobileDrawer";
import styles from "./NavListBlock.module.css";

/** Брейкпункт «десктоп с боковой колонкой»: ≈ на 300px шире типичного lg */
export const NAV_LIST_LAYOUT_DESKTOP_MIN_PX = 1292;

/** Высота полоски поиска + кнопки под шапкой (padding + input) */
export const NAV_LIST_MOBILE_FILTER_BAR_HEIGHT_PX = 48;

export type NavListMobileSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export type NavListBlockProps = {
  pageHeaderHeightPx?: number;
  asideTitle?: ReactNode;
  /** Десктоп: левая колонка; мобилка: содержимое `MobileDrawer` под полоской */
  asideBody?: ReactNode;
  asideFooter?: ReactNode;
  /** Узкая полоска под хедером: поиск + кнопка панели (если не задан `mobileTopBar`) */
  mobileSearchField?: NavListMobileSearchProps;
  /**
   * Полностью заменяет мобильную полоску (поиск + «Меню»).
   * Нужен для экранов вроде «Заказы», где на мобилке — одна кнопка «История».
   */
  mobileTopBar?: ReactNode;
  /** Скрыть боковую колонку и мобильную полоску (оверлей карточки и т.п.) */
  hideNavListChrome?: boolean;
  /** Первая загрузка: скелет мобильной полоски */
  navListLoading?: boolean;
  onMobileApply?: () => void;
  onMobileResetNav?: () => void;
  children: ReactNode;
};

/**
 * Двухколоночный лэйаут: слева навигация/разделы, справа контент.
 * На узких экранах — полоска (выше дроуера) + `MobileDrawer` с фильтрами.
 */
export function NavListBlock({
  pageHeaderHeightPx = 64,
  asideTitle,
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
  const onReset = onMobileResetNav;

  const navRegionId = useId();
  const asideBodyRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  const handleApply = useCallback(() => {
    onMobileApply?.();
    closeMobile();
  }, [closeMobile, onMobileApply]);

  const handleReset = useCallback(() => {
    onReset?.();
    setResetOpen(false);
    closeMobile();
  }, [closeMobile, onReset]);

  useEffect(() => {
    if (hideChrome) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const mq = window.matchMedia(
      `(min-width: ${NAV_LIST_LAYOUT_DESKTOP_MIN_PX}px)`,
    );
    const onChange = () => {
      if (mq.matches) {
        setMobileOpen(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [hideChrome]);

  const hasLeftAside =
    asideTitle != null || asideBody != null || asideFooter != null;

  if (hideChrome) {
    return <div className={styles["main"]}>{children}</div>;
  }

  if (!hasLeftAside) {
    return <div className={styles["main"]}>{children}</div>;
  }

  const headerVar = {
    "--page-header-height": `${pageHeaderHeightPx}px`,
  } as CSSProperties;

  const drawerTop =
    pageHeaderHeightPx + NAV_LIST_MOBILE_FILTER_BAR_HEIGHT_PX;

  return (
    <div className={cx(styles["shell"], mobileOpen && styles["shellNavOpen"])}>
      <aside
        id={navRegionId}
        className={styles["aside"]}
        aria-label={
          typeof asideTitle === "string" ? asideTitle : "Боковая панель"
        }
      >
        {asideTitle ? (
          <div className={styles["asideTitle"]}>{asideTitle}</div>
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
            ref={asideBodyRef}
            className={styles["asideBody"]}
            data-nav-list-aside-scroll=""
          >
            {asideBody}
          </div>
        </ConfigProvider>
        {asideFooter ? (
          <div className={styles["desktopAsideFooter"]}>
            <div className={styles["asideFooter"]}>{asideFooter}</div>
          </div>
        ) : null}
      </aside>

      <div className={styles["mobileDock"]} style={headerVar}>
        <div className={styles["mobileDockInner"]}>
          {mobileTopBar ? (
            <div className={styles["mobileBar"]}>{mobileTopBar}</div>
          ) : (
            <div className={styles["mobileBar"]}>
              <div className={styles["mobileTriggerRow"]}>
                {loading ? (
                  <>
                    <div
                      className={cx(
                        styles["mobileSearchInput"],
                        styles["mobileDockSkSearch"],
                      )}
                      aria-hidden
                    />
                    <div
                      className={cx(
                        styles["mobileNavToggle"],
                        styles["mobileDockSkBtn"],
                      )}
                      aria-hidden
                    />
                  </>
                ) : (
                  <>
                    {mobileSearchField ? (
                      <Input
                        placeholder={mobileSearchField.placeholder ?? "Поиск"}
                        value={mobileSearchField.value}
                        onChange={(e) =>
                          mobileSearchField.onChange(e.target.value)
                        }
                        className={styles["mobileSearchInput"]}
                        allowClear
                      />
                    ) : (
                      <Input
                        placeholder="Поиск"
                        className={styles["mobileSearchInput"]}
                        allowClear
                      />
                    )}
                    <Button
                      type="default"
                      className={styles["mobileNavToggle"]}
                      aria-expanded={mobileOpen}
                      aria-controls={navRegionId}
                      aria-label={
                        mobileOpen ? "Закрыть панель" : "Открыть панель"
                      }
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={toggleMobile}
                    >
                      {mobileOpen ? "Закрыть" : "Меню"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileDrawer
        open={mobileOpen}
        onClose={closeMobile}
        topOffsetPx={drawerTop}
        zIndex={920}
        title={asideTitle ?? undefined}
        closable={false}
        destroyOnClose={false}
        bodyClassName={styles["filtersDrawerBody"]}
      >
        <div className={styles["mobileDrawerColumn"]}>
          <CatalogFiltersMobileDrawerScope>
            <ConfigProvider
              popupOverflow="scroll"
              getPopupContainer={() =>
                typeof document === "undefined"
                  ? (null as unknown as HTMLElement)
                  : document.body
              }
            >
              <div
                className={styles["mobileDrawerScroll"]}
                data-nav-list-aside-scroll=""
              >
                {asideBody}
              </div>
            </ConfigProvider>
          </CatalogFiltersMobileDrawerScope>
          <div className={styles["mobileDrawerActions"]}>
            <Button
              type="primary"
              size="large"
              block
              className={styles["mobileDrawerDone"]}
              onClick={handleApply}
            >
              Готово
            </Button>
            {onReset ? (
              <button
                type="button"
                className={styles["mobileDrawerReset"]}
                onClick={() => setResetOpen(true)}
              >
                Сбросить
              </button>
            ) : null}
          </div>
        </div>
      </MobileDrawer>

      <div className={styles["main"]}>{children}</div>

      <AppConfirmModal
        open={resetOpen && Boolean(onReset)}
        title="Сбросить фильтры?"
        okText="Сбросить"
        cancelText="Отмена"
        onOk={handleReset}
        onCancel={() => setResetOpen(false)}
      >
        Все выбранные фильтры будут сброшены.
      </AppConfirmModal>
    </div>
  );
}
