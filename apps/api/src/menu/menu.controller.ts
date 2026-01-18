import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import type { Request } from "express";
import { extname, join } from "path";
import { mkdirSync } from "fs";
import { MenuService } from "./menu.service";
import { CreateMenuItemDto, UpdateMenuItemDto } from "./dto/menu-item.dto";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";

@Controller("menu")
@UseGuards(RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  findAll() {
    return this.menuService.findAll();
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
      storage: diskStorage({
        destination: (
          _req: Request,
          _file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void
        ) => {
          const uploadPath = join(process.cwd(), "uploads", "menu");
          mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (
          _req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void
        ) => {
          const safeExt = extname(file.originalname).toLowerCase();
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
          cb(null, fileName);
        }
      }),
      fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void
      ) => {
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/svg+xml",
          "application/pdf"
        ];
        if (!allowed.includes(file.mimetype)) {
          return cb(new Error("Only JPEG, PNG, SVG, or PDF files are allowed."), false);
        }
        return cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }
    })
  )
  async upload(@Param("id") id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required.");
    }

    const url = `/uploads/menu/${file.filename}`;
    return this.menuService.updateImage(id, url);
  }
}
