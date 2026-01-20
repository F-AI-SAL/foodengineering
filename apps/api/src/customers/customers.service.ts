import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole } from "../common/enums/user-role.enum";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
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
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } })
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }
}
