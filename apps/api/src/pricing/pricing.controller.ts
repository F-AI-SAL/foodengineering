import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { PricingService } from "./pricing.service";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";

@Controller("pricing")
@UseGuards(RolesGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post("preview")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  preview(@Body() payload: any) {
    return this.pricingService.priceOrder(payload);
  }
}
