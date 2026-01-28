import { IsEmail, IsOptional } from "class-validator";

export class NotificationTestDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}
