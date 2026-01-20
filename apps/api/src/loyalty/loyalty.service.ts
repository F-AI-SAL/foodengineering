import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdjustPointsDto } from "./dto/loyalty.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getTiers() {
    const record = await this.prisma.setting.findUnique({ where: { key: "loyalty_tiers" } });
    const tiers =
      (record?.valueJson as Record<string, { minPoints: number; multiplier: number }> | undefined) ??
      {};

    const fallback = {
      bronze: { minPoints: 0, multiplier: 1 },
      silver: { minPoints: 500, multiplier: 1.25 },
      gold: { minPoints: 1500, multiplier: 1.5 },
      platinum: { minPoints: 5000, multiplier: 2 }
    };

    const normalized = Object.keys(fallback).map((tier) => ({
      tier,
      minPoints: tiers[tier]?.minPoints ?? fallback[tier as keyof typeof fallback].minPoints,
      multiplier: tiers[tier]?.multiplier ?? fallback[tier as keyof typeof fallback].multiplier
    }));

    return normalized;
  }

  async getMembers(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.customerProfile.findMany({
        include: { user: true },
        orderBy: { points: "desc" },
        skip,
        take
      }),
      this.prisma.customerProfile.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  async adjustPoints(dto: AdjustPointsDto) {
    return this.prisma.customerProfile.upsert({
      where: { userId: dto.userId },
      create: {
        userId: dto.userId,
        points: dto.points
      },
      update: {
        points: { increment: dto.points }
      }
    });
  }
}
