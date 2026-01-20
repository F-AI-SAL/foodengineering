import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationStatusDto } from "./dto/update-reservation-status.dto";
import { PaginationQuery } from "../common/dto/pagination.dto";
import { buildPaginatedResult, normalizePagination } from "../common/pagination";

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQuery) {
    const { page, pageSize, skip, take } = normalizePagination(query);
    const [data, total] = await Promise.all([
      this.prisma.reservation.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      this.prisma.reservation.count()
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  async create(dto: CreateReservationDto) {
    const dateTime = new Date(`${dto.date}T${dto.time}`);

    return this.prisma.reservation.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        date: dateTime,
        guests: dto.guests,
        notes: dto.notes
      }
    });
  }

  async updateStatus(id: string, dto: UpdateReservationStatusDto) {
    await this.ensureExists(id);
    return this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status }
    });
  }

  private async ensureExists(id: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new NotFoundException("Reservation not found");
    }
  }
}
