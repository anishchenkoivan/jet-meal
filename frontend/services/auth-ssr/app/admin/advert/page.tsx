import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasValidAccountSession } from "../../../lib/middlewares/authGuard";
import { AccountPageShell } from "../../../src/components/AccountPageShell/AccountPageShell";
import { readHasOrderedAds } from "../../../src/lib/accountCapabilities";

function adsContactEmail(): string {
  return process.env["NEXT_PUBLIC_ADS_CONTACT_EMAIL"] ?? "ads@jet-meal.example";
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
    <main className="m-0 p-0 min-h-0 w-full">
      <AccountPageShell>
        <div className="w-full max-w-[1100px] mx-auto">
          <Link href="/admin" className="inline-block mb-4 text-[0.9rem] text-[#1677ff] no-underline hover:underline">
            ← Назад в админку
          </Link>

          <div className="mb-7">
            <h1 className="m-0 mb-2 text-[1.5rem] font-bold">
              {hasAds ? "Ваша реклама" : "Реклама на Jet Meal"}
            </h1>
            <p className="m-0 max-w-[52rem] leading-[1.55] text-black/55">
              Размещение баннеров и спецблоков на сайте Jet Meal и в связанных
              сервисах (каталог, уведомления, кабинеты). Это не продвижение
              карточки ресторана — отдельный рекламный инвентарь для брендов и
              партнёров.
            </p>
          </div>

          {!hasAds ? (
            <div className="box-border w-full max-w-[40rem] px-7 py-6 rounded-2xl border border-black/[0.08] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_50%,#fafafa_100%)] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <h2 className="m-0 mb-3 text-[1.15rem] font-bold">Заказать размещение</h2>
              <p className="m-0 mb-4 leading-[1.55] text-black/65">
                Расскажите о целях кампании, желаемых сроках и формате — мы
                пришлём медиакит с актуальными пакетами, ориентировочной ценой и
                схемой оплаты. После согласования и оплаты кампания появится в
                этом разделе.
              </p>
              <a className="text-[1.05rem] font-semibold text-[#1677ff] no-underline break-all hover:underline" href={`mailto:${email}`}>
                {email}
              </a>
            </div>
          ) : (
            <section className="flex flex-col gap-4 w-full" aria-label="Активные кампании">
              {DEMO_CAMPAIGNS.map((c) => (
                <article key={c.id} className="box-border w-full px-[22px] py-5 rounded-[14px] border border-black/[0.08] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-3">
                    <h2 className="m-0 text-[1.1rem] font-bold">{c.title}</h2>
                    <span
                      className={
                        c.status === "active"
                          ? "text-[0.85rem] font-semibold px-[10px] py-0.5 rounded-[999px] bg-[rgba(82,196,26,0.12)] text-[#389e0d]"
                          : "text-[0.85rem] font-semibold px-[10px] py-0.5 rounded-[999px] bg-[rgba(22,119,255,0.12)] text-[#1677ff]"
                      }
                    >
                      {c.status === "active" ? "Активна" : "Запланирована"}
                    </span>
                  </div>
                  <dl className="grid [grid-template-columns:repeat(auto-fill,minmax(11rem,1fr))] gap-x-5 gap-y-2.5 m-0 text-[0.9rem] leading-[1.45] text-black/65">
                    <div>
                      <dt className="m-0 text-black/45 font-medium">Формат</dt>
                      <dd className="m-0 font-semibold text-black/[0.78]">{c.format}</dd>
                    </div>
                    <div>
                      <dt className="m-0 text-black/45 font-medium">Площадка</dt>
                      <dd className="m-0 font-semibold text-black/[0.78]">{c.placement}</dd>
                    </div>
                    <div>
                      <dt className="m-0 text-black/45 font-medium">Стоимость</dt>
                      <dd className="m-0 font-semibold text-black/[0.78]">
                        {c.priceRub.toLocaleString("ru-RU")} ₽ (с НДС по счёту)
                      </dd>
                    </div>
                    <div>
                      <dt className="m-0 text-black/45 font-medium">Часы показа</dt>
                      <dd className="m-0 font-semibold text-black/[0.78]">{c.displayHours.toLocaleString("ru-RU")} ч</dd>
                    </div>
                    <div>
                      <dt className="m-0 text-black/45 font-medium">Охват (оценка)</dt>
                      <dd className="m-0 font-semibold text-black/[0.78]">{c.estimatedImpressions}</dd>
                    </div>
                    <div>
                      <dt className="m-0 text-black/45 font-medium">Период</dt>
                      <dd className="m-0 font-semibold text-black/[0.78]">{c.period}</dd>
                    </div>
                  </dl>
                  <p className="mt-[14px] mb-0 text-[0.88rem] leading-[1.5] text-black/55">
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
