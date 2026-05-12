"use client";

import {
  type AuthFormValues,
  type AuthMode,
  AuthPage,
} from "@jet-meal/ui-lib/src/components/AuthPage/AuthPage";
import { useDrawer } from "@jet-meal/ui-lib/src/components/DrawerProvider/DrawerProvider";
import { useRouter } from "next/navigation";
import { setAccountSessionCookies } from "../../lib/accountSession";

export type RestaurantCheckoutAuthDrawerProps = {
  /** Куда перейти после успешного входа (страница оформления). */
  returnHref: string;
};

export function RestaurantCheckoutAuthDrawer({
  returnHref,
}: RestaurantCheckoutAuthDrawerProps) {
  const router = useRouter();
  const { close } = useDrawer();

  return (
    <div className="box-border flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 pb-3 pt-1 [-webkit-overflow-scrolling:touch]">
      <AuthPage
        title="Вход"
        registerTitle="Регистрация"
        verifyEmailTitle="Введите код из письма"
        initialMode="login"
        onSubmit={async (_mode: AuthMode, values: AuthFormValues) => {
          setAccountSessionCookies(values.login);
          close();
          router.push(returnHref);
          router.refresh();
        }}
      />
    </div>
  );
}
