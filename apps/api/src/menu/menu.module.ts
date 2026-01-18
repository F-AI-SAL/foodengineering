import { Module } from "@nestjs/common";
import { MenuService } from "./menu.service";
import { MenuController } from "./menu.controller";
import { MenuGateway } from "./menu.gateway";

@Module({
  controllers: [MenuController],
  providers: [MenuService, MenuGateway]
})
export class MenuModule {}
