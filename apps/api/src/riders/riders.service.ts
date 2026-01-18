import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateRiderProfileDto } from "./dto/update-rider.dto";

@Injectable()
export class RidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.riderProfile.findMany({
      include: { user: true },
      orderBy: { updatedAt: "desc" }
    });
  }

  async updateProfile(userId: string, dto: UpdateRiderProfileDto) {
    await this.ensureProfile(userId);

    if (dto.name) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { name: dto.name }
      });
    }

    return this.prisma.riderProfile.update({
      where: { userId },
      data: {
        status: dto.status,
        currentLat: dto.lat,
        currentLng: dto.lng
      }
    });
  }

  private async ensureProfile(userId: string) {
    const profile = await this.prisma.riderProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException("Rider profile not found");
    }
  }
}
