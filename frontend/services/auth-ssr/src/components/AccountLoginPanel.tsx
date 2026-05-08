"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  type AuthFormValues,
  type AuthMode,
  AuthPage,
} from "../../../../packages/ui-lib/src/components/AuthPage/AuthPage";
import {
  ACCOUNT_LOGIN_COOKIE,
  SESSION_EXPIRES_AT_COOKIE,
  SESSION_ID_COOKIE,
} from "../../lib/middlewares/authGuard";

function setCookie(name: string, value: string, maxAgeSec: number) {
  // biome-ignore lint/suspicious/noDocumentCookie: демо-сессия в cookie, как в restaurant login
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; samesite=lax`;
}

export function AccountLoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = searchParams.get("register") === "1";

  return (
    <AuthPage
      key={register ? "register" : "login"}
      title="Вход в аккаунт"
      registerTitle="Регистрация"
      verifyEmailTitle="Введите код из письма"
      initialMode={register ? "register" : "login"}
      onSubmit={async (_mode: AuthMode, values: AuthFormValues) => {
        const sessionId = crypto.randomUUID();
        const maxAgeSec = 60 * 60 * 8;
        const expiresAtMs = Date.now() + maxAgeSec * 1000;

        setCookie(ACCOUNT_LOGIN_COOKIE, values.login.trim(), maxAgeSec);
        setCookie(SESSION_ID_COOKIE, sessionId, maxAgeSec);
        setCookie(SESSION_EXPIRES_AT_COOKIE, String(expiresAtMs), maxAgeSec);

        router.push("/my");
        router.refresh();
      }}
    />
  );
}
