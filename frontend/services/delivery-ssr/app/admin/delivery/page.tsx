import { cookies } from "next/headers";
import { CourierDashboard } from "../../../src/components/CourierDashboard/CourierDashboard";
import { CourierOnboarding } from "./CourierOnboarding";
import { COURIER_PROFILE_COOKIE } from "./courierProfileCookie";

export default async function AdminDeliveryPage() {
  const jar = await cookies();
  const hasCourier = jar.get(COURIER_PROFILE_COOKIE)?.value === "1";
  return hasCourier ? <CourierDashboard /> : <CourierOnboarding />;
}
