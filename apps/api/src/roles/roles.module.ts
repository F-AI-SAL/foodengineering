import { Global, Module } from "@nestjs/common";
import { RolesGuard } from "./roles.guard";
import { RoleConfigService } from "./role-config.service";
import { RoleConfigController } from "./role-config.controller";

@Global()
@Module({
  providers: [RolesGuard, RoleConfigService],
  controllers: [RoleConfigController],
  exports: [RolesGuard, RoleConfigService]
})
export class RolesModule {}
