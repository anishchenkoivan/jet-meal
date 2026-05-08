import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasValidAccountSession } from "../../../lib/middlewares/authGuard";
import { readHasOrderedAds } from "../../../src/lib/accountCapabilities";
import { AccountPageShell } from "../../../src/components/AccountPageShell/AccountPageShell";
import styles from "./page.module.css";

function adsContactEmail(): string {
  return (
    process.env["NEXT_PUBLIC_ADS_CONTACT_EMAIL"] ?? "ads@jet-meal.example"
  );
}

type DemoCampaign = {
  id: string;
  title: string;
  status: "active" | "planned";
  format: string;
  placement: string;
  priceRub: number;
  displayHours: number;
  estimatedImpressions: string;
  period: string;
  notes: string;
};

const DEMO_CAMPAIGNS: DemoCampaign[] = [
  {
    id: "1",
    title: "Главный баннер каталога",
    status: "active",
    format: "970×120 px, статика или лёгкая анимация",
    placement: "Верх страницы каталога и листинга ресторанов",
    priceRub: 45000,
    displayHours: 720,
    estimatedImpressions: "~180 000 показов",
    period: "01.04.2026 — 30.04.2026",
    notes:
      "Оплата по счёту, макет не позднее чем за 3 рабочих дня до старта. Модерация по правилам площадки.",
  },
  {
    id: "2",
    title: "Спецблок «Рекомендуем» в приложении",
    status: "planned",
    format: "Карточка 1:1 + короткий текст до 90 символов",
    placement: "Лента рекомендаций в веб и мобильном веб",
    priceRub: 28000,
    displayHours: 336,
    estimatedImpressions: "~95 000 показов",
    period: "15.05.2026 — 28.05.2026",
    notes:
      "Таргет по городу и сегменту аудитории. После оплаты вы получите слот и техтребования к макету.",
  },
  {
    id: "3",
    title: "Нативная строка в письмах сервиса",
    status: "planned",
    format: "Текст + логотип, до 120 символов",
    placement: "Футер транзакционных писем (заказ, статус доставки)",
    priceRub: 12000,
    displayHours: 168,
    estimatedImpressions: "~40 000 доставок",
    period: "01.06.2026 — 07.06.2026",
    notes:
      "Подходит для акций и бренда. Не конкурирует с карточками ресторанов — это отдельный рекламный инвентарь.",
  },
];

export default async function AdminAdvertPage() {
  const cookieStore = await cookies();
  if (!hasValidAccountSession({ cookies: cookieStore })) {
    redirect("/my");
  }

  const hasAds = readHasOrderedAds(cookieStore);
  const email = adsContactEmail();

  return (
    <main className={styles["main"]}>
      <AccountPageShell>
        <div style={{ width: "100%", maxWidth: 1100, marginInline: "auto" }}>
          <Link href="/admin" className={styles["back"]}>
            ← Назад в админку
          </Link>

          <div className={styles["top"]}>
            <h1 className={styles["title"]}>
              {hasAds ? "Ваша реклама" : "Реклама на Jet Meal"}
            </h1>
            <p className={styles["lead"]}>
              Размещение баннеров и спецблоков на сайте Jet Meal и в связанных
              сервисах (каталог, уведомления, кабинеты). Это не продвижение
              карточки ресторана — отдельный рекламный инвентарь для брендов и
              партнёров.
            </p>
          </div>

          {!hasAds ? (
            <div className={styles["emptyBox"]}>
              <h2 className={styles["emptyTitle"]}>
                Заказать размещение
              </h2>
              <p className={styles["emptyText"]}>
                Расскажите о целях кампании, желаемых сроках и формате — мы
                пришлём медиакит с актуальными пакетами, ориентировочной ценой и
                схемой оплаты. После согласования и оплаты кампания появится в
                этом разделе.
              </p>
              <a className={styles["mail"]} href={`mailto:${email}`}>
                {email}
              </a>
            </div>
          ) : (
            <section className={styles["cards"]} aria-label="Активные кампании">
              {DEMO_CAMPAIGNS.map((c) => (
                <article key={c.id} className={styles["card"]}>
                  <div className={styles["cardHead"]}>
                    <h2 className={styles["cardTitle"]}>{c.title}</h2>
                    <span
                      className={
                        c.status === "active"
                          ? styles["status"]
                          : `${styles["status"]} ${styles["statusPlanned"]}`
                      }
                    >
                      {c.status === "active" ? "Активна" : "Запланирована"}
                    </span>
                  </div>
                  <dl className={styles["grid"]}>
                    <div>
                      <dt>Формат</dt>
                      <dd>{c.format}</dd>
                    </div>
                    <div>
                      <dt>Площадка</dt>
                      <dd>{c.placement}</dd>
                    </div>
                    <div>
                      <dt>Стоимость</dt>
                      <dd>
                        {c.priceRub.toLocaleString("ru-RU")} ₽ (с НДС по счёту)
                      </dd>
                    </div>
                    <div>
                      <dt>Часы показа</dt>
                      <dd>{c.displayHours.toLocaleString("ru-RU")} ч</dd>
                    </div>
                    <div>
                      <dt>Охват (оценка)</dt>
                      <dd>{c.estimatedImpressions}</dd>
                    </div>
                    <div>
                      <dt>Период</dt>
                      <dd>{c.period}</dd>
                    </div>
                  </dl>
                  <p
                    style={{
                      margin: "14px 0 0",
                      fontSize: "0.88rem",
                      lineHeight: 1.5,
                      color: "rgba(0,0,0,0.55)",
                    }}
                  >
                    {c.notes}
                  </p>
                </article>
              ))}
            </section>
          )}
        </div>
      </AccountPageShell>
    </main>
  );
}
