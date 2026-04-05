import type { ReactNode } from "react";
import { RestaurantRouteLayout } from "../../src/containers/RestaurantRouteLayout/RestaurantRouteLayout";

export default function RestaurantLayout({ children }: { children: ReactNode }) {
  return <RestaurantRouteLayout>{children}</RestaurantRouteLayout>;
}
