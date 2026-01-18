import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { RidersService } from "./riders.service";
import { UpdateRiderProfileDto } from "./dto/update-rider.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";

@Controller("riders")
@UseGuards(RolesGuard)
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  findAll() {
    return this.ridersService.findAll();
  }

  @Patch(":userId")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER, UserRole.RIDER)
  updateProfile(@Param("userId") userId: string, @Body() dto: UpdateRiderProfileDto) {
    return this.ridersService.updateProfile(userId, dto);
  }
}
