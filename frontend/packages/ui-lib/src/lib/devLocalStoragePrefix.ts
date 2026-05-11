"use client";

/**
 * Удаляет ключи `localStorage`, начинающиеся с префикса (например `jet-meal-dev`).
 */
export function clearLocalStorageByPrefix(prefix: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const k = window.localStorage.key(i);
    if (k?.startsWith(prefix)) {
      keys.push(k);
    }
  }
  for (const k of keys) {
    window.localStorage.removeItem(k);
  }
}

export const JET_MEAL_DEV_STORAGE_PREFIX = "jet-meal-dev";
