import { Controller, Get, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";

@Controller("analytics")
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("offers")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  offers() {
    return this.analyticsService.getOfferPerformance();
  }

  @Get("roi")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  roi() {
    return this.analyticsService.getRoiInsights();
  }
}
