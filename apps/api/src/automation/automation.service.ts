import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAutomationDto, UpdateAutomationDto } from "./dto/automation.dto";
import { AutomationQueueService } from "./automation-queue.service";

@Injectable()
export class AutomationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: AutomationQueueService
  ) {}

  findAll() {
    return this.prisma.automationRule.findMany({
      include: { executions: true },
      orderBy: { createdAt: "desc" }
    });
  }

  create(dto: CreateAutomationDto) {
    return this.prisma.automationRule.create({
      data: {
        name: dto.name,
        triggerType: dto.triggerType as any,
        triggerConfigJson: dto.triggerConfigJson as Prisma.InputJsonValue,
        actionType: dto.actionType as any,
        actionConfigJson: dto.actionConfigJson as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true
      }
    });
  }

  async update(id: string, dto: UpdateAutomationDto) {
    await this.ensureExists(id);
    return this.prisma.automationRule.update({
      where: { id },
      data: {
        name: dto.name,
        triggerType: dto.triggerType as any,
        triggerConfigJson: dto.triggerConfigJson
          ? (dto.triggerConfigJson as Prisma.InputJsonValue)
          : undefined,
        actionType: dto.actionType as any,
        actionConfigJson: dto.actionConfigJson
          ? (dto.actionConfigJson as Prisma.InputJsonValue)
          : undefined,
        isActive: dto.isActive
      }
    });
  }

  async runNow(id: string) {
    await this.ensureExists(id);
    return this.queue.enqueue(id, { source: "manual", ruleId: id });
  }

  private async ensureExists(id: string) {
    const record = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException("Automation rule not found");
    }
  }
}
