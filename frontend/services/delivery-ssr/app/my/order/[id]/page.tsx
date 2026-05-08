import { getDeliveryOrderView } from "../../../src/lib/deliveryOrderMock";
import { OrderCompletedView } from "../../../src/components/OrderTrackingViews/OrderCompletedView";
import { OrderInTransitView } from "../../../src/components/OrderTrackingViews/OrderInTransitView";
import { OrderNotFoundView } from "../../../src/components/OrderTrackingViews/OrderNotFoundView";

export default async function MyOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = getDeliveryOrderView(decodeURIComponent(id));

  if (view.status === "not_found") {
    return <OrderNotFoundView />;
  }
  if (view.status === "completed") {
    return <OrderCompletedView data={view} />;
  }

  const yandexMapsApiKey = process.env["NEXT_PUBLIC_YANDEX_MAPS_API_KEY"] ?? "";
  return <OrderInTransitView data={view} yandexMapsApiKey={yandexMapsApiKey} />;
}
