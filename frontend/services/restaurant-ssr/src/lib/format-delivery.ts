/** Подпись «среднее время доставки» для карточек (моки). */
export function formatAverageDelivery(minutes?: number): string | undefined {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) {
    return undefined;
  }
  const m = Math.round(minutes);
  return `в среднем ${m} мин`;
}
