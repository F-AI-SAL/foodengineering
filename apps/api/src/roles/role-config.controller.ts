import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { RoleConfigService } from "./role-config.service";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";
import { UserRole } from "../common/enums/user-role.enum";

@Controller("roles/config")
@UseGuards(RolesGuard)
export class RoleConfigController {
  constructor(private readonly roleConfigService: RoleConfigService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  list() {
    return this.roleConfigService.list();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  upsert(@Body() payload: { role: string; permissions: Record<string, unknown> }) {
    return this.roleConfigService.upsert(payload.role, payload.permissions);
  }
}
