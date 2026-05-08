import { redirect } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  searchParams: Promise<{ register?: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Аккаунт — Jet Meal",
};

export default async function AccountLegacyRedirect({ searchParams }: PageProps) {
  const sp = await searchParams;
  const raw = sp.register;
  const reg = raw === "1" || (Array.isArray(raw) && raw[0] === "1");
  redirect(reg ? "/my?register=1" : "/my");
}
