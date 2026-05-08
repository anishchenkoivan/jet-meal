import { redirect } from "next/navigation";
import { readAccountSession } from "../../../lib/readAccountSession";
import { AccountPageShell } from "../../../src/components/AccountPageShell/AccountPageShell";
import { MyOrdersPanel } from "../../../src/components/MyOrdersPanel/MyOrdersPanel";
import styles from "../page.module.css";

export default async function MyOrdersPage() {
  const session = await readAccountSession();
  if (!session.ok) {
    redirect("/my");
  }

  return (
    <main className={styles["main"]}>
      <AccountPageShell>
        <MyOrdersPanel />
      </AccountPageShell>
    </main>
  );
}
