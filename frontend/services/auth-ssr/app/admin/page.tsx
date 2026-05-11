import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { hasValidAccountSession } from "../../lib/middlewares/authGuard";
import { AccountPageShell } from "../../src/components/AccountPageShell/AccountPageShell";
import {
  readHasOrderedAds,
  readHasOwnedRestaurants,
} from "../../src/lib/accountCapabilities";

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
    <Link
      key="r"
      href={HREF_RESTAURANTS}
      className="block box-border w-full px-8 py-7 rounded-2xl border border-black/[0.08] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_50%,#fafafa_100%)] no-underline text-inherit shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-[box-shadow,border-color] duration-200 ease hover:border-[#91caff] hover:shadow-[0_8px_32px_rgba(22,119,255,0.12)]"
    >
      <h2 className="m-0 mb-2 text-[1.35rem] font-bold leading-[1.3] text-black/[0.88]">Укажите свой ресторан</h2>
      <p className="m-0 text-base leading-[1.5] text-black/55">
        Подключите заведение к Jet Meal и принимайте заказы онлайн.
      </p>
    </Link>
  );

  const promoDelivery = (
    <Link
      key="d"
      href={HREF_DELIVERY}
      className="block box-border w-full px-8 py-7 rounded-2xl border border-black/[0.08] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_50%,#fafafa_100%)] no-underline text-inherit shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-[box-shadow,border-color] duration-200 ease hover:border-[#91caff] hover:shadow-[0_8px_32px_rgba(22,119,255,0.12)]"
    >
      <h2 className="m-0 mb-2 text-[1.35rem] font-bold leading-[1.3] text-black/[0.88]">Устройтесь в доставку</h2>
      <p className="m-0 text-base leading-[1.5] text-black/55">
        Курьерам и службам доставки — заказы и личный кабинет.
      </p>
    </Link>
  );

  const promoAds = (
    <Link
      key="a"
      href={HREF_ADVERT}
      className="block box-border w-full px-8 py-7 rounded-2xl border border-black/[0.08] bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_50%,#fafafa_100%)] no-underline text-inherit shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-[box-shadow,border-color] duration-200 ease hover:border-[#91caff] hover:shadow-[0_8px_32px_rgba(22,119,255,0.12)]"
    >
      <h2 className="m-0 mb-2 text-[1.35rem] font-bold leading-[1.3] text-black/[0.88]">Реклама на Jet Meal</h2>
      <p className="m-0 text-base leading-[1.5] text-black/55">
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
    <main className="m-0 p-0 min-h-0">
      <AccountPageShell>
        <div className="w-full max-w-[900px] mx-auto">
          <h1 className="m-0 mb-2 text-2xl font-bold">
            Админка
          </h1>
          <p className="m-0 mb-6 text-black/55">
            Быстрые действия и подсказки. Разделы открываются на соответствующих
            сервисах.
          </p>

          {actionItems.length > 0 ? (
            <div className="flex flex-wrap gap-3 mb-7">
              {actionItems.map((a) => (
                <Button key={a.href} href={a.href} type="default" size="large">
                  {a.label}
                </Button>
              ))}
            </div>
          ) : null}

          {promoNodes.length > 0 ? (
            <div className="flex flex-col gap-5 w-full">{promoNodes}</div>
          ) : null}
        </div>
      </AccountPageShell>
    </main>
  );
}
