import { Body, Controller, Get, Patch, Param, Post, UseGuards } from "@nestjs/common";
import { PromotionsService } from "./promotions.service";
import { CreatePromotionDto, UpdatePromotionDto } from "./dto/promotion.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("promotions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  findAll() {
    return this.promotionsService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  update(@Param("id") id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionsService.update(id, dto);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  setStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.promotionsService.setStatus(id, status);
  }
}
