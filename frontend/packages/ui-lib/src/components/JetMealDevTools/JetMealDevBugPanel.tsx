"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useJetMealDevCart } from "../../context/JetMealDevCartContext";
import { useJetMealDevMock } from "../../context/JetMealDevMockContext";
import {
  clearLocalStorageByPrefix,
  JET_MEAL_DEV_STORAGE_PREFIX,
} from "../../lib/devLocalStoragePrefix";
import { getJetMealMyOrderHref } from "../../lib/jetMealDev/jetMealDevNavMyOrder";
import { Button } from "../Button/Button";
import {
  PayCircleErrorIcon,
  PayCircleLoader,
  PayCircleSuccessIcon,
  PayOutcomeLayout,
  PayPrimaryButton,
} from "./JetMealDevPayFlowScreens";

type BugPayPhase = "menu" | "wait" | "success" | "error" | "stuck";

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      className="rounded-lg border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)]"
      open={defaultOpen}
    >
      <summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
        {title}
      </summary>
      <div className="border-t px-3 py-3 [border-color:var(--ant-color-border-secondary,#f0f0f0)]">
        {children}
      </div>
    </details>
  );
}

export function JetMealDevBugPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dev = useJetMealDevMock();
  const cart = useJetMealDevCart();
  const [yandexId, setYandexId] = useState(dev.payment.yandexAccountId);
  const [sberId, setSberId] = useState(dev.payment.sberAccountId);
  const [payPhase, setPayPhase] = useState<BugPayPhase>("menu");
  const [fakeTarget, setFakeTarget] = useState<"success" | "error" | "stuck">(
    "success",
  );
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const startFake = useCallback((target: "success" | "error" | "stuck") => {
    setFakeTarget(target);
    setPayPhase("wait");
  }, []);

  useEffect(() => {
    if (payPhase !== "wait") {
      return undefined;
    }
    if (fakeTarget === "stuck") {
      const t = window.setTimeout(() => setPayPhase("stuck"), 1400);
      return () => window.clearTimeout(t);
    }
    const ms = fakeTarget === "error" ? 700 : 1100;
    const t = window.setTimeout(() => {
      if (fakeTarget === "error") {
        setPayPhase("error");
        return;
      }
      const lines =
        cart.lines.length > 0
          ? cart.lines.map((l) => ({
              name: l.name,
              quantity: l.quantity,
              priceRub: l.priceRub,
            }))
          : [{ name: "Тестовая позиция (жук)", quantity: 1, priceRub: 100 }];
      const totalRub =
        cart.totalRub > 0
          ? cart.totalRub
          : lines.reduce((s, l) => s + l.priceRub * l.quantity, 0);
      const rid = cart.restaurantId ?? "burg";
      const rname = cart.restaurantName ?? "Бургер-плейс";
      const o = dev.addOrder({
        restaurantId: rid,
        restaurantName: rname,
        lines,
        totalRub,
      });
      setSuccessOrderId(o.id);
      setPayPhase("success");
    }, ms);
    return () => window.clearTimeout(t);
  }, [
    payPhase,
    fakeTarget,
    cart.lines,
    cart.totalRub,
    cart.restaurantId,
    cart.restaurantName,
    dev,
  ]);

  const saveBindings = useCallback(() => {
    dev.setPaymentProfile({
      yandexAccountId: yandexId.trim(),
      sberAccountId: sberId.trim(),
      yandexLinked: yandexId.trim().length > 0,
      sberLinked: sberId.trim().length > 0,
    });
  }, [dev, yandexId, sberId]);

  const markCardSaved = useCallback(() => {
    dev.setPaymentProfile({ cardSaved: true });
  }, [dev]);

  if (payPhase === "wait") {
    return (
      <PayOutcomeLayout
        icon={<PayCircleLoader label="Ожидаем ответ банка…" />}
        title="Обработка платежа"
        description="Пожалуйста, не закрывайте окно."
        actions={
          fakeTarget === "stuck" ? (
            <PayPrimaryButton onClick={() => setPayPhase("menu")}>
              Отменить ожидание
            </PayPrimaryButton>
          ) : (
            <p className="m-0 text-xs [color:var(--ant-color-text-quaternary,rgba(0,0,0,0.35))]">
              Имитация задержки сети…
            </p>
          )
        }
      />
    );
  }

  if (payPhase === "stuck") {
    return (
      <PayOutcomeLayout
        icon={<PayCircleLoader label="Нет ответа от процессинга" />}
        title="Зависшая операция"
        description="Такое бывает при сбоях. В тесте можно прервать и вернуться."
        actions={
          <PayPrimaryButton onClick={() => setPayPhase("menu")}>
            Прервать
          </PayPrimaryButton>
        }
      />
    );
  }

  if (payPhase === "error") {
    return (
      <PayOutcomeLayout
        icon={<PayCircleErrorIcon />}
        title="Оплата не прошла"
        description="Банк отклонил операцию (имитация в dev)."
        actions={
          <PayPrimaryButton
            onClick={() => {
              setPayPhase("menu");
              onClose();
            }}
          >
            Вернуться к заказу
          </PayPrimaryButton>
        }
      />
    );
  }

  if (payPhase === "success" && successOrderId) {
    return (
      <PayOutcomeLayout
        icon={<PayCircleSuccessIcon />}
        title="Оплата прошла"
        description="Заказ создан из dev-сценария и сохранён в локальный список."
        actions={
          <PayPrimaryButton
            onClick={() => {
              onClose();
              router.push(getJetMealMyOrderHref(successOrderId));
            }}
          >
            Перейти к заказу
          </PayPrimaryButton>
        }
      />
    );
  }

  return (
    <div className="flex max-h-[min(72vh,640px)] flex-col gap-3 overflow-y-auto px-1 pb-2 [-webkit-overflow-scrolling:touch]">
      <div className="rounded-lg border px-3 py-3 [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-layout,#fafafa)]">
        <p className="m-0 mb-2 text-xs leading-relaxed [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
          Полная очистка всех ключей{" "}
          <code className="text-[11px]">{JET_MEAL_DEV_STORAGE_PREFIX}:*</code>{" "}
          (ресторан, доставка, чекаут). После перезагрузки снова подставятся
          дефолты.
        </p>
        <Button
          danger
          size="small"
          onClick={() => {
            clearLocalStorageByPrefix(JET_MEAL_DEV_STORAGE_PREFIX);
            window.location.reload();
          }}
        >
          Очистить весь dev localStorage и перезагрузить
        </Button>
      </div>

      <p className="m-0 text-xs leading-relaxed [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
        Только в NODE_ENV=development. Профиль оплаты и заказы — в{" "}
        <code className="text-[11px]">localStorage</code>; один набор данных для
        ресторана, доставки и админки.
      </p>

      <Section title="Банковские данные (мок)" defaultOpen>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]">
            Яндекс Пэй — идентификатор / телефон (не пустой = привязано)
            <input
              value={yandexId}
              onChange={(e) => setYandexId(e.target.value)}
              className="box-border h-9 rounded-md border px-2 text-sm [border-color:var(--ant-color-border,#d9d9d9)]"
              placeholder="+7… или yandex_id"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]">
            Сбер — идентификатор (не пустой = привязано)
            <input
              value={sberId}
              onChange={(e) => setSberId(e.target.value)}
              className="box-border h-9 rounded-md border px-2 text-sm [border-color:var(--ant-color-border,#d9d9d9)]"
              placeholder="phone / sber_id"
            />
          </label>
          <Button type="primary" size="small" onClick={saveBindings}>
            Сохранить привязки
          </Button>
          <Button size="small" onClick={markCardSaved}>
            Отметить карту сохранённой (как после чекаута)
          </Button>
        </div>
      </Section>

      <Section title="Следующая оплата с чекаута" defaultOpen>
        <p className="mt-0 mb-2 text-xs [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
          Влияет на кнопку в дровере «Оплатить» на странице оформления (один
          раз, затем снова «успех»).
        </p>
        <div className="flex flex-col gap-2">
          <Button
            size="small"
            onClick={() => dev.setNextCheckoutPayScenario("success")}
          >
            Успех
          </Button>
          <Button
            size="small"
            danger
            onClick={() => dev.setNextCheckoutPayScenario("error")}
          >
            Ошибка
          </Button>
          <Button
            size="small"
            onClick={() => dev.setNextCheckoutPayScenario("stuck")}
          >
            Зависание
          </Button>
        </div>
      </Section>

      <Section title="Фейковые оплаты">
        <div className="flex flex-col gap-2">
          <Button type="primary" onClick={() => startFake("success")}>
            Оплатить (успех)
          </Button>
          <Button danger onClick={() => startFake("error")}>
            Оплатить с ошибкой
          </Button>
          <Button onClick={() => startFake("stuck")}>Зависшая операция</Button>
        </div>
      </Section>

      <Section title="Каталог и рестораны">
        <p className="m-0 text-xs leading-relaxed [color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
          Полные моки меню и карточек заведений живут в сервисе ресторанов
          (исходники <code className="text-[11px]">mockCatalogItems</code>,{" "}
          <code className="text-[11px]">mockRestaurants</code>). Здесь общий
          dev-слой: оплата и заказы в{" "}
          <code className="text-[11px]">localStorage</code>.
        </p>
      </Section>

      <Section title={`Заказы (${dev.orders.length})`} defaultOpen>
        {dev.orders.length === 0 ? (
          <p className="m-0 text-sm [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
            Пока пусто — проведите оплату из чекаута или «Оплатить (успех)»
            выше.
          </p>
        ) : (
          <ul className="m-0 list-none space-y-2 p-0">
            {dev.orders.map((o) => (
              <li
                key={o.id}
                className="rounded-md border px-2 py-2 text-xs [border-color:var(--ant-color-border-secondary,#f0f0f0)]"
              >
                <span className="font-semibold">{o.id}</span> —{" "}
                {o.restaurantName} — {o.totalRub} ₽
                <button
                  type="button"
                  className="ml-2 border-none bg-transparent p-0 text-[var(--ant-color-primary,#1677ff)] underline"
                  onClick={() => router.push(getJetMealMyOrderHref(o.id))}
                >
                  открыть
                </button>
              </li>
            ))}
          </ul>
        )}
        <Button
          className="mt-2"
          size="small"
          danger
          onClick={() => {
            dev.resetDevData();
            setYandexId("");
            setSberId("");
          }}
        >
          Сбросить профиль и заказы
        </Button>
      </Section>
    </div>
  );
}
