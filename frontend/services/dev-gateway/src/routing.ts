import type { ResolvedService } from "./router.types";

export type CompiledRoutes = {
  prefixes: Array<{ path: string; serviceId: string; port: number }>;
  rootServiceId: string | null;
  rootPort: number | null;
  defaultServiceId: string;
  defaultPort: number;
  serviceById: Map<string, { port: number }>;
};

const COOKIE = "jet-meal-gw";

export function parseCookieHeader(
  cookieHeader: string | undefined,
  name: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) {
      continue;
    }
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k === name) {
      return decodeURIComponent(v);
    }
  }
  return null;
}

export function compileRoutes(services: ResolvedService[]): CompiledRoutes {
  const prefixes: Array<{ path: string; serviceId: string; port: number }> = [];
  let rootServiceId: string | null = null;
  let rootPort: number | null = null;
  const serviceById = new Map<string, { port: number }>();

  for (const s of services) {
    serviceById.set(s.id, { port: s.port });
    for (const r of s.routes) {
      if (r.path === "/") {
        rootServiceId = s.id;
        rootPort = s.port;
      } else {
        prefixes.push({ path: r.path, serviceId: s.id, port: s.port });
      }
    }
  }

  prefixes.sort((a, b) => b.path.length - a.path.length);

  let defaultServiceId = services[0]?.id ?? "auth-ssr";
  let defaultPort = services[0]?.port ?? 3101;
  if (rootServiceId && rootPort !== null) {
    defaultServiceId = rootServiceId;
    defaultPort = rootPort;
  }

  return {
    prefixes,
    rootServiceId,
    rootPort,
    defaultServiceId,
    defaultPort,
    serviceById,
  };
}

function matchByPathname(
  pathname: string,
  routes: CompiledRoutes,
): { serviceId: string; port: number } | null {
  for (const p of routes.prefixes) {
    if (pathname === p.path || pathname.startsWith(`${p.path}/`)) {
      return { serviceId: p.serviceId, port: p.port };
    }
  }
  if (routes.rootServiceId && routes.rootPort !== null) {
    return { serviceId: routes.rootServiceId, port: routes.rootPort };
  }
  return null;
}

function isNextAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/__nextjs") ||
    pathname.includes("webpack-hmr") ||
    pathname.includes("turbopack")
  );
}

export function inferServiceIdFromNextAssetPathname(
  pathname: string,
  routes: CompiledRoutes,
): string | null {
  const p = pathname.toLowerCase();
  const candidates: Array<[needle: string, id: string]> = [
    ["restaurant-ssr", "restaurant-ssr"],
    ["delivery-ssr", "delivery-ssr"],
    ["auth-ssr", "auth-ssr"],
  ];
  for (const [needle, id] of candidates) {
    if (p.includes(needle) && routes.serviceById.has(id)) {
      return id;
    }
  }
  return null;
}

export function resolveBackend(params: {
  pathname: string;
  routes: CompiledRoutes;
  referer?: string;
  cookieHeader?: string;
}): { serviceId: string; port: number } {
  const { pathname, routes, referer, cookieHeader } = params;

  if (!isNextAssetPath(pathname)) {
    const m = matchByPathname(pathname, routes);
    if (m) {
      return m;
    }
    return { serviceId: routes.defaultServiceId, port: routes.defaultPort };
  }

  const fromCookie = parseCookieHeader(cookieHeader, COOKIE);
  if (fromCookie) {
    const p = routes.serviceById.get(fromCookie);
    if (p) {
      return { serviceId: fromCookie, port: p.port };
    }
  }

  if (referer) {
    try {
      const refPath = new URL(referer).pathname;
      const m = matchByPathname(refPath, routes);
      if (m) {
        return m;
      }
    } catch {}
  }

  const inferred = inferServiceIdFromNextAssetPathname(pathname, routes);
  if (inferred) {
    const p = routes.serviceById.get(inferred);
    if (p) {
      return { serviceId: inferred, port: p.port };
    }
  }

  return { serviceId: routes.defaultServiceId, port: routes.defaultPort };
}

export function stickyCookieHeader(serviceId: string): string {
  return `${COOKIE}=${encodeURIComponent(serviceId)}; Path=/; SameSite=Lax; HttpOnly`;
}
