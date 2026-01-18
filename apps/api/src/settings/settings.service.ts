import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertSettingDto } from "./dto/settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.setting.findMany({ orderBy: { key: "asc" } });
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
