/** Список заказов в ЛК (`/my/orders`), не карточка одного заказа. */
export function getOrdersListHref(): string {
  if (typeof process === "undefined") {
    return "/my/orders";
  }
  return process.env["NEXT_PUBLIC_NAV_ORDERS"] ?? "/my/orders";
}
