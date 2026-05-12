import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { join } from "node:path";
import { repoRoot } from "./repo-root";
import type { ResolvedService } from "./router.types";

async function waitForTcpPort(
  port: number,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = createConnection({ host: "127.0.0.1", port }, () => {
          socket.destroy();
          resolve();
        });
        socket.on("error", () => reject(new Error("retry")));
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  return false;
}

export class ProcessManager {
  private readonly children = new Map<string, ReturnType<typeof spawn>>();

  async startAll(services: ResolvedService[]): Promise<void> {
    for (const s of services) {
      const cwd = join(repoRoot, s.spawn.cwd);
      console.log(`[dev-gateway] starting ${s.id} on :${s.port} (${cwd})`);
      const child = spawn(s.spawn.command, s.spawn.args, {
        cwd,
        env: { ...process.env, ...s.spawn.env, PORT: String(s.port) },
        stdio: "inherit",
        shell: false,
      });
      this.children.set(s.id, child);
      child.on("exit", (code, signal) => {
        console.warn(
          `[dev-gateway] ${s.id} exited code=${code} signal=${signal}`,
        );
      });

      const up = await waitForTcpPort(s.port, 120_000);
      if (!up) {
        if (s.optional) {
          console.warn(
            `[dev-gateway] optional service ${s.id} did not open :${s.port} — skipping`,
          );
          continue;
        }
        throw new Error(`Service ${s.id} did not listen on ${s.port} in time`);
      }
    }
  }

  stopAll(): void {
    for (const [id, child] of this.children) {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
      this.children.delete(id);
    }
  }
}
