/**
 * URL страницы заказа в сервисе delivery (`/my/order/[id]`).
 * `NEXT_PUBLIC_NAV_MY_ORDER_BASE` — при другом origin доставки.
 */
export function getJetMealMyOrderHref(orderId: string): string {
  const id = encodeURIComponent(orderId);
  if (typeof process === "undefined") {
    return `/my/order/${id}`;
  }
  const base = process.env["NEXT_PUBLIC_NAV_MY_ORDER_BASE"] ?? "/my/order";
  return `${base.replace(/\/$/, "")}/${id}`;
}
