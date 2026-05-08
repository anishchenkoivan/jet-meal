"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AppConfirmModal } from "../AppConfirmModal/AppConfirmModal";
import { Input } from "../Input/Input";
import { Button } from "../Button/Button";
import { TimeInput } from "../TimeInput/TimeInput";
import cx from "classnames";
import { useCatalogFiltersInMobileDrawer } from "./CatalogFiltersLayoutContext";
import styles from "./CatalogFilters.module.css";

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

function PickListRow({
  label,
  selected,
  onPick,
}: {
  label: string;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      className={cx(styles["listRow"], selected && styles["listRowSelected"])}
      onClick={onPick}
    >
      {label}
    </button>
  );
}

function DeliveryChips({
  options,
  selected,
  onSelect,
}: {
  options: FilterOption[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className={styles["timeChipRow"]} role="list">
      {options.map((opt) => (
        <button
          key={opt.value || "__any__"}
          type="button"
          className={cx(
            styles["timeChip"],
            selected === opt.value && styles["timeChipActive"],
          )}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

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
  const inMobileDrawer = useCatalogFiltersInMobileDrawer();
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
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q)
      );
    });
  }, [tagCatalogOptions, tagSearchValue, selectedTagValues]);

  const showSearchHits = tagSearchValue.trim().length > 0;

  const showBuiltInFooter =
    !inMobileDrawer && showApplyButton && Boolean(onApplyFilters);

  const footerBlock =
    showBuiltInFooter && onApplyFilters ? (
      <div className={styles["footerStack"]}>
        <Button
          type="primary"
          block
          disabled={applyDisabled}
          onClick={onApplyFilters}
        >
          {applyButtonText}
        </Button>
        {onResetFilters ? (
          <button
            type="button"
            className={styles["resetText"]}
            onClick={() => setResetConfirmOpen(true)}
          >
            Сбросить
          </button>
        ) : null}
      </div>
    ) : null;

  if (panel === "city" && cityDrill) {
    return (
      <div className={styles["root"]}>
        <h2 className={styles["panelTitle"]}>Выберите город</h2>
        <Input
          allowClear
          placeholder="Поиск по списку"
          value={listFilter}
          onChange={(e) => setListFilter(e.target.value)}
        />
        <div className={styles["scrollList"]} role="list">
          {filteredCityOptions.map((opt) => (
            <PickListRow
              key={opt.value || "__any__"}
              label={opt.label}
              selected={tempCity === opt.value}
              onPick={() => setTempCity(opt.value)}
            />
          ))}
        </div>
        <Button type="primary" block onClick={confirmCity}>
          Готово
        </Button>
        <button type="button" className={styles["cancelText"]} onClick={closeCity}>
          Отменить
        </button>
        {children}
      </div>
    );
  }

  return (
    <div className={styles["root"]}>
      {onSearchChange ? (
        <div className={styles["field"]}>
          {searchLabel.trim() ? (
            <span className={styles["label"]}>{searchLabel}</span>
          ) : null}
          <Input
            allowClear
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
          />
        </div>
      ) : null}

      {onRestaurantSearchChange ? (
        <div className={styles["field"]}>
          {restaurantSearchLabel.trim() ? (
            <span className={styles["label"]}>{restaurantSearchLabel}</span>
          ) : null}
          <Input
            allowClear
            placeholder={restaurantSearchPlaceholder}
            value={restaurantSearchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onRestaurantSearchChange(e.target.value)
            }
          />
        </div>
      ) : null}

      {cityDrill ? (
        <div className={styles["field"]}>
          <span className={styles["label"]}>{cityLabel}</span>
          <button
            type="button"
            className={styles["pseudoField"]}
            onClick={() => setPanel("city")}
          >
            <span className={styles["pseudoValue"]}>{citySummary}</span>
          </button>
        </div>
      ) : null}

      {tagsEnabled && tagCatalogOptions?.length ? (
        <div className={styles["field"]}>
          <span className={styles["label"]}>{filtersLabel}</span>
          <Input
            allowClear
            placeholder="Поиск по тегам"
            value={tagSearchValue}
            onChange={(e) => onTagSearchChange?.(e.target.value)}
          />
          {selectedTagValues.length > 0 ? (
            <div className={styles["selectedTags"]}>
              {selectedTagValues.map((id) => {
                const lab =
                  tagCatalogOptions!.find((o) => o.value === id)?.label ?? id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={styles["selectedTag"]}
                    onClick={() => toggleTag(id)}
                  >
                    {lab}
                    <span className={styles["selectedTagX"]}>×</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className={styles["tagHint"]}>Выберите теги ниже</p>
          )}
          {!showSearchHits && popularOptions.length > 0 ? (
            <div className={styles["tagPickRow"]}>
              {popularOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={styles["tagPick"]}
                  onClick={() => toggleTag(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : null}
          {showSearchHits ? (
            <div className={styles["tagSearchResults"]}>
              {searchPool.length === 0 ? (
                <span className={styles["tagHint"]}>Ничего не найдено</span>
              ) : (
                <div className={styles["tagPickRow"]}>
                  {searchPool.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={styles["tagPick"]}
                      onClick={() => toggleTag(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {deliveryEnabled ? (
        <div className={styles["field"]}>
          <span className={styles["label"]}>{deliveryTimeLabel}</span>
          <DeliveryChips
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
            <div className={styles["wishBlock"]}>
              <span className={styles["subLabel"]}>{deliveryWishLabel}</span>
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
        </div>
      ) : null}

      {children}

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
          }}
          onCancel={() => setResetConfirmOpen(false)}
        >
          Все выбранные фильтры будут сброшены.
        </AppConfirmModal>
      ) : null}
    </div>
  );
}
