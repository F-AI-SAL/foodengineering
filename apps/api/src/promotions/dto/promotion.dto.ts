import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  startAt?: string;

  @IsOptional()
  endAt?: string;

  @IsBoolean()
  stackable!: boolean;

  @IsInt()
  priority!: number;

  rulesJson!: Record<string, unknown>;

  @IsOptional()
  scheduleJson?: Record<string, unknown>;

  @IsOptional()
  budgetCap?: number;

  @IsOptional()
  maxDiscount?: number;
}

export class UpdatePromotionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  startAt?: string;

  @IsOptional()
  endAt?: string;

  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  rulesJson?: Record<string, unknown>;

  @IsOptional()
  scheduleJson?: Record<string, unknown>;

  @IsOptional()
  budgetCap?: number;

  @IsOptional()
  maxDiscount?: number;

  @IsOptional()
  status?: string;
}
