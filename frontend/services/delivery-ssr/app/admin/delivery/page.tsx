import { cookies } from "next/headers";
import { COURIER_PROFILE_COOKIE } from "./courierProfileCookie";
import { CourierOnboarding } from "./CourierOnboarding";
import { CourierDashboard } from "../../../src/components/CourierDashboard/CourierDashboard";

export default async function AdminDeliveryPage() {
  const jar = await cookies();
  const hasCourier = jar.get(COURIER_PROFILE_COOKIE)?.value === "1";
  return hasCourier ? <CourierDashboard /> : <CourierOnboarding />;
}
