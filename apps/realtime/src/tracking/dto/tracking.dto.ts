import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export enum TrackingStatus {
  pending = "pending",
  confirmed = "confirmed",
  preparing = "preparing",
  ready = "ready",
  on_delivery = "on_delivery",
  delivered = "delivered",
  cancelled = "cancelled"
}

export class TrackingSubscribeDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;
}

export class TrackingUpdateDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsOptional()
  @IsString()
  riderId?: string;

  @IsOptional()
  @IsEnum(TrackingStatus)
  status?: TrackingStatus;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}
