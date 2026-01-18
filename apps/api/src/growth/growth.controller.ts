import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { GrowthService } from "./growth.service";
import { CreateExperimentDto, CreateUpsellRuleDto } from "./dto/growth.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";

@Controller("growth")
@UseGuards(RolesGuard)
export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  @Get("upsells")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  upsells() {
    return this.growthService.getUpsellRules();
  }

  @Post("upsells")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  createUpsell(@Body() dto: CreateUpsellRuleDto) {
    return this.growthService.createUpsell(dto);
  }

  @Get("experiments")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  experiments() {
    return this.growthService.getExperiments();
  }

  @Post("experiments")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  createExperiment(@Body() dto: CreateExperimentDto) {
    return this.growthService.createExperiment(dto);
  }
}
