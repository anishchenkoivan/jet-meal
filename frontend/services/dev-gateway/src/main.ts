import type { IncomingMessage, ServerResponse } from "node:http";
import "reflect-metadata";
import "./instrumentationNode";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { GatewayService } from "./gateway.service";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const gateway = app.get(GatewayService);

  app.use((req: IncomingMessage, res: ServerResponse) => {
    gateway.handleHttp(req, res);
  });

  const listenHost = process.env.LISTEN_HOST ?? "127.0.0.1";
  const listenPort = Number(process.env.PORT ?? "7080");

  await app.listen(listenPort, listenHost);

  const httpServer = app.getHttpServer();
  httpServer.on("upgrade", (req, socket, head) => {
    gateway.handleUpgrade(req, socket, head);
  });

  console.log(
    `[dev-gateway] listening on http://${listenHost}:${listenPort} — point dev.jet.meal (or 127.0.0.1) here`,
  );
}

bootstrap().catch((err) => {
  console.error("[dev-gateway] fatal", err);
  process.exit(1);
});
