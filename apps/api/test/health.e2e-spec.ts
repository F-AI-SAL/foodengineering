import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("Health (e2e)", () => {
  let app: INestApplication | undefined;

  beforeAll(async () => {
    if (process.env.SKIP_E2E === "true") {
      return;
    }
    process.env.STORAGE_PROVIDER = "disabled";
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("GET /health", async () => {
    if (process.env.SKIP_E2E === "true") {
      return;
    }
    await request(app!.getHttpServer()).get("/health").expect(200);
  });
});
