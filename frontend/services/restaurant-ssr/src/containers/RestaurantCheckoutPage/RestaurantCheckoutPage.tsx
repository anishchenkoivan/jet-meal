"use client";

import { CheckoutAddressEditor } from "@jet-meal/ui-lib/src/components/CheckoutDelivery/CheckoutAddressEditor";
import { useCheckoutAddress } from "@jet-meal/ui-lib/src/components/CheckoutDelivery/useCheckoutAddress";
import { CheckoutPaymentMethods } from "@jet-meal/ui-lib/src/components/CheckoutPaymentMethods/CheckoutPaymentMethods";
import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { MobileDrawer } from "@jet-meal/ui-lib/src/components/MobileDrawer/MobileDrawer";
import { Typography } from "@jet-meal/ui-lib/src/components/Typography/Typography";
import { PageContentShell } from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
import { PageTwoColumnSticky } from "@jet-meal/ui-lib/src/containers/PageTwoColumnSticky/PageTwoColumnSticky";
import { StickyAsidePanel } from "@jet-meal/ui-lib/src/components/StickyAsidePanel/StickyAsidePanel";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import type { Restaurant } from "../../types/restaurant";
import drawerBodyStyles from "../../components/RestaurantMobileDrawerHost/RestaurantMobileDrawerHost.module.css";
import checkoutStyles from "./RestaurantCheckoutPage.module.css";

const INLINE_CART_MIN_PX = 992;

export type RestaurantCheckoutPageProps = {
  restaurant: Restaurant;
};

export function RestaurantCheckoutPage({ restaurant }: RestaurantCheckoutPageProps) {
  const router = useRouter();
  const {
    lines,
    totalCount,
    totalRub,
    setPageRestaurant,
    setCheckoutHref,
    setRecommendations,
  } = useRestaurantCart();

  const addr = useCheckoutAddress();
  const [addressOpen, setAddressOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);

  const yandexKey =
    typeof process !== "undefined"
      ? (process.env["NEXT_PUBLIC_YANDEX_MAPS_API_KEY"] ?? "")
      : "";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mq = window.matchMedia(`(max-width: ${INLINE_CART_MIN_PX - 1}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (totalCount === 0) {
      router.replace(`/restaurant/${restaurant.id}`);
    }
  }, [totalCount, restaurant.id, router]);

  useEffect(() => {
    setPageRestaurant(restaurant.id, restaurant.name);
    setCheckoutHref(`/restaurant/${restaurant.id}/checkout`);
    return () => {
      setPageRestaurant(null, null);
      setCheckoutHref(null);
      setRecommendations([]);
    };
  }, [
    restaurant.id,
    restaurant.name,
    setPageRestaurant,
    setCheckoutHref,
    setRecommendations,
  ]);

  const openAddress = useCallback(() => {
    addr.seedForOpen();
    setAddressOpen(true);
  }, [addr]);

  const closeAddress = useCallback(() => {
    setAddressOpen(false);
  }, []);

  if (totalCount === 0) {
    return null;
  }

  const showDesktopAside = !narrow && addressOpen;

  const addressAside = (
    <StickyAsidePanel
      ariaLabel="Адрес доставки"
      className={checkoutStyles["checkoutAddressAside"]}
    >
      <Typography.Title level={4} style={{ margin: "0 0 12px", fontSize: 16 }}>
        Доставим сюда:
      </Typography.Title>
      <CheckoutAddressEditor
        yandexMapsApiKey={yandexKey}
        model={addr}
        onCancel={closeAddress}
        onSave={closeAddress}
      />
    </StickyAsidePanel>
  );

  return (
    <PageContentShell>
      <PageTwoColumnSticky
        includeSideSlot={showDesktopAside}
        sideSlotPosition="end"
        main={
          <>
            <Typography.Title
              level={1}
              style={{ marginBottom: 8, fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
            >
              {restaurant.name}
            </Typography.Title>

            <section className={checkoutStyles["linesSection"]} aria-label="Состав заказа">
              <Typography.Title
                level={5}
                className={checkoutStyles["linesTitle"]}
                style={{ marginTop: 0, marginBottom: 12 }}
              >
                Заказ
              </Typography.Title>
              {lines.map((l) => {
                const lineTotal = l.priceRub * l.quantity;
                return (
                  <div key={l.lineId} className={checkoutStyles["lineRow"]}>
                    <div className={checkoutStyles["lineCell"]}>
                      <p className={checkoutStyles["lineName"]}>{l.name}</p>
                      <p className={checkoutStyles["lineMeta"]}>
                        {l.priceRub} ₽ × {l.quantity}
                      </p>
                    </div>
                    <p className={checkoutStyles["lineTotal"]}>{lineTotal} ₽</p>
                  </div>
                );
              })}
            </section>

            <Typography.Text type="secondary" className={checkoutStyles["totalBlock"]}>
              К оплате: <strong style={{ color: "inherit" }}>{totalRub} ₽</strong>
            </Typography.Text>

            <p className={checkoutStyles["addrLine"]}>Адрес доставки не выбран</p>
            <Typography.Paragraph style={{ marginBottom: 16 }}>
              <Button type="default" size="large" onClick={openAddress}>
                Указать адрес
              </Button>
            </Typography.Paragraph>

            <CheckoutPaymentMethods />
          </>
        }
        side={showDesktopAside ? addressAside : undefined}
      />

      {narrow ? (
        <MobileDrawer
          open={addressOpen}
          onClose={closeAddress}
          topOffsetPx={68}
          title="Доставим сюда:"
          closable={false}
          destroyOnClose
          bodyClassName={drawerBodyStyles["cartBody"]}
        >
          <CheckoutAddressEditor
            yandexMapsApiKey={yandexKey}
            model={addr}
            onCancel={closeAddress}
            onSave={closeAddress}
          />
        </MobileDrawer>
      ) : null}
    </PageContentShell>
  );
}
