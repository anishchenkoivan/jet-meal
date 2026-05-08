"use client";

import { Collapse } from "antd";
import cx from "classnames";
import styles from "./Faq.module.css";

const FAQ_ITEMS = [
  {
    key: "1",
    label: "Как оформить первый заказ?",
    children:
      "Зарегистрируйтесь в аккаунте, выберите ресторан и блюда в корзину — дальше шаги оплаты и доставки подскажут сами.",
  },
  {
    key: "2",
    label: "Как быстро привезут?",
    children:
      "Срок зависит от района и загрузки кухни. После оформления вы увидите ориентировочное окно — оно обновится, если ситуация на дороге изменится.",
  },
  {
    key: "3",
    label: "Можно ли изменить заказ после оплаты?",
    children:
      "Пока курьер не выехал, напишите в поддержку из карточки заказа — передадим правки ресторану, если это ещё возможно.",
  },
  {
    key: "4",
    label: "Есть ли программа лояльности?",
    children:
      "Бонусы и персональные предложения появятся в разделе «Аккаунт» — заглядывайте туда после пары заказов.",
  },
];

export function Faq() {
  return (
    <section className={cx(styles.section)}>
      <h2 className={cx(styles.sectionTitle)}>Вопросы и ответы</h2>
      <p className={cx(styles.sectionLead)}>
        Коротко о сервисе — без воды.
      </p>
      <div className={cx(styles.faq)}>
        <Collapse bordered={false} items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
