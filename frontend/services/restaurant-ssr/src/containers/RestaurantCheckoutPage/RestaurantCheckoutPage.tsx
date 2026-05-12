"use client";

import { Button } from "@jet-meal/ui-lib/src/components/Button/Button";
import { CheckoutAddressEditor } from "@jet-meal/ui-lib/src/components/CheckoutDelivery/CheckoutAddressEditor";
import { useCheckoutAddress } from "@jet-meal/ui-lib/src/components/CheckoutDelivery/useCheckoutAddress";
import {
  type CheckoutPaymentMethodId,
  CheckoutPaymentMethods,
  CheckoutPaymentMethodTiles,
} from "@jet-meal/ui-lib/src/components/CheckoutPaymentMethods/CheckoutPaymentMethods";
import { useDrawer } from "@jet-meal/ui-lib/src/components/DrawerProvider/DrawerProvider";
import { MiddleColumn } from "@jet-meal/ui-lib/src/components/MiddleColumn/MiddleColumn";
import { StickyAsidePanel } from "@jet-meal/ui-lib/src/components/StickyAsidePanel/StickyAsidePanel";
import { PageContentShell } from "@jet-meal/ui-lib/src/containers/PageContentShell/PageContentShell";
import { PageTwoColumnSticky } from "@jet-meal/ui-lib/src/containers/PageTwoColumnSticky/PageTwoColumnSticky";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckoutPayFlowBody } from "../../components/checkout/CheckoutPayFlowBody";
import { RESTAURANT_CART_INLINE_MIN_PX } from "../../components/RestaurantCartMobileNav/RestaurantCartMobileNav";
import { useRestaurantCart } from "../../context/restaurant-cart-context";
import { useRestaurantDevMock } from "../../context/restaurant-dev-mock-context";
import type { Restaurant } from "../../types/restaurant";

export type RestaurantCheckoutPageProps = {
  restaurant: Restaurant;
};

const CHECKOUT_ADDRESS_DRAWER_ID = "checkout-address";
const CHECKOUT_PAYMENT_DRAWER_ID = "checkout-payment";
const CHECKOUT_PAY_FLOW_DRAWER_ID = "checkout-pay-flow";

function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61a.75.75 0 0 1-.373.2l-3.5.75a.75.75 0 0 1-.88-.88l.75-3.5a.75.75 0 0 1 .2-.373l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.9 3.661l1.439 1.439 1.173-1.173a.25.25 0 0 0 0-.354l-1.085-1.086ZM11.28 6.16 9.84 4.72 3.16 11.4l-.545 2.545 2.545-.545L11.28 6.16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckoutDrawerFrame({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-1 border-b px-1 py-2 [border-color:var(--ant-color-border-secondary,#f0f0f0)]">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-lg [color:var(--ant-color-text,rgba(0,0,0,0.88))] [-webkit-tap-highlight-color:transparent] hover:[background:var(--ant-color-fill-secondary,rgba(0,0,0,0.06))]"
          aria-label="Назад"
        >
          ←
        </button>
        <span className="min-w-0 flex-1 truncate pr-2 text-base font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
          {title}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function CheckoutPaymentMobileBody({
  initialMethod,
  onCommit,
  onDismiss,
  yandexPayLinked,
  sberPayLinked,
  cardMockSaved,
}: {
  initialMethod: CheckoutPaymentMethodId;
  onCommit: (m: CheckoutPaymentMethodId) => void;
  onDismiss: () => void;
  yandexPayLinked: boolean;
  sberPayLinked: boolean;
  cardMockSaved: boolean;
}) {
  const [draftMethod, setDraftMethod] = useState(initialMethod);
  return (
    <CheckoutPaymentMethods
      activeMethod={draftMethod}
      onActiveMethodChange={setDraftMethod}
      yandexPayLinked={yandexPayLinked}
      sberPayLinked={sberPayLinked}
      cardMockSaved={cardMockSaved}
      tilesDensity="relaxed"
      paymentFooter={{
        onConfirm: () => onCommit(draftMethod),
        onCancel: onDismiss,
      }}
    />
  );
}

export function RestaurantCheckoutPage({
  restaurant,
}: RestaurantCheckoutPageProps) {
  const router = useRouter();
  const { open, close } = useDrawer();
  const dev = useRestaurantDevMock();
  const {
    lines,
    totalCount,
    totalRub,
    setPageRestaurant,
    setCheckoutHref,
    setRecommendations,
    clearCart,
  } = useRestaurantCart();

  const addr = useCheckoutAddress();
  const [committedMethod, setCommittedMethod] =
    useState<CheckoutPaymentMethodId>("sbp");
  const paymentSessionIdRef = useRef(0);
  const [wideTwoColumn, setWideTwoColumn] = useState(false);
  const [checkoutAside, setCheckoutAside] = useState<
    "address" | "payment" | null
  >(null);
  const [paymentAsideSession, setPaymentAsideSession] = useState(0);
  const [paymentAsideInitial, setPaymentAsideInitial] =
    useState<CheckoutPaymentMethodId>("sbp");

  const deliveryFeeRub = 0;

  const yandexKey =
    typeof process !== "undefined"
      ? (process.env["NEXT_PUBLIC_YANDEX_MAPS_API_KEY"] ?? "")
      : "";

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

  useEffect(() => {
    const mq = window.matchMedia(
      `(min-width: ${RESTAURANT_CART_INLINE_MIN_PX}px)`,
    );
    const sync = () => setWideTwoColumn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!wideTwoColumn) {
      setCheckoutAside(null);
    }
  }, [wideTwoColumn]);

  const closeCheckoutAside = useCallback(() => {
    setCheckoutAside(null);
  }, []);

  const openAddress = useCallback(() => {
    addr.seedForOpen();
    if (wideTwoColumn) {
      setCheckoutAside("address");
      return;
    }
    open(
      CHECKOUT_ADDRESS_DRAWER_ID,
      () => (
        <CheckoutDrawerFrame title="Адрес доставки" onBack={close}>
          <MiddleColumn
            verticalAlign="top"
            maxWidthPx={640}
            className="h-full min-h-0"
            innerClassName="box-border flex h-full min-h-0 flex-1 flex-col overflow-hidden pt-2 [padding-bottom:calc(12px+env(safe-area-inset-bottom,0px))]"
          >
            <CheckoutAddressEditor
              yandexMapsApiKey={yandexKey}
              model={addr}
              onCancel={close}
              onSave={close}
            />
          </MiddleColumn>
        </CheckoutDrawerFrame>
      ),
      { replace: true },
    );
  }, [addr, yandexKey, open, close, wideTwoColumn]);

  const openPaymentDrawer = useCallback(
    (clickedMethod: CheckoutPaymentMethodId) => {
      paymentSessionIdRef.current += 1;
      const sessionKey = paymentSessionIdRef.current;
      open(
        CHECKOUT_PAYMENT_DRAWER_ID,
        () => (
          <CheckoutDrawerFrame title="Способ оплаты" onBack={close}>
            <MiddleColumn
              verticalAlign="top"
              maxWidthPx={640}
              className="h-full min-h-0"
              innerClassName="box-border flex h-full min-h-0 flex-1 flex-col overflow-hidden"
            >
              <CheckoutPaymentMobileBody
                key={sessionKey}
                initialMethod={clickedMethod}
                yandexPayLinked={dev.payment.yandexLinked}
                sberPayLinked={dev.payment.sberLinked}
                cardMockSaved={dev.payment.cardSaved}
                onCommit={(m) => {
                  setCommittedMethod(m);
                  if (m === "card") {
                    dev.setPaymentProfile({ cardSaved: true });
                  }
                  close();
                }}
                onDismiss={close}
              />
            </MiddleColumn>
          </CheckoutDrawerFrame>
        ),
        { replace: true },
      );
    },
    [open, close, dev],
  );

  const openPayFlowDrawer = useCallback(() => {
    open(
      CHECKOUT_PAY_FLOW_DRAWER_ID,
      () => (
        <CheckoutDrawerFrame title="Оплата" onBack={close}>
          <CheckoutPayFlowBody
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            committedMethod={committedMethod}
            totalRub={totalRub}
            lines={lines}
            onClose={close}
            consumeCheckoutPayScenario={dev.consumeCheckoutPayScenario}
            addOrder={dev.addOrder}
            clearCart={clearCart}
          />
        </CheckoutDrawerFrame>
      ),
      { replace: true, persistentModal: true },
    );
  }, [
    open,
    close,
    restaurant.id,
    restaurant.name,
    committedMethod,
    totalRub,
    lines,
    dev,
    clearCart,
  ]);

  const onPaymentTileClick = useCallback(
    (method: CheckoutPaymentMethodId) => {
      if (wideTwoColumn) {
        setPaymentAsideInitial(method);
        setPaymentAsideSession((s) => s + 1);
        setCheckoutAside("payment");
        return;
      }
      openPaymentDrawer(method);
    },
    [wideTwoColumn, openPaymentDrawer],
  );

  if (totalCount === 0) {
    return null;
  }

  const displayAddress = addr.lastAddress?.label || addr.addressLine || null;

  const deliveryFeeLabel =
    deliveryFeeRub <= 0 ? "Бесплатно" : `${deliveryFeeRub} ₽`;

  const mainColumn = (
    <div className="mx-auto mt-2 flex w-full max-w-[min(720px,100%)] flex-col gap-6">
      <h1 className="m-0 text-[clamp(1.35rem,4.2vw,1.95rem)] font-bold leading-[1.2] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
        {restaurant.name}
      </h1>

      <section
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--ant-border-radius-lg,10px)] border [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)] px-5 py-4"
        aria-label="Состав заказа"
      >
        <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
          <div className="flex flex-col divide-y [divide-color:var(--ant-color-border-secondary,#f0f0f0)]">
            {lines.map((l) => {
              const lineTotal = l.priceRub * l.quantity;
              return (
                <div
                  key={l.lineId}
                  className="grid [grid-template-columns:1fr_auto] items-baseline gap-x-4 py-3 text-[15px] leading-[1.4]"
                >
                  <div className="min-w-0">
                    <p className="m-0 [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
                      {l.name}
                    </p>
                    <p className="mb-0 mt-1 text-sm [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
                      {l.priceRub} ₽ × {l.quantity}
                    </p>
                  </div>
                  <p className="m-0 whitespace-nowrap font-semibold [font-variant-numeric:tabular-nums] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
                    {lineTotal} ₽
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t py-3.5 [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)]">
          <span className="text-[15px] font-medium [color:var(--ant-color-text-secondary,rgba(0,0,0,0.65))]">
            Доставка
          </span>
          <span className="text-[15px] font-semibold [font-variant-numeric:tabular-nums] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            {deliveryFeeLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t py-3.5 [border-color:var(--ant-color-border-secondary,#f0f0f0)] [background:var(--ant-color-bg-container,#fff)]">
          <span className="text-base font-semibold [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            Итого
          </span>
          <span className="text-lg font-bold [font-variant-numeric:tabular-nums] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            {totalRub} ₽
          </span>
        </div>
      </section>

      {displayAddress ? (
        <button
          type="button"
          className="group flex w-full cursor-pointer items-center gap-3 rounded-[var(--ant-border-radius-lg,8px)] border border-transparent px-1 py-2 text-left transition-colors hover:[background:var(--ant-color-fill-quaternary,#fafafa)]"
          onClick={openAddress}
          aria-label="Изменить адрес"
        >
          <span className="flex-shrink-0 whitespace-nowrap text-[15px] [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))]">
            Доставим сюда:
          </span>
          <span className="min-w-0 flex-1 truncate text-[15px] [color:var(--ant-color-text,rgba(0,0,0,0.88))]">
            {displayAddress}
          </span>
          <span className="flex-shrink-0 opacity-0 transition-opacity [color:var(--ant-color-text-secondary,rgba(0,0,0,0.45))] group-hover:opacity-60">
            <PencilIcon />
          </span>
        </button>
      ) : (
        <button
          type="button"
          className="h-12 w-full cursor-pointer rounded-[var(--ant-border-radius,8px)] border border-solid text-[15px] font-semibold [border-color:var(--ant-color-border,#d9d9d9)] [background:var(--ant-color-bg-container,#fff)] [color:var(--ant-color-text,rgba(0,0,0,0.88))] transition-all hover:[border-color:var(--ant-color-primary,#1677ff)] hover:[color:var(--ant-color-primary,#1677ff)]"
          onClick={openAddress}
        >
          Указать адрес
        </button>
      )}

      <CheckoutPaymentMethodTiles
        variant="muted"
        density="relaxed"
        value={committedMethod}
        onChange={(id) => onPaymentTileClick(id)}
      />

      <Button
        type="primary"
        size="large"
        className="!h-12 !w-full !text-base"
        disabled={totalCount === 0}
        onClick={openPayFlowDrawer}
      >
        Оплатить {totalRub} ₽
      </Button>
    </div>
  );

  /** Правая колонка чекаута: без шапки «назад + заголовок» и без лишних полей — как раньше. */
  const addressAsideBody = (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CheckoutAddressEditor
        yandexMapsApiKey={yandexKey}
        model={addr}
        onCancel={closeCheckoutAside}
        onSave={closeCheckoutAside}
      />
    </div>
  );

  const paymentAsideBody = (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CheckoutPaymentMobileBody
        key={paymentAsideSession}
        initialMethod={paymentAsideInitial}
        yandexPayLinked={dev.payment.yandexLinked}
        sberPayLinked={dev.payment.sberLinked}
        cardMockSaved={dev.payment.cardSaved}
        onCommit={(m) => {
          setCommittedMethod(m);
          if (m === "card") {
            dev.setPaymentProfile({ cardSaved: true });
          }
          closeCheckoutAside();
        }}
        onDismiss={closeCheckoutAside}
      />
    </div>
  );

  const checkoutAsidePanelClass = "p-2";

  const checkoutSide =
    checkoutAside === "address" ? (
      <StickyAsidePanel
        ariaLabel="Адрес доставки"
        className={checkoutAsidePanelClass}
      >
        {addressAsideBody}
      </StickyAsidePanel>
    ) : checkoutAside === "payment" ? (
      <StickyAsidePanel
        ariaLabel="Способ оплаты"
        className={checkoutAsidePanelClass}
      >
        {paymentAsideBody}
      </StickyAsidePanel>
    ) : null;

  return (
    <PageContentShell className="min-h-0 flex-1 overflow-hidden">
      <PageTwoColumnSticky
        includeSideSlot
        sideSlotPosition="end"
        main={mainColumn}
        side={checkoutSide}
      />
    </PageContentShell>
  );
}
