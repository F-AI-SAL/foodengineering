import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePromotionDto, UpdatePromotionDto } from "./dto/promotion.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.promotion.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      this.prisma.promotion.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  async create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: {
        name: dto.name,
        description: dto.description,
        startAt: dto.startAt ? new Date(dto.startAt) : null,
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        stackable: dto.stackable,
        priority: dto.priority,
        rulesJson: dto.rulesJson as Prisma.InputJsonValue,
        scheduleJson: dto.scheduleJson
          ? (dto.scheduleJson as Prisma.InputJsonValue)
          : Prisma.DbNull,
        budgetCap: dto.budgetCap,
        maxDiscount: dto.maxDiscount
      }
    });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.ensureExists(id);
    return this.prisma.promotion.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        stackable: dto.stackable,
        priority: dto.priority,
        rulesJson: dto.rulesJson ? (dto.rulesJson as Prisma.InputJsonValue) : undefined,
        scheduleJson: dto.scheduleJson
          ? (dto.scheduleJson as Prisma.InputJsonValue)
          : undefined,
        budgetCap: dto.budgetCap,
        maxDiscount: dto.maxDiscount,
        status: dto.status as any
      }
    });
  }

  async setStatus(id: string, status: string) {
    await this.ensureExists(id);
    return this.prisma.promotion.update({
      where: { id },
      data: { status: status as any }
    });
  }

  private async ensureExists(id: string) {
    const record = await this.prisma.promotion.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException("Promotion not found");
    }
  }
}
