"use client";

import cx from "classnames";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { CachedImage } from "../CachedImage/CachedImage";
import { DownIcon } from "../Icons/Icons";

export type ExpandableCardMode = "catalog" | "restaurant";

/** Чип тега под сабтайтлом: `value` для логики (например id в URL), `label` для отображения. */
export type ExpandableCardTag = {
  value: string;
  label: string;
};

export type ExpandableCardProps = {
  mode: ExpandableCardMode;
  title: string;
  /** Цена — справа в строке с названием (каталог блюд) */
  price?: string;
  /** Строка рейтинга (например «4.5») — слева перед названием */
  rating?: string;
  /** Подзаголовок (напр. имя ресторана или адрес) */
  subtitle?: string;
  /** Текст «— доставка: …» у подзаголовка (имя ресторана) или у названия — см. `pinDeliveryNextToTitle` */
  averageDelivery?: string;
  /** Если true — «доставка» сразу после названия; иначе — после подзаголовка */
  pinDeliveryNextToTitle?: boolean;
  /** Теги; перед списком показывается # */
  tags?: readonly ExpandableCardTag[];
  onTagClick?: (value: string) => void;
  /** Доп. строка под тегами */
  meta?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  /** Если задан — вместо {@link CachedImage} по `thumbnailUrl`. */
  thumbnailSlot?: ReactNode;
  /** Не показывать колонку превью (например если галерея вынесена выше). */
  thumbnailHidden?: boolean;
  /** Не показывать заголовок в шапке карточки (цена при `price` остаётся). */
  hideTitle?: boolean;
  description?: string;
  expandedContent?: ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
  className?: string;
  /** Без раскрывающейся панели; описание показывается сразу под подзаголовком */
  disableExpansion?: boolean;
  /** Клик по карточке (кроме кнопок/ссылок) — напр. переход на страницу ресторана */
  onCardNavigate?: () => void;
  /**
   * Каталог: нижняя строка справа (например «Подробнее…»).
   * На ссылке/кнопке — `onClick={(e) => e.stopPropagation()}`.
   */
  catalogFooterEnd?: ReactNode;
  /** Ресторан: «В корзину» / счётчик — нижняя строка справа */
  restaurantFooterStart?: ReactNode;
};

export function ExpandableCard({
  mode,
  title,
  price,
  rating,
  subtitle,
  averageDelivery,
  pinDeliveryNextToTitle = false,
  tags,
  onTagClick,
  meta,
  thumbnailUrl,
  thumbnailAlt,
  thumbnailSlot,
  thumbnailHidden = false,
  description,
  expandedContent,
  defaultExpanded,
  expanded: controlledExpanded,
  onExpandedChange,
  disabled = false,
  className,
  disableExpansion = false,
  hideTitle = false,
  onCardNavigate,
  catalogFooterEnd,
  restaurantFooterStart,
}: ExpandableCardProps) {
  const initial = defaultExpanded ?? mode === "restaurant";
  const [internalExpanded, setInternalExpanded] = useState(initial);

  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const hasPanel = !disableExpansion && Boolean(description || expandedContent);
  const showInlineDescription = Boolean(
    disableExpansion && description?.trim(),
  );

  const handleToggle = () => {
    if (disabled || !hasPanel) {
      return;
    }
    const next = !isExpanded;
    if (isControlled) {
      onExpandedChange?.(next);
    } else {
      setInternalExpanded(next);
      onExpandedChange?.(next);
    }
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    const t = e.target as HTMLElement;
    if (t.closest("button, a, [data-tag-static]")) {
      return;
    }
    if (onCardNavigate) {
      onCardNavigate();
      return;
    }
    handleToggle();
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") {
      return;
    }
    if (disabled) {
      return;
    }
    const t = e.target as HTMLElement;
    if (t.closest("button, a, [data-tag-static]")) {
      return;
    }
    e.preventDefault();
    if (onCardNavigate) {
      onCardNavigate();
      return;
    }
    if (hasPanel) {
      handleToggle();
    }
  };

  const footerSlot =
    mode === "catalog" ? catalogFooterEnd : restaurantFooterStart;

  const showBottomBar = Boolean(footerSlot || (hasPanel && !disableExpansion));

  const cardCursor =
    onCardNavigate || hasPanel
      ? "pointer"
      : disabled
        ? "not-allowed"
        : "default";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: composite card — nested buttons/links; root handles row activation.
    <div
      className={cx(
        "relative box-border w-full max-w-[min(760px,100%)] mx-auto flex flex-col gap-0 p-3 rounded-xl border [border-color:var(--jm-color-border-secondary,#f0f0f0)] [background:var(--jm-color-bg-container,#fff)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] [transition:border-color_0.2s_ease,box-shadow_0.2s_ease] hover:[border-color:var(--jm-color-border-secondary,#e0e0e0)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
        className,
      )}
      onClick={handleCardClick}
      onKeyDown={
        !disabled && (onCardNavigate || hasPanel)
          ? handleCardKeyDown
          : undefined
      }
      role={!disabled && (onCardNavigate || hasPanel) ? "group" : undefined}
      tabIndex={!disabled && (onCardNavigate || hasPanel) ? 0 : undefined}
      data-expanded={isExpanded ? "true" : "false"}
      data-has-panel={hasPanel ? "true" : "false"}
      data-mode={mode}
      style={{ cursor: cardCursor }}
    >
      <div
        className={cx(
          "flex flex-row gap-3 items-start",
          !thumbnailHidden && "min-h-[88px]",
        )}
      >
        {!thumbnailHidden && thumbnailSlot ? (
          <div className="relative flex-shrink-0 w-[88px] h-[88px] rounded-[10px] overflow-hidden [background:var(--jm-color-fill-quaternary,#f5f5f5)]">
            {thumbnailSlot}
          </div>
        ) : !thumbnailHidden && thumbnailUrl ? (
          <div className="flex-shrink-0 w-[88px] h-[88px] rounded-[10px] overflow-hidden [background:var(--jm-color-fill-quaternary,#f5f5f5)]">
            <CachedImage
              src={thumbnailUrl}
              alt={thumbnailAlt ?? title}
              objectFit="cover"
              loading="lazy"
            />
          </div>
        ) : !thumbnailHidden ? (
          <div
            className="flex-shrink-0 w-[88px] h-[88px] rounded-[10px] [background:var(--jm-color-fill-quaternary,#f5f5f5)]"
            aria-hidden
          />
        ) : null}
        <div className="flex-1 min-w-0 flex flex-col gap-1 pr-[2px]">
          <div className="flex flex-row items-start justify-start gap-2 flex-nowrap">
            {rating ? (
              <span
                className="flex-shrink-0 mt-[1px] text-[13px] font-semibold leading-[1.35] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))] whitespace-nowrap"
                role="img"
                aria-label={`Рейтинг ${rating}`}
              >
                ⭐ {rating}
              </span>
            ) : null}
            <div className="flex flex-row flex-wrap items-baseline gap-x-1 flex-[1_1_auto] min-w-0">
              {!hideTitle ? (
                <h3 className="m-0 text-[15px] font-semibold leading-[1.35] [color:var(--jm-color-text,rgba(0,0,0,0.88))] flex-[0_1_auto] min-w-0">
                  {title}
                </h3>
              ) : (
                <span className="sr-only">{title}</span>
              )}
              {pinDeliveryNextToTitle && averageDelivery ? (
                <span className="text-[13px] font-normal leading-[1.35] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))] whitespace-normal">
                  {" "}
                  — доставка: {averageDelivery}
                </span>
              ) : null}
            </div>
            {price ? (
              <div className="flex-shrink-0 ml-auto text-[15px] font-bold leading-[1.35] [color:var(--jm-color-primary,#1677ff)] whitespace-nowrap">
                {price}
              </div>
            ) : null}
          </div>
          {subtitle ? (
            <p className="m-0 text-[13px] leading-[1.4] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))]">
              <span>{subtitle}</span>
              {!pinDeliveryNextToTitle && averageDelivery ? (
                <span className="text-[13px] font-normal leading-[1.35] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))] whitespace-normal">
                  {" "}
                  — доставка: {averageDelivery}
                </span>
              ) : null}
            </p>
          ) : null}
          {showInlineDescription ? (
            <p className="m-0 text-sm leading-[1.5] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))]">
              {description}
            </p>
          ) : null}
          {tags && tags.length > 0 ? (
            <div className="flex flex-row flex-wrap items-baseline gap-x-[10px] gap-y-1 w-full">
              <span
                className="flex-shrink-0 m-0 p-0 text-[13px] font-bold not-italic leading-[1.5] [color:var(--jm-color-text-tertiary,rgba(0,0,0,0.45))]"
                aria-hidden
              >
                #
              </span>
              <ul className="flex flex-wrap gap-x-[10px] gap-y-1 m-0 p-0 list-none items-baseline flex-[1_1_auto] min-w-0">
                {tags.map((t) => (
                  <li key={t.value} className="m-0 p-0 list-none">
                    {onTagClick ? (
                      <button
                        type="button"
                        className="m-0 p-0 font-[inherit] text-[13px] italic leading-[1.5] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))] bg-none border-none cursor-pointer no-underline hover:[color:var(--jm-color-primary,#1677ff)] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagClick(t.value);
                        }}
                      >
                        {t.label}
                      </button>
                    ) : (
                      <span
                        data-tag-static
                        className="m-0 p-0 font-[inherit] text-[13px] italic leading-[1.5] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))] bg-none border-none cursor-default no-underline"
                      >
                        {t.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {meta ? (
            <p className="m-0 text-xs leading-[1.35] [color:var(--jm-color-text-tertiary,rgba(0,0,0,0.45))]">
              {meta}
            </p>
          ) : null}
        </div>
      </div>

      {hasPanel ? (
        <div
          className={cx(
            "grid [grid-template-rows:0fr] [transition:grid-template-rows_0.22s_ease] overflow-hidden",
            isExpanded && "[grid-template-rows:1fr]",
          )}
          aria-hidden={!isExpanded}
        >
          <div className="min-h-0 pt-2 pb-1 flex flex-col gap-2">
            {description ? (
              <p className="m-0 text-sm leading-[1.5] [color:var(--jm-color-text-secondary,rgba(0,0,0,0.65))] whitespace-pre-wrap">
                {description}
              </p>
            ) : null}
            {expandedContent}
          </div>
        </div>
      ) : null}

      {showBottomBar ? (
        <div
          className={cx(
            "grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-2 min-h-[28px] [transition:margin-top_0.22s_ease]",
            hasPanel && !isExpanded
              ? "-mt-[38px]"
              : hasPanel && isExpanded
                ? "-mt-[6px]"
                : "mt-[6px]",
          )}
        >
          <div className="flex justify-start items-center min-w-0">
            <span className="inline-block w-px h-px overflow-hidden [clip:rect(0_0_0_0)] opacity-0" />
          </div>
          {hasPanel && !disabled ? (
            <div
              className="flex justify-center items-center min-w-[18px] pointer-events-none opacity-55"
              aria-hidden
            >
              <DownIcon
                className={cx(
                  "w-[18px] h-[18px] [color:var(--jm-color-text-tertiary,rgba(0,0,0,0.45))] [transition:transform_0.2s_ease]",
                  isExpanded && "rotate-180",
                )}
              />
            </div>
          ) : (
            <div
              className="flex justify-center items-center min-w-[18px] pointer-events-none opacity-55"
              aria-hidden
            >
              <span className="inline-block w-px h-px overflow-hidden [clip:rect(0_0_0_0)] opacity-0" />
            </div>
          )}
          <div className="flex justify-end items-center min-w-0 text-right">
            {footerSlot ?? (
              <span className="inline-block w-px h-px overflow-hidden [clip:rect(0_0_0_0)] opacity-0" />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
