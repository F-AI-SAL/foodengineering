import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCouponDto, UpdateCouponDto } from "./dto/coupon.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      this.prisma.coupon.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code ?? this.generateCode();
    return this.prisma.coupon.create({
      data: {
        name: dto.name,
        code,
        type: dto.type as any,
        value: dto.value,
        minPurchase: dto.minPurchase,
        maxDiscount: dto.maxDiscount,
        perUserLimit: dto.perUserLimit,
        totalLimit: dto.totalLimit,
        startAt: dto.startAt ? new Date(dto.startAt) : null,
        endAt: dto.endAt ? new Date(dto.endAt) : null,
        segmentIds: dto.segmentIds ?? [],
        stackable: dto.stackable ?? true,
        isPublic: dto.isPublic
      }
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.ensureExists(id);
    return this.prisma.coupon.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type as any,
        value: dto.value,
        minPurchase: dto.minPurchase,
        maxDiscount: dto.maxDiscount,
        perUserLimit: dto.perUserLimit,
        totalLimit: dto.totalLimit,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        segmentIds: dto.segmentIds,
        stackable: dto.stackable,
        isPublic: dto.isPublic,
        isActive: dto.isActive
      }
    });
  }

  async sendToSegment(id: string, segmentIds: string[]) {
    await this.ensureExists(id);
    return {
      status: "queued",
      message: "Coupon distribution queued",
      segmentIds
    };
  }

  async exportRedemptions(id: string) {
    await this.ensureExists(id);
    const redemptions = await this.prisma.redemption.findMany({ where: { couponId: id } });
    return { count: redemptions.length, rows: redemptions };
  }

  private async ensureExists(id: string) {
    const record = await this.prisma.coupon.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException("Coupon not found");
    }
  }

  private generateCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segment = () =>
      Array.from({ length: 4 })
        .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
        .join("");
    return `${segment()}-${segment()}`;
  }
}
