import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Statistic } from "@jet-meal/ui-lib/src/components/Statistic/Statistic";
import {
  Paragraph,
  Title,
} from "@jet-meal/ui-lib/src/components/Typography/Typography";
import type { DeliveryOrderInTransit } from "../../lib/deliveryOrderMock";
import { YandexDeliveryTrackingMap } from "../YandexDeliveryTrackingMap/YandexDeliveryTrackingMap";

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const when = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function OrderInTransitView({
  data,
  yandexMapsApiKey,
}: {
  data: DeliveryOrderInTransit;
  yandexMapsApiKey: string;
}) {
  const { order, route } = data;

  return (
    <div className="flex flex-col gap-4 pb-2">
      <Title level={2} style={{ marginTop: 0 }}>
        Заказ в пути
      </Title>
      <Paragraph type="secondary">
        Курьер <strong>{order.courierName}</strong> везёт заказ по маршруту
        ниже. Ориентировочное время — около {order.etaMinutes} мин.
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
            Оформлен
          </span>
          <span>{when.format(new Date(order.placedAt))}</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <Statistic title="Сумма" value={money.format(order.totalRub)} />
        </div>

        <div className="mt-5">
          <YandexDeliveryTrackingMap
            apiKey={yandexMapsApiKey}
            pickup={route.pickup}
            dropoff={route.dropoff}
            courier={route.courier}
          />
        </div>

        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Точное положение курьера обновляется на карте. Связь с курьером из
          приложения — в следующих версиях.
        </Paragraph>
        <div className="flex flex-wrap gap-3 mt-5">
          <Button type="link" href="/my/orders">
            Мои заказы
          </Button>
        </div>
      </div>
    </div>
  );
}
