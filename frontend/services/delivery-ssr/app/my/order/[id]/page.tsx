import { MyOrderPageClient } from "./MyOrderPageClient";

export default async function MyOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const yandexMapsApiKey = process.env["NEXT_PUBLIC_YANDEX_MAPS_API_KEY"] ?? "";
  return (
    <MyOrderPageClient
      orderId={decodeURIComponent(id)}
      yandexMapsApiKey={yandexMapsApiKey}
    />
  );
}
