import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Statistic } from "@jet-meal/ui-lib/src/components/Statistic/Statistic";
import {
  Paragraph,
  Title,
} from "@jet-meal/ui-lib/src/components/Typography/Typography";
import type { DeliveryOrderCompleted } from "../../lib/deliveryOrderMock";

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const when = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function OrderCompletedView({ data }: { data: DeliveryOrderCompleted }) {
  const { order } = data;
  const reviewHref = `/my/order/${order.id}#review`;
  const tipsHref = `/my/order/${order.id}#tips`;

  return (
    <div className="flex flex-col gap-4 pb-2">
      <Title level={2} style={{ marginTop: 0 }}>
        Заказ доставлен
      </Title>
      <Paragraph type="secondary">
        Спасибо, что выбрали Jet Meal. Ниже краткая сводка — при необходимости
        оставьте отзыв или поблагодарите курьера.
      </Paragraph>

      <div className="[background:var(--ant-color-bg-container,#fff)] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Title level={4} style={{ marginTop: 0 }}>
          Заказ {order.number}
        </Title>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
          <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))] min-w-[120px]">
            Ресторан
          </span>
          <span>{order.restaurantName}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
          <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))] min-w-[120px]">
            Адрес
          </span>
          <span>{order.addressLine}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
          <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))] min-w-[120px]">
            Состав
          </span>
          <span>{order.itemsSummary}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
          <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))] min-w-[120px]">
            Оформлен
          </span>
          <span>{when.format(new Date(order.placedAt))}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
          <span className="[color:var(--ant-color-text-secondary,rgba(0,0,0,0.55))] min-w-[120px]">
            Доставлен
          </span>
          <span>{when.format(new Date(order.deliveredAt))}</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <Statistic title="Сумма" value={money.format(order.totalRub)} />
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <Button type="primary" size="large" href={reviewHref}>
            Оставить отзыв
          </Button>
          <Button size="large" href={tipsHref}>
            Чаевые курьеру
          </Button>
        </div>
      </div>
    </div>
  );
}
