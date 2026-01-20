import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationQuery } from "./dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "./pagination";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip, take }),
      this.prisma.auditLog.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }
}
