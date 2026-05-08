import type { IncomingMessage, ServerResponse } from "node:http";
import type { Duplex } from "node:stream";
import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import httpProxy from "http-proxy";
import { ProcessManager } from "./process-manager";
import type { ResolvedService } from "./router.types";
import { loadServicesFromRepo } from "./router-loader";
import {
  type CompiledRoutes,
  compileRoutes,
  resolveBackend,
  stickyCookieHeader,
} from "./routing";

type AugmentedRequest = IncomingMessage & { jetMealGatewayServiceId?: string };

@Injectable()
export class GatewayService implements OnModuleInit, OnModuleDestroy {
  readonly proxy = httpProxy.createProxyServer({
    ws: true,
    xfwd: true,
  });

  private readonly processes = new ProcessManager();
  private services: ResolvedService[] = [];
  routes!: CompiledRoutes;

  constructor() {
    this.proxy.on("proxyRes", (proxyRes, req) => {
      const id = (req as AugmentedRequest).jetMealGatewayServiceId;
      if (!id) {
        return;
      }
      const ct = proxyRes.headers["content-type"];
      if (!ct || !String(ct).includes("text/html")) {
        return;
      }
      const cookie = stickyCookieHeader(id);
      const existing = proxyRes.headers["set-cookie"];
      if (Array.isArray(existing)) {
        proxyRes.headers["set-cookie"] = [...existing, cookie];
      } else if (existing) {
        proxyRes.headers["set-cookie"] = [existing, cookie];
      } else {
        proxyRes.headers["set-cookie"] = [cookie];
      }
    });

    this.proxy.on("error", (err, _req, res) => {
      console.error("[dev-gateway] proxy error", err);
      if (res && "writeHead" in res && !res.headersSent) {
        res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
        res.end("Bad gateway");
      }
    });
  }

  async onModuleInit(): Promise<void> {
    this.services = await loadServicesFromRepo();
    this.routes = compileRoutes(this.services);
    await this.processes.startAll(this.services);
  }

  onModuleDestroy(): void {
    this.processes.stopAll();
  }

  handleHttp(req: IncomingMessage, res: ServerResponse): void {
    const url = req.url ?? "/";
    let pathname: string;
    try {
      pathname = new URL(url, "http://localhost").pathname;
    } catch {
      pathname = "/";
    }

    if (req.method === "GET" && pathname === "/health") {
      res.statusCode = 200;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: true, service: "dev-gateway" }));
      return;
    }

    const backend = resolveBackend({
      pathname,
      routes: this.routes,
      referer: req.headers.referer,
      cookieHeader: req.headers.cookie,
    });

    const target = `http://127.0.0.1:${backend.port}`;
    (req as AugmentedRequest).jetMealGatewayServiceId = backend.serviceId;

    this.proxy.web(req, res, { target, changeOrigin: true });
  }

  handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): void {
    const url = req.url ?? "/";
    let pathname: string;
    try {
      pathname = new URL(url, "http://localhost").pathname;
    } catch {
      pathname = "/";
    }

    const backend = resolveBackend({
      pathname,
      routes: this.routes,
      referer: req.headers.referer ?? req.headers.origin,
      cookieHeader: req.headers.cookie,
    });

    const target = `ws://127.0.0.1:${backend.port}`;
    (req as AugmentedRequest).jetMealGatewayServiceId = backend.serviceId;

    this.proxy.ws(req, socket, head, { target, changeOrigin: true });
  }
}
