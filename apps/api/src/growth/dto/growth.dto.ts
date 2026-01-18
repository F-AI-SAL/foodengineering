import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUpsellRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  type!: string;

  conditionsJson!: Record<string, unknown>;
  actionsJson!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateExperimentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  hypothesis?: string;

  @IsString()
  primaryMetric!: string;

  trafficSplit!: Record<string, unknown>;
}
