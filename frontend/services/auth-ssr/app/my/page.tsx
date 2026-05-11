import { Suspense } from "react";
import { readAccountSession } from "../../lib/readAccountSession";
import { AccountLoginPanel } from "../../src/components/AccountLoginPanel";
import { AccountPageShell } from "../../src/components/AccountPageShell/AccountPageShell";
import { AccountSignedIn } from "../../src/components/AccountSignedIn";

export default async function MyPage() {
  const session = await readAccountSession();

  if (!session.ok) {
    return (
      <main className="m-0 flex min-h-0 flex-1 flex-col p-0 overflow-hidden">
        <AccountPageShell>
          <Suspense
            fallback={
              <div className="py-12 text-center text-black/45" aria-busy>
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
    <main className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0">
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
