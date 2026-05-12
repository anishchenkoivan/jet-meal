import { cookies } from "next/headers";
import {
  ACCOUNT_LOGIN_COOKIE,
  hasValidAccountSession,
  SESSION_EXPIRES_AT_COOKIE,
  SESSION_ID_COOKIE,
} from "./middlewares/authGuard";

export type AccountSession =
  | { ok: false }
  | {
      ok: true;
      login: string;
      sessionId: string;
      expiresAtMs: number;
    };

export async function readAccountSession(): Promise<AccountSession> {
  const cookieStore = await cookies();
  if (!hasValidAccountSession({ cookies: cookieStore })) {
    return { ok: false };
  }
  const login = cookieStore.get(ACCOUNT_LOGIN_COOKIE)?.value?.trim() ?? "";
  const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value ?? "";
  const expiresAtMs = Number(
    cookieStore.get(SESSION_EXPIRES_AT_COOKIE)?.value ?? 0,
  );
  return { ok: true, login, sessionId, expiresAtMs };
}
