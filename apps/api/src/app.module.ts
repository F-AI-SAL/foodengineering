import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import configuration from "./config/configuration";
import { PrismaModule } from "./prisma/prisma.module";
import { OrdersModule } from "./orders/orders.module";
import { ReservationsModule } from "./reservations/reservations.module";
import { MenuModule } from "./menu/menu.module";
import { RidersModule } from "./riders/riders.module";
import { CustomersModule } from "./customers/customers.module";
import { ChatModule } from "./chat/chat.module";
import { RolesModule } from "./roles/roles.module";
import { PromotionsModule } from "./promotions/promotions.module";
import { CouponsModule } from "./coupons/coupons.module";
import { LoyaltyModule } from "./loyalty/loyalty.module";
import { SegmentsModule } from "./segments/segments.module";
import { AutomationModule } from "./automation/automation.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { PricingModule } from "./pricing/pricing.module";
import { GrowthModule } from "./growth/growth.module";
import { CommonModule } from "./common/common.module";
import { SettingsModule } from "./settings/settings.module";
import { AuthModule } from "./auth/auth.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [".env.local", ".env"]
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    OrdersModule,
    ReservationsModule,
    MenuModule,
    RidersModule,
    CustomersModule,
    ChatModule,
    RolesModule,
    CommonModule,
    PromotionsModule,
    CouponsModule,
    LoyaltyModule,
    SegmentsModule,
    AutomationModule,
    AnalyticsModule,
    PricingModule,
    GrowthModule,
    SettingsModule,
    AuthModule,
    UploadsModule
  ]
})
export class AppModule {}
