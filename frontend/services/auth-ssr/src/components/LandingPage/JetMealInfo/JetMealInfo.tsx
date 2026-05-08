"use client";

import {
  ClockCircleOutlined,
  CoffeeOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import cx from "classnames";
import styles from "./JetMealInfo.module.css";

export function JetMealInfo() {
  return (
    <section className={cx(styles.section)}>
      <h2 className={cx(styles.sectionTitle)}>Почему Jet Meal</h2>
      <p className={cx(styles.sectionLead)}>
        Мы соединяем кухни города с вашим столом: прозрачные цены, понятный
        статус заказа и забота о качестве на каждом этапе.
      </p>
      <div className={cx(styles.grid)}>
        <article className={cx(styles.featureCard)}>
          <div className={cx(styles.featureIcon)}>
            <ThunderboltOutlined />
          </div>
          <h3 className={cx(styles.featureTitle)}>Быстрый старт</h3>
          <p className={cx(styles.featureText)}>
            Один аккаунт — сохранённые адреса и любимые рестораны всегда под
            рукой.
          </p>
        </article>
        <article className={cx(styles.featureCard)}>
          <div className={cx(styles.featureIcon)}>
            <CoffeeOutlined />
          </div>
          <h3 className={cx(styles.featureTitle)}>Разнообразие меню</h3>
          <p className={cx(styles.featureText)}>
            От завтраков до поздних ужинов — фильтры по кухне, цене и времени
            приготовления.
          </p>
        </article>
        <article className={cx(styles.featureCard)}>
          <div className={cx(styles.featureIcon)}>
            <ClockCircleOutlined />
          </div>
          <h3 className={cx(styles.featureTitle)}>Понятное время</h3>
          <p className={cx(styles.featureText)}>
            Оценка доставки обновляется по мере готовности — меньше сюрпризов в
            ожидании.
          </p>
        </article>
        <article className={cx(styles.featureCard)}>
          <div className={cx(styles.featureIcon)}>
            <SafetyCertificateOutlined />
          </div>
          <h3 className={cx(styles.featureTitle)}>Надёжная оплата</h3>
          <p className={cx(styles.featureText)}>
            Современные способы оплаты и поддержка, если что-то пошло не так с
            заказом.
          </p>
        </article>
      </div>
    </section>
  );
}
