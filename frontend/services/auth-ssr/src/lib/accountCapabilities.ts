/** Демо-флаг: в cookie `1`, если у аккаунта уже есть рестораны (для `/admin`). */
export const ACCOUNT_HAS_RESTAURANTS_COOKIE = "account-has-restaurants";

/** Демо-флаг: в cookie `1`, если у аккаунта есть заказанная реклама (для `/admin/advert`). */
export const ACCOUNT_HAS_ADS_COOKIE = "account-has-ads";

type CookieGet = {
  get: (name: string) => { value?: string } | undefined;
};

export function readHasOwnedRestaurants(cookies: CookieGet): boolean {
  return cookies.get(ACCOUNT_HAS_RESTAURANTS_COOKIE)?.value === "1";
}

export function readHasOrderedAds(cookies: CookieGet): boolean {
  return cookies.get(ACCOUNT_HAS_ADS_COOKIE)?.value === "1";
}
