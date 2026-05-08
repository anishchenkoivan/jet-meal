import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Statistic } from "@jet-meal/ui-lib/src/components/Statistic/Statistic";
import { Title, Paragraph } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import type { DeliveryOrderCompleted } from "../../lib/deliveryOrderMock";
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

export function OrderCompletedView({ data }: { data: DeliveryOrderCompleted }) {
  const { order } = data;
  const reviewHref = `/my/order/${order.id}#review`;
  const tipsHref = `/my/order/${order.id}#tips`;

  return (
    <div className={`${styles["wrap"]} ${styles["wide"]}`}>
      <Title level={2} style={{ marginTop: 0 }}>
        Заказ доставлен
      </Title>
      <Paragraph type="secondary">
        Спасибо, что выбрали Jet Meal. Ниже краткая сводка — при необходимости оставьте отзыв или
        поблагодарите курьера.
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
          <span className={styles["label"]}>Состав</span>
          <span>{order.itemsSummary}</span>
        </div>
        <div className={styles["row"]}>
          <span className={styles["label"]}>Оформлен</span>
          <span>{when.format(new Date(order.placedAt))}</span>
        </div>
        <div className={styles["row"]}>
          <span className={styles["label"]}>Доставлен</span>
          <span>{when.format(new Date(order.deliveredAt))}</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <Statistic title="Сумма" value={money.format(order.totalRub)} />
        </div>

        <div className={styles["actions"]}>
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
