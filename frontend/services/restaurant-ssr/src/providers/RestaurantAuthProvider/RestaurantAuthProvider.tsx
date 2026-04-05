import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasValidRestaurantSession } from "../../../lib/middlewares/authGuard";

export async function RestaurantAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthorized = hasValidRestaurantSession({ cookies: cookieStore });

  if (!isAuthorized) {
    redirect("/restaurant/login");
  }

  return children;
}
