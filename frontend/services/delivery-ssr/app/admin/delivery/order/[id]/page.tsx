import { CourierOrderDetailClient } from "../../../../../src/components/CourierOrderDetail/CourierOrderDetailClient";

export default async function CourierOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourierOrderDetailClient orderId={decodeURIComponent(id)} />;
}
