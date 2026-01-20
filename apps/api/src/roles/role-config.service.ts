import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class RoleConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.roleConfig.findMany({ orderBy: { role: "asc" }, skip, take }),
      this.prisma.roleConfig.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  upsert(role: string, permissions: Record<string, unknown>) {
    return this.prisma.roleConfig.upsert({
      where: { role },
      update: { permissions: permissions as Prisma.InputJsonValue },
      create: { role, permissions: permissions as Prisma.InputJsonValue }
    });
  }
}
