import type { ReactNode } from "react";
import { RestaurantAuthProvider } from "../../../src/providers/RestaurantAuthProvider/RestaurantAuthProvider";

export default function RestaurantProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RestaurantAuthProvider>{children}</RestaurantAuthProvider>;
}
