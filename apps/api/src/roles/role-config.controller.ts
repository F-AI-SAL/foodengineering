import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { RoleConfigService } from "./role-config.service";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PaginationQuery } from "../common/dto/pagination.dto";

@Controller("roles/config")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleConfigController {
  constructor(private readonly roleConfigService: RoleConfigService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  list(@Query() query: PaginationQuery) {
    return this.roleConfigService.list(query);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  upsert(@Body() payload: { role: string; permissions: Record<string, unknown> }) {
    return this.roleConfigService.upsert(payload.role, payload.permissions);
  }
}
