import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { RiderStatus } from "../../common/enums/rider-status.enum";

export class UpdateRiderStatusDto {
  @IsEnum(RiderStatus)
  status!: RiderStatus;
}

export class UpdateRiderLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class UpdateRiderProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RiderStatus)
  status?: RiderStatus;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
