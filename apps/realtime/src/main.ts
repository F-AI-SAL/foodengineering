import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsOrigin = (config.get<string>("CORS_ORIGIN") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigin.length ? corsOrigin : false, credentials: true });

  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );

  const port = Number(config.get<string>("PORT") ?? "4030");
  await app.listen(port);
}

void bootstrap();
