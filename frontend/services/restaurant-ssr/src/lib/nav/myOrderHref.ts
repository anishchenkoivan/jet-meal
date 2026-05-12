import { getJetMealMyOrderHref } from "@jet-meal/ui-lib/src/lib/jetMealDev/jetMealDevNavMyOrder";

/** @see getJetMealMyOrderHref */
export function getMyOrderHref(orderId: string): string {
  return getJetMealMyOrderHref(orderId);
}
