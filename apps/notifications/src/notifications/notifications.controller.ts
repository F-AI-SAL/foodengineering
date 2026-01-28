import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NotificationsService } from "./notifications.service";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsQueue } from "./notifications.queue";
import { NotificationTestDto } from "./dto/notification-test.dto";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsQueue: NotificationsQueue,
    private readonly config: ConfigService
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

  @Post("test")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.OWNER)
  async sendTest(@Body() dto: NotificationTestDto) {
    const recipient = dto.email ?? this.config.get<string>("NOTIFICATION_TEST_EMAIL") ?? undefined;

    if (!recipient) {
      throw new BadRequestException("NOTIFICATION_TEST_EMAIL is not set.");
    }

    await this.notificationsQueue.enqueue("email", {
      to: recipient,
      subject: "Food Engineering notification test",
      text: "This is a test notification from Food Engineering.",
      html: "<p>This is a test notification from <strong>Food Engineering</strong>.</p>"
    });

    return { message: "Test email queued.", to: recipient };
  }
}
