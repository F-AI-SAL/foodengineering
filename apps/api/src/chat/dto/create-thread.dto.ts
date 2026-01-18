import { IsEnum, IsOptional, IsString } from "class-validator";
import { ChatThreadStatus } from "../../common/enums/chat-thread-status.enum";

export class CreateChatThreadDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsEnum(ChatThreadStatus)
  status?: ChatThreadStatus;
}
