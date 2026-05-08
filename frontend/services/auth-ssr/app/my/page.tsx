import { Suspense } from "react";
import { readAccountSession } from "../../lib/readAccountSession";
import { AccountPageShell } from "../../src/components/AccountPageShell/AccountPageShell";
import { AccountLoginPanel } from "../../src/components/AccountLoginPanel";
import { AccountSignedIn } from "../../src/components/AccountSignedIn";
import styles from "./page.module.css";

export default async function MyPage() {
  const session = await readAccountSession();

  if (!session.ok) {
    return (
      <main className={styles["main"]}>
        <AccountPageShell>
          <Suspense
            fallback={
              <div className={styles["fallback"]} aria-busy>
                Загрузка…
              </div>
            }
          >
            <AccountLoginPanel />
          </Suspense>
        </AccountPageShell>
      </main>
    );
  }

  return (
    <main className={styles["main"]}>
      <AccountPageShell>
        <AccountSignedIn
          login={session.login}
          expiresAtMs={session.expiresAtMs}
          sessionId={session.sessionId}
        />
      </AccountPageShell>
    </main>
  );
}
