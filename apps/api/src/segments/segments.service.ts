import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSegmentDto, UpdateSegmentDto } from "./dto/segment.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class SegmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.segment.findMany({ orderBy: { createdAt: "desc" }, skip, take }),
      this.prisma.segment.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  create(dto: CreateSegmentDto) {
    return this.prisma.segment.create({
      data: {
        name: dto.name,
        definitionJson: dto.definitionJson as Prisma.InputJsonValue,
        isDynamic: dto.isDynamic ?? true
      }
    });
  }

  async update(id: string, dto: UpdateSegmentDto) {
    await this.ensureExists(id);
    return this.prisma.segment.update({
      where: { id },
      data: {
        name: dto.name,
        definitionJson: dto.definitionJson
          ? (dto.definitionJson as Prisma.InputJsonValue)
          : undefined,
        isDynamic: dto.isDynamic
      }
    });
  }

  private async ensureExists(id: string) {
    const record = await this.prisma.segment.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException("Segment not found");
    }
  }
}
