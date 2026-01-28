import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Request, Response } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsOrigin = (config.get<string>("CORS_ORIGIN") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  app.enableCors({
    origin: corsOrigin.length ? corsOrigin : false,
    credentials: true
  });
  app.use(helmet());

  const upstream = config.get<string>("UPSTREAM_API_URL") ?? "http://localhost:4000";
  const notificationsUrl = config.get<string>("NOTIFICATIONS_URL");
  const timeoutMs = Number(config.get<string>("REQUEST_TIMEOUT_MS") ?? "8000");

  const proxy = createProxyMiddleware({
    target: upstream,
    changeOrigin: true,
    ws: true,
    proxyTimeout: timeoutMs,
    pathRewrite: { "^/api": "" },
    on: {
      error: (_err, _req, res) => {
        const response = res as Response;
        if (!response.headersSent) {
          response.status(502).json({ message: "Upstream unavailable" });
        }
      }
    }
  });

  if (notificationsUrl) {
    const notificationsProxy = createProxyMiddleware({
      target: notificationsUrl,
      changeOrigin: true,
      proxyTimeout: timeoutMs,
      pathRewrite: { "^/api/notifications": "/notifications" },
      on: {
        error: (_err, _req, res) => {
          const response = res as Response;
          if (!response.headersSent) {
            response.status(502).json({ message: "Notifications service unavailable" });
          }
        }
      }
    });
    app.use("/api/notifications", (req: Request, res: Response, next: () => void) =>
      notificationsProxy(req, res, next)
    );
  }

  app.use("/api", (req: Request, res: Response, next: () => void) => proxy(req, res, next));

  const port = Number(config.get<string>("PORT") ?? "4010");
  await app.listen(port);
}

bootstrap();
