"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import {
  type CheckoutPaymentMethodId,
  CheckoutSbpQrBlock,
  getPaymentMethodLabel,
} from "@jet-meal/ui-lib/src/components/CheckoutPaymentMethods/CheckoutPaymentMethods";
import {
  PayCircleErrorIcon,
  PayCircleLoader,
  PayCircleSuccessIcon,
  PayOutcomeLayout,
  PayPrimaryButton,
} from "@jet-meal/ui-lib/src/components/JetMealDevTools/JetMealDevPayFlowScreens";
import { MiddleColumn } from "@jet-meal/ui-lib/src/components/MiddleColumn/MiddleColumn";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { RestaurantCartLine } from "../../context/restaurant-cart-context";
import type { DevPayScenario } from "../../context/restaurant-dev-mock-context";
import { getOrdersListHref } from "../../lib/nav/ordersListHref";
import type { MockRestaurantOrder } from "../../types/mock-order";

type Phase = "idle" | "wait" | "success" | "error" | "stuck";

export type CheckoutPayFlowBodyProps = {
  restaurantId: string;
  restaurantName: string;
  committedMethod: CheckoutPaymentMethodId;
  totalRub: number;
  lines: RestaurantCartLine[];
  onClose: () => void;
  consumeCheckoutPayScenario: () => DevPayScenario;
  addOrder: (
    o: Omit<MockRestaurantOrder, "id" | "createdAt"> & { id?: string },
  ) => MockRestaurantOrder;
  clearCart: () => void;
};

export function CheckoutPayFlowBody({
  restaurantId,
  restaurantName,
  committedMethod,
  totalRub,
  lines,
  onClose,
  consumeCheckoutPayScenario,
  addOrder,
  clearCart,
}: CheckoutPayFlowBodyProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const scenarioRef = useRef<DevPayScenario>("success");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "wait") {
      return undefined;
    }
    const sc = scenarioRef.current;
    if (sc === "stuck") {
      const t = window.setTimeout(() => setPhase("stuck"), 1200);
      return () => window.clearTimeout(t);
    }
    if (sc === "error") {
      const t = window.setTimeout(() => setPhase("error"), 900);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      const o = addOrder({
        restaurantId,
        restaurantName,
        lines: lines.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          priceRub: l.priceRub,
        })),
        totalRub,
      });
      setOrderId(o.id);
      clearCart();
      setPhase("success");
    }, 1100);
    return () => window.clearTimeout(t);
  }, [
    phase,
    addOrder,
    clearCart,
    lines,
    restaurantId,
    restaurantName,
    totalRub,
  ]);

  const primaryIdleLabel =
    committedMethod === "card"
      ? "Подтвердить оплату"
      : committedMethod === "yandex" || committedMethod === "sber"
        ? "Перейти в приложение"
        : "Готово";

  const startPay = () => {
    scenarioRef.current = consumeCheckoutPayScenario();
    setPhase("wait");
  };

  if (phase === "wait") {
    return (
      <PayOutcomeLayout
        icon={<PayCircleLoader label="Ожидаем ответ банка…" />}
        title="Обработка платежа"
        description="Не закрывайте окно."
        actions={
          <p className="m-0 text-xs [color:var(--ant-color-text-quaternary,rgba(0,0,0,0.35))]">
            {scenarioRef.current === "stuck"
              ? "Долгий ответ…"
              : "Проверяем данные оплаты…"}
          </p>
        }
      />
    );
  }

  if (phase === "stuck") {
    return (
      <PayOutcomeLayout
        icon={<PayCircleLoader label="Нет ответа от банка" />}
        title="Операция зависла"
        description="Попробуйте позже или выберите другой способ оплаты."
        actions={
          <PayPrimaryButton
            onClick={() => {
              setPhase("idle");
              onClose();
            }}
          >
            Закрыть
          </PayPrimaryButton>
        }
      />
    );
  }

  if (phase === "error") {
    return (
      <PayOutcomeLayout
        icon={<PayCircleErrorIcon />}
        title="Оплата не прошла"
        description="Банк отклонил операцию."
        actions={
          <PayPrimaryButton
            onClick={() => {
              setPhase("idle");
              onClose();
            }}
          >
            Вернуться к заказу
          </PayPrimaryButton>
        }
      />
    );
  }

  if (phase === "success" && orderId) {
    return (
      <PayOutcomeLayout
        icon={<PayCircleSuccessIcon />}
        title="Оплата прошла"
        description={`Заказ ${orderId} создан.`}
        actions={
          <PayPrimaryButton
            onClick={() => {
              onClose();
              router.push(getOrdersListHref());
            }}
          >
            Перейти к заказу
          </PayPrimaryButton>
        }
      />
    );
  }

  const idleBody = (() => {
    switch (committedMethod) {
      case "sbp":
        return (
          <div className="flex flex-col gap-4 px-1">
            <p className="m-0 text-sm leading-relaxed [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
              Оплата через СБП ({getPaymentMethodLabel("sbp")}). Отсканируйте QR
              в приложении банка.
            </p>
            <CheckoutSbpQrBlock />
          </div>
        );
      case "card":
        return (
          <p className="m-0 px-1 text-sm leading-relaxed [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            Подтвердите оплату на сумму{" "}
            <span className="font-semibold [font-variant-numeric:tabular-nums]">
              {totalRub} ₽
            </span>{" "}
            банковской картой ({getPaymentMethodLabel("card")}).
          </p>
        );
      case "yandex":
        return (
          <p className="m-0 px-1 text-sm leading-relaxed [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            Перейдите в приложение{" "}
            <span className="font-semibold">Яндекс Пэй</span>, чтобы завершить
            оплату.
          </p>
        );
      case "sber":
        return (
          <p className="m-0 px-1 text-sm leading-relaxed [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            Перейдите в приложение{" "}
            <span className="font-semibold">Сбербанк Онлайн</span>, чтобы
            завершить оплату.
          </p>
        );
      default:
        return null;
    }
  })();

  return (
    <MiddleColumn
      verticalAlign="top"
      maxWidthPx={640}
      className="h-full min-h-0 flex-1"
      innerClassName="box-border flex h-full min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch] py-3">
        {idleBody}
      </div>
      <div className="shrink-0 border-t pt-3 [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)] [padding-bottom:calc(12px+env(safe-area-inset-bottom,0px))]">
        <Button type="primary" size="large" block onClick={startPay}>
          {primaryIdleLabel}
        </Button>
      </div>
    </MiddleColumn>
  );
}
