import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const corsOrigin = (config.get<string>("CORS_ORIGIN") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigin.length ? corsOrigin : false, credentials: true });

  const port = Number(config.get<string>("PORT") ?? "4020");
  await app.listen(port);
}

bootstrap();
