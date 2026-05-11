"use client";

import cx from "classnames";
import type { CheckoutPaymentMethodId } from "./checkoutPaymentMethodModel";
import { CHECKOUT_PAYMENT_METHODS, getPaymentMethodLabel } from "./checkoutPaymentMethodModel";

export type CheckoutPaymentMethodTilesVariant = "muted" | "emphasis";

export type CheckoutPaymentMethodTilesProps = {
  value: CheckoutPaymentMethodId;
  onChange: (id: CheckoutPaymentMethodId) => void;
  /** muted — нейтральные плитки (главная); emphasis — выделение выбранного (вкладки) */
  variant?: CheckoutPaymentMethodTilesVariant;
  /** Увеличенные плитки на главной странице оформления */
  density?: "default" | "relaxed";
  className?: string;
};

/**
 * Плитки способов оплаты: сетка `auto-fill` + `minmax` — при нехватке ширины
 * переносятся на 2, 3 и т.д. строк без горизонтального скролла.
 */
export function CheckoutPaymentMethodTiles({
  value,
  onChange,
  variant = "muted",
  density = "default",
  className,
}: CheckoutPaymentMethodTilesProps) {
  const emphasis = variant === "emphasis";
  const relaxed = density === "relaxed";

  return (
    <div
      className={cx("w-full min-w-0", className)}
      role="group"
      aria-label="Способ оплаты"
    >
      <div
        className={cx(
          "grid w-full",
          relaxed
            ? "grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3"
            : "grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2",
        )}
      >
        {CHECKOUT_PAYMENT_METHODS.map((m) => {
          const selected = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              aria-label={getPaymentMethodLabel(m.id)}
              aria-pressed={selected}
              className={cx(
                "flex aspect-square min-w-0 cursor-pointer flex-col items-center justify-center border-2 border-solid text-center font-semibold leading-tight [border-radius:var(--ant-border-radius-sm,6px)] [transition:border-color_0.15s_ease,background_0.15s_ease,color_0.15s_ease,box-shadow_0.15s_ease]",
                relaxed ? "min-h-[96px] gap-1.5 p-2 text-xs" : "min-h-[76px] gap-1 p-1.5 text-[11px]",
                emphasis
                  ? selected
                    ? "[border-color:var(--ant-color-primary,#1677ff)] [background:var(--ant-color-primary-bg,#e6f4ff)] [color:var(--ant-color-primary,#1677ff)] [box-shadow:0_0_0_1px_rgba(22,119,255,0.35)]"
                    : "[border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] hover:[border-color:var(--ant-color-primary,#1677ff)] hover:[color:var(--ant-color-primary,#1677ff)]"
                  : selected
                    ? "[border-color:var(--ant-color-primary,#1677ff)] [background:var(--ant-color-primary-bg,#e6f4ff)] [color:var(--ant-color-primary,#1677ff)] [box-shadow:0_0_0_1px_rgba(22,119,255,0.25)]"
                    : "[border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-fill-quaternary,#fafafa)] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))] hover:[border-color:var(--ant-color-border,#d9d9d9)] hover:[background:var(--ant-color-bg-container,#fff)] hover:[color:var(--ant-color-text,rgba(0,0,0,0.88))]",
              )}
            >
              <span
                className={cx(
                  "leading-none",
                  relaxed ? "text-[20px]" : "text-[16px]",
                  emphasis ? "" : "opacity-90",
                )}
                aria-hidden
              >
                {m.emoji}
              </span>
              <span className="line-clamp-2">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
