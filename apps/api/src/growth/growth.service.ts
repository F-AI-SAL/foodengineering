import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateExperimentDto, CreateUpsellRuleDto } from "./dto/growth.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class GrowthService {
  constructor(private readonly prisma: PrismaService) {}

  async getUpsellRules(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.upsellRule.findMany({ orderBy: { createdAt: "desc" }, skip, take }),
      this.prisma.upsellRule.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  createUpsell(dto: CreateUpsellRuleDto) {
    return this.prisma.upsellRule.create({
      data: {
        name: dto.name,
        type: dto.type as any,
        conditionsJson: dto.conditionsJson as Prisma.InputJsonValue,
        actionsJson: dto.actionsJson as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true
      }
    });
  }

  async getExperiments(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.experiment.findMany({ include: { variants: true }, skip, take }),
      this.prisma.experiment.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  createExperiment(dto: CreateExperimentDto) {
    return this.prisma.experiment.create({
      data: {
        name: dto.name,
        hypothesis: dto.hypothesis,
        primaryMetric: dto.primaryMetric,
        trafficSplit: dto.trafficSplit as Prisma.InputJsonValue
      }
    });
  }
}
