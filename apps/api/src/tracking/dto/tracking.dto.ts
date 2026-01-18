import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "../../common/enums/order-status.enum";

export class TrackingSubscribeDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;
}

export class TrackingUpdateDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  riderId?: string;
}
