import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoleConfigService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.roleConfig.findMany({ orderBy: { role: "asc" } });
  }

  upsert(role: string, permissions: Record<string, unknown>) {
    return this.prisma.roleConfig.upsert({
      where: { role },
      update: { permissions: permissions as Prisma.InputJsonValue },
      create: { role, permissions: permissions as Prisma.InputJsonValue }
    });
  }
}
