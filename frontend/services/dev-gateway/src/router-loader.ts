import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { repoRoot } from "./repo-root";
import type { ResolvedService, RouterYaml } from "./router.types";

function substitutePort(value: string, port: number): string {
  const token = "$" + "{PORT}";
  return value.replaceAll(token, String(port));
}

async function findRouterYamlFiles(dir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const e of entries) {
      const p = join(current, e.name);
      if (e.isDirectory()) {
        if (
          e.name === "node_modules" ||
          e.name === ".git" ||
          e.name === "dist" ||
          e.name === ".next"
        ) {
          continue;
        }
        await walk(p);
      } else if (e.name === "router.yaml") {
        results.push(p);
      }
    }
  }

  await walk(dir);
  results.sort();
  return results;
}

function parseRouterFile(content: string, filePath: string): RouterYaml {
  const parsed: unknown = parseYaml(content);
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid YAML in ${filePath}`);
  }
  const data = parsed as Partial<RouterYaml>;
  if (
    !data.service?.id ||
    !data.spawn?.command ||
    !Array.isArray(data.routes)
  ) {
    throw new Error(
      `router.yaml at ${filePath} must define service.id, spawn, and routes`,
    );
  }
  return data as RouterYaml;
}

export async function loadResolvedServices(
  scanRoot: string,
  portBase: number,
): Promise<ResolvedService[]> {
  const files = await findRouterYamlFiles(scanRoot);
  const usedPorts = new Set<number>();
  let nextAuto = portBase;
  const resolved: ResolvedService[] = [];

  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const doc = parseRouterFile(raw, file);

    let port = doc.service.port ?? nextAuto;
    while (usedPorts.has(port)) {
      port += 1;
    }
    if (doc.service.port === undefined) {
      nextAuto = port + 1;
    }
    usedPorts.add(port);

    const args = doc.spawn.args.map((a) => substitutePort(a, port));
    const env = doc.spawn.env
      ? Object.fromEntries(
          Object.entries(doc.spawn.env).map(([k, v]) => [
            k,
            substitutePort(v, port),
          ]),
        )
      : undefined;

    resolved.push({
      id: doc.service.id,
      port,
      optional: doc.service.optional === true,
      routerPath: file,
      spawn: {
        cwd: doc.spawn.cwd,
        command: doc.spawn.command,
        args,
        env,
      },
      routes: doc.routes,
    });
  }

  return resolved;
}

export async function loadServicesFromRepo(): Promise<ResolvedService[]> {
  const portBase = Number(process.env.JET_MEAL_DEV_GATEWAY_PORT_BASE ?? "3101");
  const scanRel = "frontend";
  const scanRoot = join(repoRoot, scanRel);
  return loadResolvedServices(scanRoot, portBase);
}
