import { IsIn, IsObject } from "class-validator";

export class NotificationQueueDto {
  @IsIn(["email", "whatsapp"])
  channel!: "email" | "whatsapp";

  @IsObject()
  payload!: Record<string, unknown>;
}
