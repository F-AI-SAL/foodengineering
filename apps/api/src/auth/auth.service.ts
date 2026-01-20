import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import type { User } from "@prisma/client";

type SafeUser = Omit<User, "passwordHash">;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService
  ) {}

  async validateUser(email: string, password: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const { passwordHash, ...safe } = user;
    return safe;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, role: user.role, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: "If the account exists, a reset link was sent." };
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const response: { message: string; resetToken?: string } = {
      message: "If the account exists, a reset link was sent."
    };
    if (process.env.NODE_ENV !== "production") {
      response.resetToken = rawToken;
    }

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/admin/login?reset=${rawToken}`;
    const message = `Use this link to reset your password: ${resetUrl}`;

    await this.notificationsService.sendEmail({
      to: user.email,
      subject: "Reset your Food Engineering password",
      html: `<p>${message}</p>`,
      text: message
    });

    if (user.phone) {
      await this.notificationsService.sendWhatsApp({
        to: user.phone,
        body: message
      });
    }

    return response;
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Reset token is invalid or expired.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash }
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() }
      })
    ]);

    return { message: "Password reset successful." };
  }
}
