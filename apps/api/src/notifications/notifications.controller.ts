import { Controller, Get, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  @Get("status")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  async status() {
    const [queued, failed, sent] = await Promise.all([
      this.prisma.notificationJob.count({ where: { status: "queued" } }),
      this.prisma.notificationJob.count({ where: { status: "failed" } }),
      this.prisma.notificationJob.count({ where: { status: "sent" } })
    ]);

    const latest = await this.prisma.notificationJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 8
    });

    return {
      providers: {
        email: this.notificationsService["emailProvider"],
        whatsapp: this.notificationsService["whatsappProvider"]
      },
      counts: { queued, failed, sent },
      latest
    };
  }
}
