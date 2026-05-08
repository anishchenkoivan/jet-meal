import { redirect } from "next/navigation";
import { readAccountSession } from "../../../lib/readAccountSession";
import { AccountPageShell } from "../../../src/components/AccountPageShell/AccountPageShell";
import { MyProfileForm } from "../../../src/components/MyProfileForm/MyProfileForm";
import styles from "../page.module.css";

export default async function MyProfilePage() {
  const session = await readAccountSession();
  if (!session.ok) {
    redirect("/my");
  }

  return (
    <main className={styles["main"]}>
      <AccountPageShell>
        <MyProfileForm />
      </AccountPageShell>
    </main>
  );
}
