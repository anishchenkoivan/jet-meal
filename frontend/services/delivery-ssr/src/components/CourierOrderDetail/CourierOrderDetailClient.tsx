"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { CenteredColumn } from "@jet-meal/ui-lib/src/components/CenteredColumn/CenteredColumn";
import {
  Paragraph,
  Title,
} from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { useJetMealDevMock } from "@jet-meal/ui-lib/src/context/JetMealDevMockContext";
import Link from "next/link";
import { buildDeliveryOrderView } from "../../lib/deliveryOrderMock";
import { DevOrdersHydrateSkeleton } from "../DevOrdersHydrateSkeleton/DevOrdersHydrateSkeleton";
import { OrderNotFoundView } from "../OrderTrackingViews/OrderNotFoundView";

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const when = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function CourierOrderDetailClient({ orderId }: { orderId: string }) {
  const dev = useJetMealDevMock();

  if (dev.isDev && !dev.hydrated) {
    return (
      <div className="mx-auto max-w-[960px] p-6">
        <DevOrdersHydrateSkeleton />
      </div>
    );
  }

  const view = buildDeliveryOrderView(orderId, dev.orders);

  if (view.status === "not_found") {
    return <OrderNotFoundView />;
  }

  const o = view.order;
  const statusLabel =
    view.status === "completed"
      ? "Доставлен"
      : view.status === "in_transit"
        ? "В доставке"
        : "—";

  return (
    <CenteredColumn maxWidthPx={720} className="min-h-0">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button type="text" href="/admin/delivery" className="!px-0">
          ← К кабинету
        </Button>
      </div>
      <Title level={3} style={{ marginTop: 0 }}>
        Заказ {o.number}
      </Title>
      <Paragraph type="secondary" style={{ marginTop: 4 }}>
        Статус: <strong>{statusLabel}</strong>
        {view.status === "in_transit" ? (
          <>
            {" "}
            · ETA ~{view.order.etaMinutes} мин
          </>
        ) : null}
      </Paragraph>

      <div className="mt-4 rounded-xl border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="grid gap-2 text-[15px]">
          <div>
            <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              Ресторан
            </span>
            <div className="font-medium">{o.restaurantName}</div>
          </div>
          <div>
            <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              Адрес клиента
            </span>
            <div className="font-medium">{o.addressLine}</div>
          </div>
          <div>
            <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              Сумма
            </span>
            <div className="font-semibold [font-variant-numeric:tabular-nums]">
              {money.format(o.totalRub)}
            </div>
          </div>
          <div>
            <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              Оформлен
            </span>
            <div>{when.format(new Date(o.placedAt))}</div>
          </div>
          {view.status === "completed" ? (
            <div>
              <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
                Доставлен
              </span>
              <div>
                {when.format(new Date(view.order.deliveredAt))}
              </div>
            </div>
          ) : null}
          {view.status === "in_transit" ? (
            <div>
              <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
                Курьер
              </span>
              <div>{view.order.courierName}</div>
            </div>
          ) : null}
          <div>
            <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))]">
              Состав
            </span>
            <div>
              {view.status === "completed"
                ? view.order.itemsSummary
                : "Данные в маршруте"}
            </div>
          </div>
        </div>
      </div>

      <Paragraph type="secondary" className="!mt-4 !mb-0 text-sm">
        Клиентский трекинг:{" "}
        <Link
          className="[color:var(--ant-color-primary,#1677ff)]"
          href={`/my/order/${encodeURIComponent(o.id)}`}
        >
          /my/order/{o.id}
        </Link>
      </Paragraph>
    </CenteredColumn>
  );
}
