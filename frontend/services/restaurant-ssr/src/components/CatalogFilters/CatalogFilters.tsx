"use client";

import cx from "classnames";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppConfirmModal } from "@jet-meal/ui-lib/src/components/AppConfirmModal/AppConfirmModal";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import {
  CatalogFilterRailScroll,
  CATALOG_FILTER_RAIL_SCROLLBAR_HIDE,
  type CatalogFilterRailLayer,
} from "@jet-meal/ui-lib/src/components/CatalogFilters/CatalogFilterRailScroll";
import { useMobileFiltersDrawerController } from "@jet-meal/ui-lib/src/components/CatalogFilters/CatalogFiltersLayoutContext";
import { FilterSection } from "@jet-meal/ui-lib/src/components/CatalogFilters/FilterSection";
import { InputSection } from "@jet-meal/ui-lib/src/components/CatalogFilters/InputSection";
import { SelectableChipGroup } from "@jet-meal/ui-lib/src/components/CatalogFilters/SelectableChipGroup";
import { SelectOptionRow } from "@jet-meal/ui-lib/src/components/CatalogFilters/SelectOptionRow";
import { TagsSection } from "@jet-meal/ui-lib/src/components/CatalogFilters/TagsSection";
import {
  ClockIcon,
  HashtagIcon,
  MapPinIcon,
  SearchIcon,
  StorefrontIcon,
} from "@jet-meal/ui-lib/src/components/Icons/Icons";
import { TimeInput } from "@jet-meal/ui-lib/src/components/TimeInput/TimeInput";

/** Стабильные id для якорей; не привязаны к конкретному сервису. */
const filterDom = {
  search: "filters-section-search",
  restaurant: "filters-section-restaurant",
  city: "filters-section-city",
  tags: "filters-section-tags",
  delivery: "filters-section-delivery",
} as const;

export type FilterOption = {
  value: string;
  label: string;
};

export type CatalogFiltersProps = {
  children?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  restaurantSearchValue?: string;
  onRestaurantSearchChange?: (value: string) => void;
  restaurantSearchPlaceholder?: string;
  restaurantSearchLabel?: string;
  cityLabel?: string;
  cityOptions?: FilterOption[];
  cityValue?: string;
  onCityChange?: (value: string) => void;
  /** Фильтры: полный справочник тегов (значения + подписи) */
  tagCatalogOptions?: FilterOption[];
  /** До 10 популярных value (порядок важен) */
  popularTagValues?: string[];
  selectedTagValues?: string[];
  onSelectedTagValuesChange?: (values: string[]) => void;
  tagSearchValue?: string;
  onTagSearchChange?: (value: string) => void;
  /** Подписи блока тегов (передаются снаружи, без хардкода в дочерних блоках). */
  tagsSearchPlaceholder?: string;
  tagsEmptyHint?: string;
  tagsNoResultsText?: string;
  filtersLabel?: string;
  deliveryTimeLabel?: string;
  deliveryTimeOptions?: FilterOption[];
  deliveryTimeValue?: string;
  onDeliveryTimeChange?: (value: string) => void;
  deliveryWishLabel?: string;
  deliveryWishPlaceholder?: string;
  deliveryWishValue?: string;
  onDeliveryWishChange?: (value: string) => void;
  onApplyFilters?: () => void;
  /** Сброс фильтров к значениям по умолчанию (после подтверждения) */
  onResetFilters?: () => void;
  applyDisabled?: boolean;
  applyButtonText?: string;
  showApplyButton?: boolean;
};

type PanelKind = "main" | "city";

function labelFor(
  options: FilterOption[] | undefined,
  value: string | undefined,
  emptyLabel: string,
): string {
  if (!options?.length) {
    return emptyLabel;
  }
  const v = value ?? "";
  return options.find((o) => o.value === v)?.label ?? emptyLabel;
}

export function CatalogFilters({
  children,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Поиск...",
  searchLabel = "Поиск",
  restaurantSearchValue = "",
  onRestaurantSearchChange,
  restaurantSearchPlaceholder = "Название ресторана",
  restaurantSearchLabel = "Ресторан",
  cityLabel = "Город проживания",
  cityOptions,
  cityValue = "",
  onCityChange,
  tagCatalogOptions,
  popularTagValues = [],
  selectedTagValues = [],
  onSelectedTagValuesChange,
  tagSearchValue = "",
  onTagSearchChange,
  tagsSearchPlaceholder = "Поиск по тегам",
  tagsEmptyHint = "Выберите теги ниже",
  tagsNoResultsText = "Ничего не найдено",
  filtersLabel = "Фильтры",
  deliveryTimeLabel = "Время доставки",
  deliveryTimeOptions,
  deliveryTimeValue = "",
  onDeliveryTimeChange,
  deliveryWishLabel = "Желаемое время",
  deliveryWishPlaceholder = "Например, 19:30",
  deliveryWishValue = "",
  onDeliveryWishChange,
  onApplyFilters,
  onResetFilters,
  applyDisabled = false,
  applyButtonText = "Готово",
  showApplyButton = true,
}: CatalogFiltersProps) {
  const mobileFiltersDrawer = useMobileFiltersDrawerController();
  /** Один вертикальный скролл на обёртке дроера — без вложенного overflow-y на панели фильтров. */
  const scrollFiltersInDrawer = Boolean(mobileFiltersDrawer);
  const [panel, setPanel] = useState<PanelKind>("main");
  const [listFilter, setListFilter] = useState("");
  const [tempCity, setTempCity] = useState(cityValue);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    if (panel === "city") {
      setTempCity(cityValue);
      setListFilter("");
    }
  }, [panel, cityValue]);

  const cityDrill = Boolean(cityOptions?.length && onCityChange);
  const tagsEnabled =
    Boolean(tagCatalogOptions?.length) && onSelectedTagValuesChange;
  const deliveryEnabled =
    Boolean(deliveryTimeOptions?.length) && onDeliveryTimeChange;

  const citySummary = useMemo(
    () => labelFor(cityOptions, cityValue, "Не выбрано"),
    [cityOptions, cityValue],
  );

  const filteredCityOptions = useMemo(() => {
    if (!cityOptions) {
      return [];
    }
    const q = listFilter.trim().toLowerCase();
    if (!q) {
      return cityOptions;
    }
    return cityOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [cityOptions, listFilter]);

  const closeCity = () => {
    setPanel("main");
    setListFilter("");
  };

  const confirmCity = () => {
    onCityChange?.(tempCity);
    closeCity();
  };

  const toggleTag = (value: string) => {
    if (!onSelectedTagValuesChange) {
      return;
    }
    if (selectedTagValues.includes(value)) {
      onSelectedTagValuesChange(selectedTagValues.filter((v) => v !== value));
    } else {
      onSelectedTagValuesChange([...selectedTagValues, value]);
    }
  };

  const popularOptions = useMemo(() => {
    if (!tagCatalogOptions?.length || !popularTagValues.length) {
      return [];
    }
    const byValue = new Map(tagCatalogOptions.map((o) => [o.value, o]));
    return popularTagValues
      .map((id) => byValue.get(id))
      .filter((o): o is FilterOption => Boolean(o))
      .filter((o) => !selectedTagValues.includes(o.value))
      .slice(0, 10);
  }, [tagCatalogOptions, popularTagValues, selectedTagValues]);

  const searchPool = useMemo(() => {
    if (!tagCatalogOptions?.length) {
      return [];
    }
    const q = tagSearchValue.trim().toLowerCase();
    return tagCatalogOptions.filter((o) => {
      if (selectedTagValues.includes(o.value)) {
        return false;
      }
      if (!q) {
        return false;
      }
      return (
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
      );
    });
  }, [tagCatalogOptions, tagSearchValue, selectedTagValues]);

  const showSearchHits = tagSearchValue.trim().length > 0;

  const filterLayers = useMemo(() => {
    const layers: CatalogFilterRailLayer[] = [];

    if (onSearchChange) {
      layers.push({
        rowKey: "filters-search",
        sectionId: filterDom.search,
        icon: <SearchIcon size={16} />,
        section: (
          <InputSection
            id={filterDom.search}
            title={searchLabel.trim() ? searchLabel : undefined}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
          />
        ),
      });
    }
    if (onRestaurantSearchChange) {
      layers.push({
        rowKey: "filters-restaurant",
        sectionId: filterDom.restaurant,
        icon: <StorefrontIcon size={16} />,
        section: (
          <InputSection
            id={filterDom.restaurant}
            title={
              restaurantSearchLabel.trim()
                ? restaurantSearchLabel
                : undefined
            }
            placeholder={restaurantSearchPlaceholder}
            value={restaurantSearchValue}
            onChange={onRestaurantSearchChange}
          />
        ),
      });
    }
    if (cityDrill) {
      layers.push({
        rowKey: "filters-city",
        sectionId: filterDom.city,
        icon: <MapPinIcon size={16} />,
        section: (
          <FilterSection id={filterDom.city} title={cityLabel}>
            <button
              type="button"
              className="flex w-full box-border min-h-[36px] px-[11px] py-[6px] text-left text-sm leading-[1.5] [color:var(--jm-color-text,rgba(0,0,0,0.88))] cursor-pointer [background:var(--jm-color-bg-container,#fff)] border [border-color:var(--jm-color-border-secondary,#d9d9d9)] rounded-lg [transition:border-color_0.15s_ease] hover:[border-color:var(--jm-color-primary-border-hover,#91caff)]"
              onClick={() => setPanel("city")}
            >
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {citySummary}
              </span>
            </button>
          </FilterSection>
        ),
      });
    }
    if (tagsEnabled && tagCatalogOptions?.length) {
      layers.push({
        rowKey: "filters-tags",
        sectionId: filterDom.tags,
        icon: <HashtagIcon size={16} />,
        section: (
          <TagsSection
            id={filterDom.tags}
            title={filtersLabel}
            searchPlaceholder={tagsSearchPlaceholder}
            emptySelectionHint={tagsEmptyHint}
            noSearchResultsText={tagsNoResultsText}
            searchValue={tagSearchValue}
            onSearchChange={onTagSearchChange}
            selectedValues={selectedTagValues}
            optionCatalog={tagCatalogOptions!}
            onToggle={toggleTag}
            showSearchHits={showSearchHits}
            popularOptions={popularOptions}
            searchHits={searchPool}
          />
        ),
      });
    }
    if (deliveryEnabled) {
      layers.push({
        rowKey: "filters-delivery",
        sectionId: filterDom.delivery,
        icon: <ClockIcon size={16} />,
        section: (
          <FilterSection id={filterDom.delivery} title={deliveryTimeLabel}>
            <SelectableChipGroup
              options={(deliveryTimeOptions ?? []).filter(
                (o) => o.value !== "custom",
              )}
              selected={deliveryTimeValue}
              onSelect={(v) => {
                onDeliveryTimeChange?.(v);
                if (v !== "custom") {
                  onDeliveryWishChange?.("");
                }
              }}
            />
            {onDeliveryWishChange ? (
              <div className="mt-2 flex flex-col gap-[6px]">
                <span className="text-xs font-semibold [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))]">
                  {deliveryWishLabel}
                </span>
                <TimeInput
                  value={deliveryWishValue}
                  placeholder={deliveryWishPlaceholder}
                  onChange={(next) => {
                    onDeliveryWishChange(next);
                    if (next.trim()) {
                      onDeliveryTimeChange?.("custom");
                    } else {
                      onDeliveryTimeChange?.("");
                    }
                  }}
                />
              </div>
            ) : null}
          </FilterSection>
        ),
      });
    }

    return layers;
  }, [
    onSearchChange,
    searchLabel,
    searchPlaceholder,
    searchValue,
    onRestaurantSearchChange,
    restaurantSearchLabel,
    restaurantSearchPlaceholder,
    restaurantSearchValue,
    cityDrill,
    cityLabel,
    citySummary,
    tagsEnabled,
    tagCatalogOptions,
    filtersLabel,
    tagsSearchPlaceholder,
    tagsEmptyHint,
    tagsNoResultsText,
    tagSearchValue,
    onTagSearchChange,
    selectedTagValues,
    showSearchHits,
    popularOptions,
    searchPool,
    deliveryEnabled,
    deliveryTimeLabel,
    deliveryTimeOptions,
    deliveryTimeValue,
    onDeliveryTimeChange,
    onDeliveryWishChange,
    deliveryWishLabel,
    deliveryWishPlaceholder,
    deliveryWishValue,
  ]);

  const railIconAriaLabel = useCallback(
    (rowKey: string) => {
      switch (rowKey) {
        case "filters-search":
          return searchLabel.trim() || "Поиск";
        case "filters-restaurant":
          return restaurantSearchLabel.trim() || "Поле поиска";
        case "filters-city":
          return cityLabel;
        case "filters-tags":
          return filtersLabel;
        case "filters-delivery":
          return deliveryTimeLabel;
        default:
          return "Раздел фильтров";
      }
    },
    [searchLabel, restaurantSearchLabel, cityLabel, filtersLabel, deliveryTimeLabel],
  );

  const cityDrillRailAria = useCallback((rowKey: string) => {
    switch (rowKey) {
      case "city-drill-search":
        return "Поиск по списку";
      case "city-drill-list":
        return "Список городов";
      default:
        return "Раздел";
    }
  }, []);

  const cityDrillLayers = useMemo((): CatalogFilterRailLayer[] => {
    if (!cityDrill) {
      return [];
    }
    return [
      {
        rowKey: "city-drill-search",
        sectionId: "filters-city-drill-search",
        icon: <SearchIcon size={16} />,
        section: (
          <InputSection
            id="filters-city-drill-search"
            title="Поиск по списку"
            placeholder="Поиск по списку"
            value={listFilter}
            onChange={setListFilter}
          />
        ),
      },
      {
        rowKey: "city-drill-list",
        sectionId: "filters-city-drill-list",
        icon: <MapPinIcon size={16} />,
        section: (
          <FilterSection id="filters-city-drill-list" title="Выберите город">
            <div
              className={cx(
                "flex min-h-0 flex-col gap-1 py-[2px]",
                scrollFiltersInDrawer
                  ? "max-h-[min(50vh,320px)] overflow-y-auto overflow-x-hidden"
                  : "min-h-0 flex-1 flex-col overflow-y-auto",
                CATALOG_FILTER_RAIL_SCROLLBAR_HIDE,
              )}
              role="list"
            >
              {filteredCityOptions.map((opt) => (
                <SelectOptionRow
                  key={opt.value || "__any__"}
                  label={opt.label}
                  selected={tempCity === opt.value}
                  onPick={() => setTempCity(opt.value)}
                />
              ))}
            </div>
          </FilterSection>
        ),
      },
    ];
  }, [
    cityDrill,
    filteredCityOptions,
    listFilter,
    scrollFiltersInDrawer,
    tempCity,
  ]);

  const showBuiltInFooter =
    showApplyButton && Boolean(onApplyFilters);

  const footerBlock =
    showBuiltInFooter && onApplyFilters ? (
      <div
        className={cx(
          "mt-1 flex shrink-0 flex-col gap-2 border-t pt-3 [border-color:var(--jm-color-border-secondary,#f0f0f0)]",
          scrollFiltersInDrawer &&
            "pb-[calc(12px+env(safe-area-inset-bottom,0px))] [background:var(--ant-color-bg-container,#fff)]",
        )}
      >
        <Button
          type="primary"
          block
          disabled={applyDisabled}
          onClick={() => {
            onApplyFilters();
            mobileFiltersDrawer?.closeDrawer();
          }}
        >
          {applyButtonText}
        </Button>
        {onResetFilters ? (
          <button
            type="button"
            className="m-0 p-0 border-none bg-none cursor-pointer text-sm leading-[1.5] text-[#ff4d4f] text-center w-full hover:underline"
            onClick={() => setResetConfirmOpen(true)}
          >
            Сбросить
          </button>
        ) : null}
      </div>
    ) : null;

  if (panel === "city" && cityDrill) {
    return (
      <div
        className={cx(
          "flex min-w-0 w-full flex-col p-0 box-border",
          "min-h-0 flex-1 overflow-hidden",
        )}
      >
        <CatalogFilterRailScroll
          layers={cityDrillLayers}
          railIconAriaLabel={cityDrillRailAria}
          scrollMode={
            scrollFiltersInDrawer ? "nearestViewport" : "scrollRoot"
          }
          className={cx(
            "min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]",
            !scrollFiltersInDrawer && "wide:ml-[-56px]",
          )}
        />
        <div
          className={cx(
            "mt-2 flex shrink-0 flex-col gap-2 border-t pt-3 [border-color:var(--jm-color-border-secondary,#f0f0f0)]",
            scrollFiltersInDrawer &&
              "pb-[calc(12px+env(safe-area-inset-bottom,0px))] [background:var(--ant-color-bg-container,#fff)]",
          )}
        >
          <Button type="primary" block onClick={confirmCity}>
            Готово
          </Button>
          <button
            type="button"
            className="m-0 p-0 border-none bg-none cursor-pointer text-sm leading-[1.5] text-[#ff4d4f] text-center hover:underline"
            onClick={closeCity}
          >
            Отменить
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cx(
        "flex w-full min-w-0 flex-col p-0 box-border",
        "min-h-0 min-w-0 flex-1",
      )}
    >
      <CatalogFilterRailScroll
        layers={filterLayers}
        railIconAriaLabel={railIconAriaLabel}
        scrollMode={
          scrollFiltersInDrawer ? "nearestViewport" : "scrollRoot"
        }
        className={cx(
          "flex min-w-0 flex-col gap-3 box-border",
          !scrollFiltersInDrawer && "wide:ml-[-56px]",
          scrollFiltersInDrawer
            ? "min-h-0 flex-1 overflow-y-auto overflow-x-hidden pt-2 [-webkit-overflow-scrolling:touch]"
            : "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]",
        )}
      >
        {children}
      </CatalogFilterRailScroll>

      {footerBlock}

      {onResetFilters ? (
        <AppConfirmModal
          open={resetConfirmOpen}
          title="Сбросить фильтры?"
          okText="Сбросить"
          cancelText="Отмена"
          onOk={() => {
            onResetFilters();
            setResetConfirmOpen(false);
            mobileFiltersDrawer?.afterFilterReset();
            mobileFiltersDrawer?.closeDrawer();
          }}
          onCancel={() => setResetConfirmOpen(false)}
        >
          Все выбранные фильтры будут сброшены.
        </AppConfirmModal>
      ) : null}
    </div>
  );
}
