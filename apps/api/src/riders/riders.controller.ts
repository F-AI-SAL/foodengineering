import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { RidersService } from "./riders.service";
import { UpdateRiderProfileDto } from "./dto/update-rider.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PaginationQuery } from "../common/dto/pagination.dto";

@Controller("riders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  findAll(@Query() query: PaginationQuery) {
    return this.ridersService.findAll(query);
  }

  @Patch(":userId")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER, UserRole.RIDER)
  updateProfile(@Param("userId") userId: string, @Body() dto: UpdateRiderProfileDto) {
    return this.ridersService.updateProfile(userId, dto);
  }
}
