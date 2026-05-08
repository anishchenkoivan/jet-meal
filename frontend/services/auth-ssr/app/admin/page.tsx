import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { hasValidAccountSession } from "../../lib/middlewares/authGuard";
import {
  readHasOwnedRestaurants,
  readHasOrderedAds,
} from "../../src/lib/accountCapabilities";
import { AccountPageShell } from "../../src/components/AccountPageShell/AccountPageShell";
import styles from "./page.module.css";

const HREF_RESTAURANTS = "/admin/restaurants";
const HREF_DELIVERY = "/admin/delivery";
const HREF_ADVERT = "/admin/advert";

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  if (!hasValidAccountSession({ cookies: cookieStore })) {
    redirect("/my");
  }

  const hasRestaurants = readHasOwnedRestaurants(cookieStore);
  const hasAds = readHasOrderedAds(cookieStore);

  const actionItems: { href: string; label: string }[] = [];
  if (hasRestaurants) {
    actionItems.push({
      href: HREF_RESTAURANTS,
      label: "Управление ресторанами",
    });
  }
  actionItems.push(
    { href: HREF_ADVERT, label: "Управление рекламой" },
    { href: HREF_DELIVERY, label: "Кабинет доставки" },
  );

  const promoRestaurant = hasRestaurants ? null : (
    <Link key="r" href={HREF_RESTAURANTS} className={styles["promoCard"]}>
      <h2 className={styles["promoTitle"]}>Укажите свой ресторан</h2>
      <p className={styles["promoLead"]}>
        Подключите заведение к Jet Meal и принимайте заказы онлайн.
      </p>
    </Link>
  );

  const promoDelivery = (
    <Link key="d" href={HREF_DELIVERY} className={styles["promoCard"]}>
      <h2 className={styles["promoTitle"]}>Устройтесь в доставку</h2>
      <p className={styles["promoLead"]}>
        Курьерам и службам доставки — заказы и личный кабинет.
      </p>
    </Link>
  );

  const promoAds = (
    <Link key="a" href={HREF_ADVERT} className={styles["promoCard"]}>
      <h2 className={styles["promoTitle"]}>Реклама на Jet Meal</h2>
      <p className={styles["promoLead"]}>
        {hasAds
          ? "Баннеры и спецразмещения на сайте и в сервисах — откройте кабинет."
          : "Баннеры и спецразмещения на сайте и в сервисах — свяжитесь с нами или откройте кабинет."}
      </p>
    </Link>
  );

  const promoNodes = [promoRestaurant, promoDelivery, promoAds].filter(
    (n): n is ReactElement => n != null,
  );

  return (
    <main className={styles["main"]}>
      <AccountPageShell>
        <div style={{ width: "100%", maxWidth: 900, marginInline: "auto" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontWeight: 700 }}>
            Админка
          </h1>
          <p style={{ margin: "0 0 24px", color: "rgba(0,0,0,0.55)" }}>
            Быстрые действия и подсказки. Разделы открываются на соответствующих
            сервисах.
          </p>

          {actionItems.length > 0 ? (
            <div className={styles["actions"]}>
              {actionItems.map((a) => (
                <Button key={a.href} href={a.href} type="default" size="large">
                  {a.label}
                </Button>
              ))}
            </div>
          ) : null}

          {promoNodes.length > 0 ? (
            <div className={styles["promoGrid"]}>{promoNodes}</div>
          ) : null}
        </div>
      </AccountPageShell>
    </main>
  );
}
