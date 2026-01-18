import { IsInt, IsOptional, IsString } from "class-validator";

export class AdjustPointsDto {
  @IsString()
  userId!: string;

  @IsInt()
  points!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
