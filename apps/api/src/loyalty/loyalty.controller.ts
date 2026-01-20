import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { LoyaltyService } from "./loyalty.service";
import { AdjustPointsDto } from "./dto/loyalty.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PaginationQuery } from "../common/dto/pagination.dto";

@Controller("loyalty")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get("tiers")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  tiers() {
    return this.loyaltyService.getTiers();
  }

  @Get("members")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  members(@Query() query: PaginationQuery) {
    return this.loyaltyService.getMembers(query);
  }

  @Post("adjust")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  adjust(@Body() dto: AdjustPointsDto) {
    return this.loyaltyService.adjustPoints(dto);
  }
}
