import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsQueue } from "./notifications.queue";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsQueue: NotificationsQueue
  ) {}

  @Get("status")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  async status(@Query("status") status?: string) {
    const [queued, failed, sent] = await Promise.all([
      this.prisma.notificationJob.count({ where: { status: "queued" } }),
      this.prisma.notificationJob.count({ where: { status: "failed" } }),
      this.prisma.notificationJob.count({ where: { status: "sent" } })
    ]);

    const statusFilter =
      status === "queued" || status === "failed" || status === "sent" ? status : undefined;

    const latest = await this.prisma.notificationJob.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 12
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

  @Post("retry")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  async retryFailed() {
    await this.prisma.notificationJob.updateMany({
      where: { status: "failed" },
      data: { status: "queued", scheduledAt: new Date() }
    });
    return { message: "Failed jobs re-queued." };
  }
}
