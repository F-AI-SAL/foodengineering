import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { GrowthService } from "./growth.service";
import { CreateExperimentDto, CreateUpsellRuleDto } from "./dto/growth.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PaginationQuery } from "../common/dto/pagination.dto";

@Controller("growth")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  @Get("upsells")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  upsells(@Query() query: PaginationQuery) {
    return this.growthService.getUpsellRules(query);
  }

  @Post("upsells")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  createUpsell(@Body() dto: CreateUpsellRuleDto) {
    return this.growthService.createUpsell(dto);
  }

  @Get("experiments")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  experiments(@Query() query: PaginationQuery) {
    return this.growthService.getExperiments(query);
  }

  @Post("experiments")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  createExperiment(@Body() dto: CreateExperimentDto) {
    return this.growthService.createExperiment(dto);
  }
}
