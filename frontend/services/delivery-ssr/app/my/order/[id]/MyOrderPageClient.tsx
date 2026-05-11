"use client";

import { CenteredColumn } from "@jet-meal/ui-lib/src/components/CenteredColumn/CenteredColumn";
import { useJetMealDevMock } from "@jet-meal/ui-lib/src/context/JetMealDevMockContext";
import type { ReactNode } from "react";
import { DevOrdersHydrateSkeleton } from "../../../../src/components/DevOrdersHydrateSkeleton/DevOrdersHydrateSkeleton";
import { OrderCompletedView } from "../../../../src/components/OrderTrackingViews/OrderCompletedView";
import { OrderInTransitView } from "../../../../src/components/OrderTrackingViews/OrderInTransitView";
import { OrderNotFoundView } from "../../../../src/components/OrderTrackingViews/OrderNotFoundView";
import { buildDeliveryOrderView } from "../../../../src/lib/deliveryOrderMock";

export function MyOrderPageClient({
  orderId,
  yandexMapsApiKey,
}: {
  orderId: string;
  yandexMapsApiKey: string;
}) {
  const dev = useJetMealDevMock();

  if (dev.isDev && !dev.hydrated) {
    return (
      <main className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <CenteredColumn maxWidthPx={960}>
          <DevOrdersHydrateSkeleton />
        </CenteredColumn>
      </main>
    );
  }

  const view = buildDeliveryOrderView(orderId, dev.orders);

  let body: ReactNode;
  if (view.status === "not_found") {
    body = <OrderNotFoundView />;
  } else if (view.status === "completed") {
    body = <OrderCompletedView data={view} />;
  } else {
    body = (
      <OrderInTransitView data={view} yandexMapsApiKey={yandexMapsApiKey} />
    );
  }

  return (
    <main className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0">
      <CenteredColumn maxWidthPx={960}>{body}</CenteredColumn>
    </main>
  );
}
