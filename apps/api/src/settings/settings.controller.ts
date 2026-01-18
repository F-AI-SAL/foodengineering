import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { UpsertSettingDto } from "./dto/settings.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";

@Controller("settings")
@UseGuards(RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  list() {
    return this.settingsService.list();
  }

  @Get(":key")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  get(@Param("key") key: string) {
    return this.settingsService.get(key);
  }

  @Get("public/:key")
  publicGet(@Param("key") key: string) {
    return this.settingsService.get(key);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  upsert(@Body() dto: UpsertSettingDto) {
    return this.settingsService.upsert(dto);
  }
}
