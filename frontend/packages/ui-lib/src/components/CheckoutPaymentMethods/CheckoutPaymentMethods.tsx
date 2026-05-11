"use client";

import cx from "classnames";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { Button } from "../Button/Button";
import { CheckoutPaymentMethodTiles } from "./CheckoutPaymentMethodTiles";
import type { CheckoutPaymentMethodId } from "./checkoutPaymentMethodModel";

export type { CheckoutPaymentMethodId } from "./checkoutPaymentMethodModel";
export { CHECKOUT_PAYMENT_METHODS, getPaymentMethodLabel } from "./checkoutPaymentMethodModel";
export { CheckoutPaymentMethodTiles } from "./CheckoutPaymentMethodTiles";

/** QR-заглушка для оплаты СБП (показывается в модалке после «Оплатить»). */
export function CheckoutSbpQrBlock() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex h-[148px] w-[148px] items-center justify-center border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [border-radius:var(--ant-border-radius-lg,8px)] [background:var(--ant-color-fill-secondary,#f0f0f0)]"
        aria-label="QR-код для оплаты"
      >
        <div className="flex flex-col items-center gap-1 [color:var(--ant-color-text-quaternary,rgba(0,0,0,0.25))]">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
            <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
            <rect x="28" y="4" width="16" height="16" rx="2" fill="currentColor" />
            <rect x="4" y="28" width="16" height="16" rx="2" fill="currentColor" />
            <rect x="8" y="8" width="8" height="8" rx="1" fill="white" />
            <rect x="32" y="8" width="8" height="8" rx="1" fill="white" />
            <rect x="8" y="32" width="8" height="8" rx="1" fill="white" />
            <rect x="28" y="28" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="36" y="28" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="28" y="36" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="36" y="36" width="4" height="4" rx="1" fill="currentColor" />
          </svg>
          <span className="text-center text-[11px] leading-[1.3]">QR-код</span>
        </div>
      </div>
      <p className="m-0 text-center text-[13px] leading-[1.4] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
        Отсканируйте камерой телефона или в приложении банка
      </p>
    </div>
  );
}

function SbpPanel() {
  return (
    <div className="py-4">
      <p className="m-0 text-center text-[14px] leading-[1.55] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
        Воспользуйтесь системой быстрых платежей.
      </p>
    </div>
  );
}

/** PAN без пробелов, 13–19 цифр, контрольная сумма по Луна. */
function luhnValid(panDigits: string): boolean {
  if (panDigits.length < 13 || panDigits.length > 19) {
    return false;
  }
  let sum = 0;
  let double = false;
  for (let i = panDigits.length - 1; i >= 0; i -= 1) {
    let n = Number(panDigits[i]);
    if (!Number.isInteger(n)) {
      return false;
    }
    if (double) {
      n *= 2;
      if (n > 9) {
        n -= 9;
      }
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

function expiryValid(mmYY: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(mmYY.trim());
  if (!m) {
    return false;
  }
  const mm = Number(m[1]);
  const yy = Number(m[2]);
  if (mm < 1 || mm > 12) {
    return false;
  }
  const now = new Date();
  const fullYear = 2000 + yy;
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  if (fullYear > curY) {
    return true;
  }
  if (fullYear < curY) {
    return false;
  }
  return mm >= curM;
}

function cardPanDigitsFromInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 19);
}

function formatPanGroups(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function CardPanel({ onValidityChange }: { onValidityChange: (valid: boolean) => void }) {
  const [panDigits, setPanDigits] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const last4 = panDigits.slice(-4).padStart(4, "•");
  const maskedPan =
    panDigits.length <= 4
      ? "•••• •••• •••• ____"
      : `•••• •••• •••• ${last4}`;

  const valid = useMemo(() => {
    const cvvOk = /^[0-9]{3,4}$/.test(cvv);
    return luhnValid(panDigits) && expiryValid(expiry) && cvvOk;
  }, [panDigits, expiry, cvv]);

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, onValidityChange]);

  const onPanChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPanDigits(cardPanDigitsFromInput(e.target.value));
  }, []);

  const onExpiryChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 2) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    setExpiry(v);
  }, []);

  const onCvvChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto flex h-[168px] w-full max-w-[320px] flex-col justify-between rounded-[16px] p-5 [background:linear-gradient(135deg,#1a1a2e_0%,#16213e_50%,#0f3460_100%)] [box-shadow:0_8px_32px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between">
          <div
            className="h-5 w-8 rounded-[3px] [background:linear-gradient(135deg,#ffd700,#ffa500)]"
            aria-hidden
          />
          <span className="text-xs font-semibold text-white opacity-70">BANK CARD</span>
        </div>
        <div className="flex flex-col gap-2">
          <p className="m-0 font-mono text-[15px] tracking-[0.18em] text-white opacity-90">{maskedPan}</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="m-0 text-[9px] uppercase tracking-wide text-white opacity-50">
                Держатель
              </p>
              <p className="m-0 text-[12px] font-semibold tracking-wide text-white opacity-80">
                IVAN IVANOV
              </p>
            </div>
            <div className="text-right">
              <p className="m-0 text-[9px] uppercase tracking-wide text-white opacity-50">
                Срок
              </p>
              <p className="m-0 text-[12px] font-semibold text-white opacity-80">
                {expiry || "MM/YY"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
            Номер карты
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="•••• •••• •••• ____"
            maxLength={23}
            value={formatPanGroups(panDigits)}
            onChange={onPanChange}
            autoComplete="cc-number"
            className="box-border h-10 w-full border border-solid px-3 font-mono text-sm tracking-widest outline-none [background:var(--ant-color-bg-container,#fff)] [border-color:var(--ant-color-border,#d9d9d9)] [border-radius:var(--ant-border-radius,6px)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] placeholder:[color:var(--ant-color-text-placeholder,rgba(0,0,0,0.25))] transition-all focus:[border-color:var(--ant-color-primary,#1677ff)] focus:[box-shadow:0_0_0_2px_rgba(22,119,255,0.1)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
              Срок (ММ/ГГ)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              maxLength={5}
              value={expiry}
              onChange={onExpiryChange}
              autoComplete="cc-exp"
              className="box-border h-10 w-full border border-solid px-3 font-mono text-sm outline-none [background:var(--ant-color-bg-container,#fff)] [border-color:var(--ant-color-border,#d9d9d9)] [border-radius:var(--ant-border-radius,6px)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] placeholder:[color:var(--ant-color-text-placeholder,rgba(0,0,0,0.25))] transition-all focus:[border-color:var(--ant-color-primary,#1677ff)] focus:[box-shadow:0_0_0_2px_rgba(22,119,255,0.1)]"
            />
          </div>
          <div>
            <label className="mb-[6px] block text-[12px] font-semibold uppercase tracking-wide [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
              CVV
            </label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="•••"
              maxLength={4}
              value={cvv}
              onChange={onCvvChange}
              autoComplete="cc-csc"
              className="box-border h-10 w-full border border-solid px-3 font-mono text-sm outline-none [background:var(--ant-color-bg-container,#fff)] [border-color:var(--ant-color-border,#d9d9d9)] [border-radius:var(--ant-border-radius,6px)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] placeholder:[color:var(--ant-color-text-placeholder,rgba(0,0,0,0.25))] transition-all focus:[border-color:var(--ant-color-primary,#1677ff)] focus:[box-shadow:0_0_0_2px_rgba(22,119,255,0.1)]"
            />
          </div>
        </div>
        <p className="m-0 text-[11px] leading-[1.4] [color:var(--ant-color-text-quaternary,rgba(0,0,0,0.25))]">
          Данные защищены шифрованием. Мы не храним CVV.
        </p>
      </div>
    </div>
  );
}

function YandexPayPanel({ linked }: { linked: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-3xl font-black text-white [background:#fc3f1d]"
        aria-hidden
      >
        Я
      </div>
      <div className="text-center">
        <p className="m-0 mb-1 text-[15px] font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
          Яндекс Пэй
        </p>
        {linked ? (
          <>
            <p className="m-0 text-[15px] font-semibold [color:var(--ant-color-success,#52c41a)]">
              Уже привязано
            </p>
            <p className="m-0 mt-2 max-w-[280px] text-sm leading-[1.45] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
              Счёт Яндекс Пэй можно использовать для оплаты этого заказа.
            </p>
          </>
        ) : (
          <p className="m-0 max-w-[280px] text-sm leading-[1.45] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
            Привяжите счёт Яндекс Пэй — оплата в один тап без ввода карты.
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={linked}
        className={cx(
          "h-[48px] w-full max-w-[280px] rounded-[24px] border-none text-[15px] font-bold tracking-wide text-white [background:#fc3f1d] [box-shadow:0_4px_16px_rgba(252,63,29,0.35)] transition-opacity",
          linked
            ? "cursor-default opacity-60"
            : "cursor-pointer hover:opacity-90",
        )}
      >
        {linked ? "Уже привязано" : "Привязать Счёт Яндекс Пэй"}
      </button>
    </div>
  );
}

function SberPanel({ linked }: { linked: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-3xl font-black text-white [background:#21a038]"
        aria-hidden
      >
        С
      </div>
      <div className="text-center">
        <p className="m-0 mb-1 text-[15px] font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
          СберPay
        </p>
        {linked ? (
          <>
            <p className="m-0 text-[15px] font-semibold [color:var(--ant-color-success,#52c41a)]">
              Уже привязано
            </p>
            <p className="m-0 mt-2 max-w-[280px] text-sm leading-[1.45] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
              Счёт СберPay привязан — можно оплатить заказ из приложения Сбербанка.
            </p>
          </>
        ) : (
          <p className="m-0 max-w-[280px] text-sm leading-[1.45] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
            Привяжите счёт СберPay для быстрой оплаты из приложения Сбербанка.
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={linked}
        className={cx(
          "h-[48px] w-full max-w-[280px] rounded-[24px] border-none text-[15px] font-bold tracking-wide text-white [background:#21a038] [box-shadow:0_4px_16px_rgba(33,160,56,0.35)] transition-opacity",
          linked
            ? "cursor-default opacity-60"
            : "cursor-pointer hover:opacity-90",
        )}
      >
        {linked ? "Уже привязано" : "Привязать Счёт СберPay"}
      </button>
    </div>
  );
}

function CardSavedMockPanel({
  onValidityChange,
}: {
  onValidityChange: (valid: boolean) => void;
}) {
  useEffect(() => {
    onValidityChange(true);
  }, [onValidityChange]);
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <p className="m-0 text-center text-sm leading-relaxed [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
        В dev сохранена тестовая карта (кэш). Можно сразу подтвердить способ оплаты.
      </p>
    </div>
  );
}

export type CheckoutPaymentMethodsProps = {
  activeMethod: CheckoutPaymentMethodId;
  onActiveMethodChange: (m: CheckoutPaymentMethodId) => void;
  /** Кнопка «Подтвердить» и красная «Отмена» под контентом (дровер / боковая панель) */
  paymentFooter?: {
    onConfirm: () => void;
    onCancel: () => void;
  };
  /** Профиль: счёт Яндекс Пэй уже привязан */
  yandexPayLinked?: boolean;
  /** Профиль: счёт СберPay уже привязан */
  sberPayLinked?: boolean;
  /** Плотность сетки способов оплаты */
  tilesDensity?: "default" | "relaxed";
  /** Dev: карта уже «сохранена» в кэше — подтверждение без ввода полей */
  cardMockSaved?: boolean;
};

export function CheckoutPaymentMethods({
  activeMethod,
  onActiveMethodChange,
  paymentFooter,
  yandexPayLinked = false,
  sberPayLinked = false,
  tilesDensity = "default",
  cardMockSaved = false,
}: CheckoutPaymentMethodsProps) {
  const [cardFormValid, setCardFormValid] = useState(false);

  const onCardValidityChange = useCallback((valid: boolean) => {
    setCardFormValid(valid);
  }, []);

  useEffect(() => {
    if (activeMethod !== "card") {
      setCardFormValid(false);
      return;
    }
    if (cardMockSaved) {
      setCardFormValid(true);
      return;
    }
    setCardFormValid(false);
  }, [activeMethod, cardMockSaved]);

  const confirmDisabled = useMemo(() => {
    if (!paymentFooter) {
      return false;
    }
    if (activeMethod === "card") {
      return !cardFormValid && !cardMockSaved;
    }
    if (activeMethod === "yandex") {
      return !yandexPayLinked;
    }
    if (activeMethod === "sber") {
      return !sberPayLinked;
    }
    return false;
  }, [
    paymentFooter,
    activeMethod,
    cardFormValid,
    cardMockSaved,
    yandexPayLinked,
    sberPayLinked,
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto [-webkit-overflow-scrolling:touch] p-2 wide:p-3">
        <CheckoutPaymentMethodTiles
          variant="emphasis"
          density={tilesDensity}
          value={activeMethod}
          onChange={onActiveMethodChange}
        />

        <div
          className="border-t pt-4 [border-color:var(--ant-color-border-secondary,#f0f0f0)]"
          role="tabpanel"
        >
          {activeMethod === "sbp" && <SbpPanel />}
          {activeMethod === "card" &&
            (cardMockSaved ? (
              <CardSavedMockPanel onValidityChange={onCardValidityChange} />
            ) : (
              <CardPanel onValidityChange={onCardValidityChange} />
            ))}
          {activeMethod === "yandex" && <YandexPayPanel linked={yandexPayLinked} />}
          {activeMethod === "sber" && <SberPanel linked={sberPayLinked} />}
        </div>
      </div>

      {paymentFooter ? (
        <div className="flex shrink-0 flex-col gap-2 border-t [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)] px-3 py-3 [padding-bottom:calc(12px+env(safe-area-inset-bottom,0px))]">
          <Button
            type="primary"
            size="large"
            block
            disabled={confirmDisabled}
            onClick={paymentFooter.onConfirm}
          >
            Подтвердить
          </Button>
          <button
            type="button"
            className="m-0 w-full cursor-pointer border-none bg-transparent p-0 text-center text-sm font-medium [color:#ff4d4f] hover:underline"
            onClick={paymentFooter.onCancel}
          >
            Отмена
          </button>
        </div>
      ) : null}
    </div>
  );
}
