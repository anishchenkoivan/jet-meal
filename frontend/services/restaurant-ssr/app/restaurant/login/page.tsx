"use client";

import { useRouter } from "next/navigation";
import {
  RestaurantAuthForm,
  type RestaurantAuthFormValues,
  type RestaurantAuthMode,
} from "../../../../../packages/ui-lib/src/components/RestaurantAuthPage/RestaurantAuthPage";
import {
  RESTAURANT_ID_COOKIE,
  SESSION_EXPIRES_AT_COOKIE,
  SESSION_ID_COOKIE,
} from "../../../lib/middlewares/authGuard";
import cx from "classnames";
import styles from "./page.module.css";

function setCookie(name: string, value: string, maxAgeSec: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; samesite=lax`;
}

export default function RestaurantLoginPage() {
  const router = useRouter();

  return (
    <main className={cx(styles["main"])}>
      <RestaurantAuthForm
        title="Авторизация ресторана"
        onSubmit={async (_mode: RestaurantAuthMode, values: RestaurantAuthFormValues) => {
          const sessionId = crypto.randomUUID();
          const maxAgeSec = 60 * 60 * 8;
          const expiresAtMs = Date.now() + maxAgeSec * 1000;

          setCookie(RESTAURANT_ID_COOKIE, values.login.trim(), maxAgeSec);
          setCookie(SESSION_ID_COOKIE, sessionId, maxAgeSec);
          setCookie(SESSION_EXPIRES_AT_COOKIE, String(expiresAtMs), maxAgeSec);

          router.push("/restaurant");
          router.refresh();
        }}
      />
    </main>
  );
}
