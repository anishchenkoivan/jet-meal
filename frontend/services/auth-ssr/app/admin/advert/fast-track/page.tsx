import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasValidAccountSession } from "../../../../lib/middlewares/authGuard";
import { AccountPageShell } from "../../../../src/components/AccountPageShell/AccountPageShell";
import { AdminAdvertFastTrackClient } from "../../../../src/components/AdminAdvertFastTrack/AdminAdvertFastTrackClient";

export default async function AdminAdvertFastTrackPage() {
  const cookieStore = await cookies();
  if (!hasValidAccountSession({ cookies: cookieStore })) {
    redirect("/my");
  }

  return (
    <main className="m-0 min-h-0 w-full p-0">
      <AccountPageShell>
        <Link
          href="/admin/advert"
          className="mb-4 inline-block text-[0.9rem] [color:var(--jm-color-primary,#1677ff)] no-underline hover:underline"
        >
          ← К рекламе
        </Link>
        <AdminAdvertFastTrackClient />
      </AccountPageShell>
    </main>
  );
}
