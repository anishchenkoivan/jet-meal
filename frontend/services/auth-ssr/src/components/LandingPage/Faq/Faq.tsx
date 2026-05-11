"use client";

import { Collapse } from "antd";

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
    <section className="box-border w-full max-w-[min(1120px,100%)] mx-auto px-6 pb-16">
      <h2 className="m-0 mb-2 text-[1.75rem] font-bold tracking-[-0.02em]">Вопросы и ответы</h2>
      <p className="m-0 mb-8 text-black/55 max-w-[640px]">Коротко о сервисе — без воды.</p>
      <div className="w-full max-w-none m-0 [&_.ant-collapse]:w-full [&_.ant-collapse-item]:w-full [&_.ant-collapse-content-box]:w-full [&_.ant-collapse-content-box]:box-border">
        <Collapse bordered={false} items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
