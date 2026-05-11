import { defaultJetMealDevPaymentProfile } from "./jetMealDevPaymentTypes";
import { SEED_JET_MEAL_DEV_ORDERS } from "./jetMealDevOrdersSeed";
import type { JetMealDevOrder } from "./jetMealDevOrderTypes";

const PREFIX = "jet-meal-dev";

export const JET_MEAL_DEV_STORAGE = {
  payment: `${PREFIX}:payment-v1`,
  orders: `${PREFIX}:orders-v1`,
  dirty: `${PREFIX}:dirty-v1`,
} as const;

export function readJetMealDevJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJetMealDevJson(key: string, value: unknown): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function markJetMealDevMocksDirty(): void {
  writeJetMealDevJson(JET_MEAL_DEV_STORAGE.dirty, true);
}

/**
 * Первый заход в dev: дефолтный профиль оплаты и стартовые заказы.
 * При `dirty` ничего не перезаписываем.
 */
export function ensureJetMealDevStorageDefaults(): void {
  if (typeof window === "undefined") {
    return;
  }
  if (readJetMealDevJson<boolean>(JET_MEAL_DEV_STORAGE.dirty, false)) {
    return;
  }
  if (window.localStorage.getItem(JET_MEAL_DEV_STORAGE.payment) === null) {
    writeJetMealDevJson(
      JET_MEAL_DEV_STORAGE.payment,
      defaultJetMealDevPaymentProfile,
    );
  }
  if (window.localStorage.getItem(JET_MEAL_DEV_STORAGE.orders) === null) {
    writeJetMealDevJson(
      JET_MEAL_DEV_STORAGE.orders,
      SEED_JET_MEAL_DEV_ORDERS,
    );
  }
  if (window.localStorage.getItem(JET_MEAL_DEV_STORAGE.dirty) === null) {
    writeJetMealDevJson(JET_MEAL_DEV_STORAGE.dirty, false);
  }
}

/** Прямое чтение заказов из localStorage (без React-контекста). */
export function readJetMealDevOrdersFromLocalStorage(): JetMealDevOrder[] {
  if (typeof window === "undefined") {
    return [];
  }
  const rows = readJetMealDevJson<JetMealDevOrder[] | null>(
    JET_MEAL_DEV_STORAGE.orders,
    null,
  );
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows;
}
