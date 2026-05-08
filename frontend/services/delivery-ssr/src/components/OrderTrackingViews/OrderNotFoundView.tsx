import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Title, Paragraph } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import styles from "./orderTracking.module.css";

export function OrderNotFoundView() {
  return (
    <div className={styles["wrap"]}>
      <div className={styles["panel"]}>
        <Title level={3} className={styles["lead"]}>
          Заказ не найден
        </Title>
        <Paragraph type="secondary">
          Проверьте ссылку или номер заказа. Если вы перешли из письма, запросите новое письмо в
          поддержке.
        </Paragraph>
        <div className={styles["actions"]}>
          <Button type="primary" href="/my/orders">
            К моим заказам
          </Button>
          <Button type="default" href="/">
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
