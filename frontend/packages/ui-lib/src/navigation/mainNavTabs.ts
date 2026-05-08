import type { HeaderTab } from "../components/Header/Header";

export type MainNavUrls = {
  home: string;
  catalog: string;
  restaurants: string;
  orders: string;
  account: string;
  business: string;
  businessRestaurants: string;
  businessDelivery: string;
  businessAds: string;
};

export const MAIN_NAV_KEYS = {
  home: "home",
  catalog: "catalog",
  restaurants: "restaurants",
  orders: "orders",
  account: "account",
  business: "business",
  businessRestaurants: "business-restaurants",
  businessDelivery: "business-delivery",
  businessAds: "business-ads",
} as const;

export function createMainNavTabs(urls: MainNavUrls): HeaderTab[] {
  return [
    { key: MAIN_NAV_KEYS.home, label: "Главная", href: urls.home },
    { key: MAIN_NAV_KEYS.catalog, label: "Каталог", href: urls.catalog },
    { key: MAIN_NAV_KEYS.restaurants, label: "Рестораны", href: urls.restaurants },
    { key: MAIN_NAV_KEYS.orders, label: "Заказы", href: urls.orders },
    { key: MAIN_NAV_KEYS.account, label: "Аккаунт", href: urls.account },
    {
      key: MAIN_NAV_KEYS.business,
      label: "Бизнесу",
      href: urls.business,
      dividerBefore: true,
      submenu: [
        {
          key: MAIN_NAV_KEYS.businessRestaurants,
          label: "Ресторанам",
          href: urls.businessRestaurants,
        },
        {
          key: MAIN_NAV_KEYS.businessDelivery,
          label: "Курьерам",
          href: urls.businessDelivery,
        },
        {
          key: MAIN_NAV_KEYS.businessAds,
          label: "Рекламодателям",
          href: urls.businessAds,
        },
      ],
    },
  ];
}
