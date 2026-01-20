import { Body, Controller, Get, Patch, Param, Post, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AssignRiderDto } from "./dto/assign-rider.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Public } from "../auth/public.decorator";

@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  findAll() {
    return this.ordersService.findAll();
  }

  @Post()
  @Public()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Patch(":id/assign")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  assignRider(@Param("id") id: string, @Body() dto: AssignRiderDto) {
    return this.ordersService.assignRider(id, dto);
  }
}
