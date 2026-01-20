import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AssignRiderDto } from "./dto/assign-rider.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        include: {
          items: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      this.prisma.order.count()
    ]);

    return buildPaginatedResult(data, total, page, pageSize);
  }

  async create(dto: CreateOrderDto) {
    const total = dto.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return this.prisma.order.create({
      data: {
        customerId: dto.customerId,
        deliveryAddress: dto.deliveryAddress,
        total,
        items: {
          create: dto.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.ensureExists(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status }
    });
  }

  async assignRider(id: string, dto: AssignRiderDto) {
    await this.ensureExists(id);
    return this.prisma.order.update({
      where: { id },
      data: { assignedRiderId: dto.riderId ?? null }
    });
  }

  private async ensureExists(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
  }
}
