import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpsertSettingDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  valueJson!: Record<string, unknown>;
}

export class UpdateRoleConfigDto {
  @IsOptional()
  permissions?: Record<string, unknown>;
}
