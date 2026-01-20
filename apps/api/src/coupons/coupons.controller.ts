import { Body, Controller, Get, Patch, Param, Post, UseGuards } from "@nestjs/common";
import { CouponsService } from "./coupons.service";
import { CreateCouponDto, UpdateCouponDto } from "./dto/coupon.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("coupons")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  update(@Param("id") id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Post(":id/send")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  send(@Param("id") id: string, @Body("segmentIds") segmentIds: string[]) {
    return this.couponsService.sendToSegment(id, segmentIds ?? []);
  }

  @Get(":id/export")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  export(@Param("id") id: string) {
    return this.couponsService.exportRedemptions(id);
  }
}
