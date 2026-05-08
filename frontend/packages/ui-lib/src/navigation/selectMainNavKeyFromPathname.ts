import { MAIN_NAV_KEYS } from "./mainNavTabs";

export function selectMainNavKeyFromPathname(pathname: string | null): string {
  if (!pathname || pathname === "/") {
    return MAIN_NAV_KEYS.home;
  }
  if (pathname.startsWith("/account")) {
    return MAIN_NAV_KEYS.account;
  }
  if (pathname.startsWith("/catalog")) {
    return MAIN_NAV_KEYS.catalog;
  }
  if (
    pathname.startsWith("/restaurants") ||
    pathname.startsWith("/restaurant")
  ) {
    return MAIN_NAV_KEYS.restaurants;
  }
  if (
    pathname.startsWith("/my/orders") ||
    pathname.startsWith("/my/order/")
  ) {
    return MAIN_NAV_KEYS.orders;
  }
  if (pathname.startsWith("/my")) {
    return MAIN_NAV_KEYS.account;
  }
  if (
    pathname.startsWith("/admin/restaurants") ||
    pathname.startsWith("/admin/restaurant") ||
    pathname.startsWith("/business/restaurants")
  ) {
    return MAIN_NAV_KEYS.businessRestaurants;
  }
  if (
    pathname.startsWith("/admin/delivery") ||
    pathname.startsWith("/admin/courier") ||
    pathname.startsWith("/business/delivery")
  ) {
    return MAIN_NAV_KEYS.businessDelivery;
  }
  if (
    pathname.startsWith("/admin/advert") ||
    pathname.startsWith("/business/ads")
  ) {
    return MAIN_NAV_KEYS.businessAds;
  }
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/business")
  ) {
    return MAIN_NAV_KEYS.business;
  }
  return MAIN_NAV_KEYS.home;
}
