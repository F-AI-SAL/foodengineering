import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateExperimentDto, CreateUpsellRuleDto } from "./dto/growth.dto";

@Injectable()
export class GrowthService {
  constructor(private readonly prisma: PrismaService) {}

  getUpsellRules() {
    return this.prisma.upsellRule.findMany({ orderBy: { createdAt: "desc" } });
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

  getExperiments() {
    return this.prisma.experiment.findMany({ include: { variants: true } });
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
