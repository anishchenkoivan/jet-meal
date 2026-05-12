export type CheckoutPaymentMethodId = "sbp" | "card" | "yandex" | "sber";

export const CHECKOUT_PAYMENT_METHODS: {
  id: CheckoutPaymentMethodId;
  label: string;
  emoji: string;
}[] = [
  { id: "sbp", label: "СБП", emoji: "⚡" },
  { id: "card", label: "Картой", emoji: "💳" },
  { id: "yandex", label: "Яндекс Пэй", emoji: "Я" },
  { id: "sber", label: "СберPay", emoji: "С" },
];

export function getPaymentMethodLabel(id: CheckoutPaymentMethodId): string {
  return CHECKOUT_PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}
