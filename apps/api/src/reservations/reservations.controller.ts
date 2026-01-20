import { Body, Controller, Get, Patch, Param, Post, UseGuards } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationStatusDto } from "./dto/update-reservation-status.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Public } from "../auth/public.decorator";

@Controller("reservations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  findAll() {
    return this.reservationsService.findAll();
  }

  @Post()
  @Public()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  updateStatus(@Param("id") id: string, @Body() dto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, dto);
  }
}
