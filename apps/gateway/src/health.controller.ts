import { Controller, Get } from "@nestjs/common";
import type { HealthResponse } from "@food-engineering/contracts";
import { ConfigService } from "@nestjs/config";

@Controller("health")
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "gateway",
      version: this.config.get<string>("npm_package_version") ?? undefined,
      timestamp: new Date().toISOString()
    };
  }
}
