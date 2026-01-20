import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Query,
  Patch,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { MenuService } from "./menu.service";
import { CreateMenuItemDto, UpdateMenuItemDto } from "./dto/menu-item.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Public } from "../auth/public.decorator";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { UploadsService } from "../uploads/uploads.service";

const MAX_UPLOAD_BYTES = Number(process.env.UPLOAD_MAX_MB ?? "10") * 1024 * 1024;
const ALLOWED_MIME = (process.env.UPLOAD_ALLOWED_MIME ?? "image/jpeg,image/png,image/svg+xml,application/pdf")
  .split(",")
  .map((value) => value.trim());

@Controller("menu")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly uploadsService: UploadsService
  ) {}

  @Get()
  @Public()
  findAll(@Query() query: PaginationQuery) {
    return this.menuService.findAll(query);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  update(@Param("id") id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.update(id, dto);
  }

  @Post(":id/upload")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
          return cb(null, true);
        }
        return cb(new Error("Unsupported file type."), false);
      },
      limits: { fileSize: MAX_UPLOAD_BYTES }
    })
  )
  async upload(@Param("id") id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required.");
    }

    const { url } = await this.uploadsService.uploadMenuAsset(file);
    return this.menuService.updateImage(id, url);
  }
}
