import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Statistic } from "@jet-meal/ui-lib/src/components/Statistic/Statistic";
import { Title, Paragraph } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import type { DeliveryOrderInTransit } from "../../lib/deliveryOrderMock";
import { YandexDeliveryTrackingMap } from "../YandexDeliveryTrackingMap/YandexDeliveryTrackingMap";
import styles from "./orderTracking.module.css";

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
    <div className={`${styles["wrap"]} ${styles["wide"]}`}>
      <Title level={2} style={{ marginTop: 0 }}>
        Заказ в пути
      </Title>
      <Paragraph type="secondary">
        Курьер <strong>{order.courierName}</strong> везёт заказ по маршруту ниже. Ориентировочное
        время — около {order.etaMinutes} мин.
      </Paragraph>

      <div className={styles["panel"]}>
        <Title level={4} style={{ marginTop: 0 }}>
          Заказ {order.number}
        </Title>
        <div className={styles["row"]}>
          <span className={styles["label"]}>Ресторан</span>
          <span>{order.restaurantName}</span>
        </div>
        <div className={styles["row"]}>
          <span className={styles["label"]}>Адрес</span>
          <span>{order.addressLine}</span>
        </div>
        <div className={styles["row"]}>
          <span className={styles["label"]}>Оформлен</span>
          <span>{when.format(new Date(order.placedAt))}</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <Statistic title="Сумма" value={money.format(order.totalRub)} />
        </div>

        <div className={styles["mapBlock"]}>
          <YandexDeliveryTrackingMap
            apiKey={yandexMapsApiKey}
            pickup={route.pickup}
            dropoff={route.dropoff}
            courier={route.courier}
          />
        </div>

        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Точное положение курьера обновляется на карте. Связь с курьером из приложения — в
          следующих версиях.
        </Paragraph>
        <div className={styles["actions"]}>
          <Button type="link" href="/my/orders">
            Мои заказы
          </Button>
        </div>
      </div>
    </div>
  );
}
