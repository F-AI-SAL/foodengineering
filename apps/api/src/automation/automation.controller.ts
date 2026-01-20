import { Body, Controller, Get, Patch, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AutomationService } from "./automation.service";
import { CreateAutomationDto, UpdateAutomationDto } from "./dto/automation.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PaginationQuery } from "../common/dto/pagination.dto";

@Controller("automation")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  findAll(@Query() query: PaginationQuery) {
    return this.automationService.findAll(query);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  create(@Body() dto: CreateAutomationDto) {
    return this.automationService.create(dto);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  update(@Param("id") id: string, @Body() dto: UpdateAutomationDto) {
    return this.automationService.update(id, dto);
  }

  @Post(":id/run")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  run(@Param("id") id: string) {
    return this.automationService.runNow(id);
  }
}
