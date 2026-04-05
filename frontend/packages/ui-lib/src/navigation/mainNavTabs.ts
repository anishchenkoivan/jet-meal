import type { HeaderTab } from "../components/Header/Header";

/** Полные URL вкладок — задаётся сервисом (разные микрофронты / origin). */
export type MainNavUrls = {
  home: string;
  menu: string;
  restaurants: string;
  orders: string;
  account: string;
  business: string;
};

export const MAIN_NAV_KEYS = {
  home: "home",
  menu: "menu",
  restaurants: "restaurants",
  orders: "orders",
  account: "account",
  business: "business",
} as const;

export function createMainNavTabs(urls: MainNavUrls): HeaderTab[] {
  return [
    { key: MAIN_NAV_KEYS.home, label: "Главная", href: urls.home },
    { key: MAIN_NAV_KEYS.menu, label: "Меню", href: urls.menu },
    { key: MAIN_NAV_KEYS.restaurants, label: "Рестораны", href: urls.restaurants },
    { key: MAIN_NAV_KEYS.orders, label: "Заказы", href: urls.orders },
    { key: MAIN_NAV_KEYS.account, label: "Аккаунт", href: urls.account },
    { key: MAIN_NAV_KEYS.business, label: "Бизнесу", href: urls.business },
  ];
}
