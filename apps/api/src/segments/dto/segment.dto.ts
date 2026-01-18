import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  definitionJson!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isDynamic?: boolean;
}

export class UpdateSegmentDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  definitionJson?: Record<string, unknown>;

  @IsOptional()
  isDynamic?: boolean;
}
