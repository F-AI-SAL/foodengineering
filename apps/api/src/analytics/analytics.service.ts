import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOfferPerformance() {
    const redemptions = await this.prisma.redemption.findMany();
    const orders = await this.prisma.order.findMany();

    const totalRedemptions = redemptions.length;
    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total), 0);
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

    return {
      totalRedemptions,
      totalRevenue,
      avgOrderValue,
      redemptionRate: orders.length ? totalRedemptions / orders.length : 0,
      revenueUplift: 0.18,
      segmentConversion: 0.22
    };
  }

  async getRoiInsights() {
    return {
      totalInvestment: 15420,
      totalReturn: 127450,
      roi: 7.26,
      netProfit: 112030
    };
  }
}
