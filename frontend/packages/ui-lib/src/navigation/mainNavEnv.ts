import type { MainNavUrls } from "./mainNavTabs";

export function getMainNavUrlsFromPublicEnv(
  env: Record<string, string | undefined> =
    typeof process !== "undefined" && process.env
      ? (process.env as Record<string, string | undefined>)
      : {},
): MainNavUrls {
  return {
    home: env["NEXT_PUBLIC_NAV_HOME"] ?? "/",
    catalog:
      env["NEXT_PUBLIC_NAV_CATALOG"] ??
      env["NEXT_PUBLIC_NAV_MENU"] ??
      "/catalog",
    restaurants: env["NEXT_PUBLIC_NAV_RESTAURANTS"] ?? "/restaurants",
    orders: env["NEXT_PUBLIC_NAV_ORDERS"] ?? "/my/orders",
    account: env["NEXT_PUBLIC_NAV_ACCOUNT"] ?? "/my",
    business: env["NEXT_PUBLIC_NAV_BUSINESS"] ?? "/admin",
    businessRestaurants:
      env["NEXT_PUBLIC_NAV_BUSINESS_RESTAURANTS"] ?? "/admin/restaurants",
    businessDelivery:
      env["NEXT_PUBLIC_NAV_BUSINESS_DELIVERY"] ?? "/admin/delivery",
    businessAds: env["NEXT_PUBLIC_NAV_BUSINESS_ADS"] ?? "/admin/advert",
  };
}

export function getLogoHrefFromPublicEnv(
  env: Record<string, string | undefined> =
    typeof process !== "undefined" && process.env
      ? (process.env as Record<string, string | undefined>)
      : {},
): string {
  return env["NEXT_PUBLIC_NAV_HOME"] ?? "/";
}
