export type DayRange = { from: number; to: number } | null;

export type CourierScheduleTemplate = "4x8" | "5x8" | "7x5" | "free";

export type CourierSchedulePersist = {
  template: CourierScheduleTemplate;
  ranges: DayRange[];
};

export const COURIER_SCHEDULE_PERSIST_KEY =
  "jet-meal-courier-schedule-persist.v1";

export function templateContractLabel(t: CourierScheduleTemplate): string {
  if (t === "4x8") {
    return "4 дня по 8 часов";
  }
  if (t === "5x8") {
    return "5 дней по 8 часов";
  }
  if (t === "7x5") {
    return "7 дней по 5 часов";
  }
  return "Свободный график";
}
