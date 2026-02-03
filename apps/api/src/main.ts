import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import * as Sentry from "@sentry/node";
import { AppLogger } from "./common/app-logger";
import { RequestContext } from "./common/request-context";
import { SentryExceptionFilter } from "./common/sentry-exception.filter";
import { HttpAdapterHost } from "@nestjs/core";
import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  app.useLogger(new AppLogger());

  const requireEnv = (key: string) => {
    const value = config.get<string>(key) ?? process.env[key];
    if (!value || !String(value).trim()) {
      throw new Error(`${key} is required and must be set.`);
    }
    return value;
  };

  requireEnv("DATABASE_URL");
  requireEnv("JWT_SECRET");
  requireEnv("APP_URL");

  const corsOriginRaw = config.get<string>("CORS_ORIGIN");
  if (!corsOriginRaw || !corsOriginRaw.trim()) {
    throw new Error(
      "CORS_ORIGIN is required. Set a comma-separated allowlist (e.g. https://admin.example.com,https://app.example.com)."
    );
  }
  const corsOrigins = corsOriginRaw
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: corsOrigins,
    credentials: true
  });

  const sentryDsn = config.get<string>("SENTRY_DSN");
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: config.get<string>("SENTRY_ENVIRONMENT") ?? "development",
      tracesSampleRate: Number(config.get<string>("SENTRY_TRACES_SAMPLE_RATE") ?? "0")
    });
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    const headerKey = (config.get<string>("REQUEST_ID_HEADER") ?? "x-request-id").toLowerCase();
    const incoming = req.headers[headerKey];
    const requestId = typeof incoming === "string" && incoming.length ? incoming : randomUUID();
    res.setHeader("x-request-id", requestId);
    RequestContext.run({ requestId }, () => next());
  });

  if (sentryDsn) {
    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new SentryExceptionFilter(httpAdapter));
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
}

void bootstrap();
