export const RESTAURANT_ID_COOKIE = "restaurant-id";
export const SESSION_ID_COOKIE = "session-id";
export const SESSION_EXPIRES_AT_COOKIE = "session-expires-at";

type CookieSource = {
  cookies: { get: (name: string) => { value?: string } | undefined };
};

export function hasValidRestaurantSession(source: CookieSource): boolean {
  const restaurantId = source.cookies.get(RESTAURANT_ID_COOKIE)?.value?.trim();
  const sessionId = source.cookies.get(SESSION_ID_COOKIE)?.value?.trim();
  const expiresAtRaw = source.cookies.get(SESSION_EXPIRES_AT_COOKIE)?.value;

  if (!restaurantId || !sessionId) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw ?? 0);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  return true;
}
