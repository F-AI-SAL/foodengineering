import { Body, Controller, Get, Patch, Param, Post, UseGuards } from "@nestjs/common";
import { SegmentsService } from "./segments.service";
import { CreateSegmentDto, UpdateSegmentDto } from "./dto/segment.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("segments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  findAll() {
    return this.segmentsService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  create(@Body() dto: CreateSegmentDto) {
    return this.segmentsService.create(dto);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  update(@Param("id") id: string, @Body() dto: UpdateSegmentDto) {
    return this.segmentsService.update(id, dto);
  }
}
