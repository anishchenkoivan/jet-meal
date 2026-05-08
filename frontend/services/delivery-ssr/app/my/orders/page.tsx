import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { Title, Paragraph } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { Tag } from "@jet-meal/ui-lib/src/components/Tag/Tag";
import { listDemoOrders } from "../../../src/lib/deliveryOrderMock";
import styles from "./page.module.css";

export default function MyOrdersPage() {
  const rows = listDemoOrders();

  return (
    <div className={styles["wrap"]}>
      <Title level={2} className={styles["title"]}>
        Мои заказы
      </Title>
      <Paragraph type="secondary" className={styles["lead"]}>
        История и статусы заказов. Сейчас показаны демо-позиции до подключения API.
      </Paragraph>
      <ul className={styles["list"]}>
        {rows.map((row) => (
          <li key={row.id} className={styles["card"]}>
            <div className={styles["cardTop"]}>
              <span className={styles["orderNo"]}>{row.number}</span>
              <Tag color={row.stateLabel === "В пути" ? "processing" : "success"}>
                {row.stateLabel}
              </Tag>
            </div>
            <p className={styles["summary"]}>{row.summary}</p>
            <Button type="link" href={`/my/order/${row.id}`} className={styles["detailLink"]}>
              Подробнее
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
