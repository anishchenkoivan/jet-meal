import { redirect } from "next/navigation";
import { readAccountSession } from "../../../lib/readAccountSession";
import { AccountPageShell } from "../../../src/components/AccountPageShell/AccountPageShell";
import { MyProfileForm } from "../../../src/components/MyProfileForm/MyProfileForm";

export default async function MyProfilePage() {
  const session = await readAccountSession();
  if (!session.ok) {
    redirect("/my");
  }

  return (
    <main className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0">
      <AccountPageShell>
        <MyProfileForm />
      </AccountPageShell>
    </main>
  );
}
