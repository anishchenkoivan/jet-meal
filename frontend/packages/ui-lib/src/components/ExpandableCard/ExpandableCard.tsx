"use client";

import { DownIcon } from "../Icons/Icons";
import { CachedImage } from "../CachedImage/CachedImage";
import cx from "classnames";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import styles from "./ExpandableCard.module.css";

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
  description,
  expandedContent,
  defaultExpanded,
  expanded: controlledExpanded,
  onExpandedChange,
  disabled = false,
  className,
  disableExpansion = false,
  onCardNavigate,
  catalogFooterEnd,
  restaurantFooterStart,
}: ExpandableCardProps) {
  const initial = defaultExpanded ?? (mode === "restaurant" ? true : false);
  const [internalExpanded, setInternalExpanded] = useState(initial);

  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const hasPanel =
    !disableExpansion && Boolean(description || expandedContent);
  const showInlineDescription = Boolean(
    disableExpansion && description?.trim(),
  );

  const handleToggle = (_e: MouseEvent<HTMLDivElement>) => {
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
    if (t.closest("button, a")) {
      return;
    }
    if (onCardNavigate) {
      onCardNavigate();
      return;
    }
    handleToggle(e);
  };

  const footerSlot =
    mode === "catalog" ? catalogFooterEnd : restaurantFooterStart;

  const showBottomBar = Boolean(
    footerSlot || (hasPanel && !disableExpansion),
  );

  const cardCursor =
    onCardNavigate || hasPanel
      ? "pointer"
      : disabled
        ? "not-allowed"
        : "default";

  return (
    <div
      className={cx(styles["card"], className)}
      onClick={handleCardClick}
      data-expanded={isExpanded ? "true" : "false"}
      data-has-panel={hasPanel ? "true" : "false"}
      data-mode={mode}
      style={{ cursor: cardCursor }}
    >
      <div className={styles["mediaRow"]}>
        {thumbnailUrl ? (
          <div className={styles["thumb"]}>
            <CachedImage
              src={thumbnailUrl}
              alt={thumbnailAlt ?? title}
              objectFit="cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className={styles["thumbPlaceholder"]} aria-hidden />
        )}
        <div className={styles["headerBlock"]}>
          <div className={styles["titleRow"]}>
            {rating ? (
              <span className={styles["rating"]} aria-label={`Рейтинг ${rating}`}>
                ⭐ {rating}
              </span>
            ) : null}
            <div className={styles["titleCluster"]}>
              <h3 className={styles["title"]}>{title}</h3>
              {pinDeliveryNextToTitle && averageDelivery ? (
                <span className={styles["deliveryTail"]}>
                  {" "}
                  — доставка: {averageDelivery}
                </span>
              ) : null}
            </div>
            {price ? <div className={styles["price"]}>{price}</div> : null}
          </div>
          {subtitle ? (
            <p className={styles["subtitle"]}>
              <span>{subtitle}</span>
              {!pinDeliveryNextToTitle && averageDelivery ? (
                <span className={styles["deliveryTail"]}>
                  {" "}
                  — доставка: {averageDelivery}
                </span>
              ) : null}
            </p>
          ) : null}
          {showInlineDescription ? (
            <p className={styles["inlineDesc"]}>{description}</p>
          ) : null}
          {tags && tags.length > 0 ? (
            <div className={styles["tagBlock"]}>
              <span className={styles["tagHash"]} aria-hidden>
                #
              </span>
              <ul className={styles["tagRow"]}>
                {tags.map((t) => (
                  <li key={t.value} className={styles["tagRowItem"]}>
                    {onTagClick ? (
                      <button
                        type="button"
                        className={styles["tagText"]}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagClick(t.value);
                        }}
                      >
                        {t.label}
                      </button>
                    ) : (
                      <span
                        className={cx(
                          styles["tagText"],
                          styles["tagTextStatic"],
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {meta ? <p className={styles["meta"]}>{meta}</p> : null}
        </div>
      </div>

      {hasPanel ? (
        <div
          className={cx(styles["panel"], isExpanded && styles["panelOpen"])}
          role="region"
          aria-hidden={!isExpanded}
        >
          <div className={styles["panelInner"]}>
            {description ? (
              <p className={styles["descBody"]}>{description}</p>
            ) : null}
            {expandedContent}
          </div>
        </div>
      ) : null}

      {showBottomBar ? (
        <div className={styles["bottomBar"]}>
          <div className={styles["bottomBarLeft"]}>
            <span className={styles["bottomBarCellSpacer"]} />
          </div>
          {hasPanel && !disabled ? (
            <div className={styles["bottomBarCenter"]} aria-hidden>
              <DownIcon
                className={cx(
                  styles["chevron"],
                  isExpanded && styles["chevronOpen"],
                )}
              />
            </div>
          ) : (
            <div className={styles["bottomBarCenter"]} aria-hidden>
              <span className={styles["bottomBarCellSpacer"]} />
            </div>
          )}
          <div className={styles["bottomBarRight"]}>
            {footerSlot ?? <span className={styles["bottomBarCellSpacer"]} />}
          </div>
        </div>
      ) : null}
    </div>
  );
}
