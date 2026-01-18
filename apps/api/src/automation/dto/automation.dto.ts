import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAutomationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  triggerType!: string;

  triggerConfigJson!: Record<string, unknown>;

  @IsString()
  actionType!: string;

  actionConfigJson!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAutomationDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  triggerType?: string;

  @IsOptional()
  triggerConfigJson?: Record<string, unknown>;

  @IsOptional()
  actionType?: string;

  @IsOptional()
  actionConfigJson?: Record<string, unknown>;

  @IsOptional()
  isActive?: boolean;
}
