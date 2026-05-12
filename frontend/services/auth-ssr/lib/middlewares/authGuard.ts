/** Имена cookie совпадают по смыслу с restaurant login; префикс account- чтобы не пересекаться с сессией ресторана на одном домене. */
export const ACCOUNT_LOGIN_COOKIE = "account-login";
export const SESSION_ID_COOKIE = "account-session-id";
export const SESSION_EXPIRES_AT_COOKIE = "account-session-expires";

type CookieSource = {
  cookies: { get: (name: string) => { value?: string } | undefined };
};

export function hasValidAccountSession(source: CookieSource): boolean {
  const login = source.cookies.get(ACCOUNT_LOGIN_COOKIE)?.value?.trim();
  const sessionId = source.cookies.get(SESSION_ID_COOKIE)?.value?.trim();
  const expiresAtRaw = source.cookies.get(SESSION_EXPIRES_AT_COOKIE)?.value;

  if (!login || !sessionId) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw ?? 0);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  return true;
}
