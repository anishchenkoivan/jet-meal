/**
 * Демо-сессия личного кабинета — те же имена cookie, что в auth-ssr
 * (`AccountLoginPanel` / `hasValidAccountSession`).
 */
export const ACCOUNT_LOGIN_COOKIE = "account-login";
export const ACCOUNT_SESSION_ID_COOKIE = "account-session-id";
export const ACCOUNT_SESSION_EXPIRES_COOKIE = "account-session-expires";

function readCookieRaw(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (!part) {
      continue;
    }
    const eq = part.indexOf("=");
    if (eq < 0) {
      continue;
    }
    const k = part.slice(0, eq);
    if (k === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return undefined;
}

export function hasValidAccountSessionInBrowser(): boolean {
  const login = readCookieRaw(ACCOUNT_LOGIN_COOKIE)?.trim();
  const sessionId = readCookieRaw(ACCOUNT_SESSION_ID_COOKIE)?.trim();
  const expiresAtRaw = readCookieRaw(ACCOUNT_SESSION_EXPIRES_COOKIE);
  if (!login || !sessionId) {
    return false;
  }
  const expiresAt = Number(expiresAtRaw ?? 0);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }
  return true;
}

function setCookie(name: string, value: string, maxAgeSec: number) {
  // biome-ignore lint/suspicious/noDocumentCookie: демо-сессия, как в auth-ssr AccountLoginPanel
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; samesite=lax`;
}

/** Записать демо-сессию после успешного входа из формы. */
export function setAccountSessionCookies(login: string): void {
  const sessionId = crypto.randomUUID();
  const maxAgeSec = 60 * 60 * 8;
  const expiresAtMs = Date.now() + maxAgeSec * 1000;
  setCookie(ACCOUNT_LOGIN_COOKIE, login.trim(), maxAgeSec);
  setCookie(ACCOUNT_SESSION_ID_COOKIE, sessionId, maxAgeSec);
  setCookie(ACCOUNT_SESSION_EXPIRES_COOKIE, String(expiresAtMs), maxAgeSec);
}
