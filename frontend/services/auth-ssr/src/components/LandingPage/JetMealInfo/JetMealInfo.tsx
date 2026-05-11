"use client";

import {
  ClockCircleOutlined,
  CoffeeOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

export function JetMealInfo() {
  return (
    <section className="box-border w-full max-w-[960px] mx-auto px-6 py-16">
      <h2 className="m-0 mb-2 text-[1.75rem] font-bold tracking-[-0.02em]">
        Почему Jet Meal
      </h2>
      <p className="m-0 mb-8 text-black/55 max-w-[560px]">
        Мы соединяем кухни города с вашим столом: прозрачные цены, понятный
        статус заказа и забота о качестве на каждом этапе.
      </p>
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        <article className="p-[22px] rounded-[14px] bg-white border border-black/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="text-[28px] mb-2.5 leading-none">
            <ThunderboltOutlined />
          </div>
          <h3 className="m-0 mb-2 text-[1.05rem] font-semibold">
            Быстрый старт
          </h3>
          <p className="m-0 text-black/55 text-sm leading-[1.55]">
            Один аккаунт — сохранённые адреса и любимые рестораны всегда под
            рукой.
          </p>
        </article>
        <article className="p-[22px] rounded-[14px] bg-white border border-black/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="text-[28px] mb-2.5 leading-none">
            <CoffeeOutlined />
          </div>
          <h3 className="m-0 mb-2 text-[1.05rem] font-semibold">
            Разнообразие меню
          </h3>
          <p className="m-0 text-black/55 text-sm leading-[1.55]">
            От завтраков до поздних ужинов — фильтры по кухне, цене и времени
            приготовления.
          </p>
        </article>
        <article className="p-[22px] rounded-[14px] bg-white border border-black/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="text-[28px] mb-2.5 leading-none">
            <ClockCircleOutlined />
          </div>
          <h3 className="m-0 mb-2 text-[1.05rem] font-semibold">
            Понятное время
          </h3>
          <p className="m-0 text-black/55 text-sm leading-[1.55]">
            Оценка доставки обновляется по мере готовности — меньше сюрпризов в
            ожидании.
          </p>
        </article>
        <article className="p-[22px] rounded-[14px] bg-white border border-black/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="text-[28px] mb-2.5 leading-none">
            <SafetyCertificateOutlined />
          </div>
          <h3 className="m-0 mb-2 text-[1.05rem] font-semibold">
            Надёжная оплата
          </h3>
          <p className="m-0 text-black/55 text-sm leading-[1.55]">
            Современные способы оплаты и поддержка, если что-то пошло не так с
            заказом.
          </p>
        </article>
      </div>
    </section>
  );
}
