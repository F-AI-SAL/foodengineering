import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMenuItemDto, UpdateMenuItemDto } from "./dto/menu-item.dto";
import { MenuGateway } from "./menu.gateway";

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menuGateway: MenuGateway
  ) {}

  async findAll() {
    return this.prisma.menuItem.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(dto: CreateMenuItemDto) {
    const item = await this.prisma.menuItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        image: dto.image,
        available: dto.available,
        prepTime: dto.prepTime,
        tags: dto.tags,
        optionsJson: dto.optionsJson ? (dto.optionsJson as Prisma.InputJsonValue) : undefined
      }
    });
    this.menuGateway.broadcastMenuUpdate({ type: "created", item });
    return item;
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.ensureExists(id);
    const item = await this.prisma.menuItem.update({
      where: { id },
      data: {
        ...dto,
        optionsJson: dto.optionsJson ? (dto.optionsJson as Prisma.InputJsonValue) : undefined
      }
    });
    this.menuGateway.broadcastMenuUpdate({ type: "updated", item });
    return item;
  }

  async updateImage(id: string, imageUrl: string) {
    await this.ensureExists(id);
    const item = await this.prisma.menuItem.update({
      where: { id },
      data: { image: imageUrl }
    });
    this.menuGateway.broadcastMenuUpdate({ type: "image", item });
    return item;
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException("Menu item not found");
    }
  }
}
