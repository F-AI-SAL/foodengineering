import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertSettingDto } from "./dto/settings.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.setting.findMany({ orderBy: { key: "asc" }, skip, take }),
      this.prisma.setting.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  async get(key: string) {
    const record = await this.prisma.setting.findUnique({ where: { key } });
    if (!record) {
      throw new NotFoundException("Setting not found");
    }

    return record;
  }

  upsert(dto: UpsertSettingDto) {
    return this.prisma.setting.upsert({
      where: { key: dto.key },
      update: { valueJson: dto.valueJson as Prisma.InputJsonValue },
      create: { key: dto.key, valueJson: dto.valueJson as Prisma.InputJsonValue }
    });
  }
}
