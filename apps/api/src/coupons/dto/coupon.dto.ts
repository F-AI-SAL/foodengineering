import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  type!: string;

  @IsNumber()
  value!: number;

  @IsOptional()
  minPurchase?: number;

  @IsOptional()
  maxDiscount?: number;

  @IsOptional()
  perUserLimit?: number;

  @IsOptional()
  totalLimit?: number;

  @IsOptional()
  startAt?: string;

  @IsOptional()
  endAt?: string;

  @IsOptional()
  segmentIds?: string[];

  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @IsBoolean()
  isPublic!: boolean;
}

export class UpdateCouponDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  type?: string;

  @IsOptional()
  value?: number;

  @IsOptional()
  minPurchase?: number;

  @IsOptional()
  maxDiscount?: number;

  @IsOptional()
  perUserLimit?: number;

  @IsOptional()
  totalLimit?: number;

  @IsOptional()
  startAt?: string;

  @IsOptional()
  endAt?: string;

  @IsOptional()
  segmentIds?: string[];

  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @IsOptional()
  isPublic?: boolean;

  @IsOptional()
  isActive?: boolean;
}
