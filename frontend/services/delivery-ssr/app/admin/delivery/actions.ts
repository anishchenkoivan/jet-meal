"use server";

import { cookies } from "next/headers";
import { COURIER_PROFILE_COOKIE } from "./courierProfileCookie";

export async function registerCourierProfile(): Promise<void> {
  const jar = await cookies();
  jar.set(COURIER_PROFILE_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
    httpOnly: true,
  });
}

export async function clearCourierProfile(): Promise<void> {
  const jar = await cookies();
  jar.delete(COURIER_PROFILE_COOKIE);
}
