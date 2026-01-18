import { IsOptional, IsString } from "class-validator";

export class AssignRiderDto {
  @IsOptional()
  @IsString()
  riderId?: string;
}
