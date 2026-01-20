import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole } from "../common/enums/user-role.enum";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        dob: true,
        role: true,
        createdAt: true
      },
      where: { role: UserRole.CUSTOMER },
      orderBy: { createdAt: "desc" }
    });
  }
}
