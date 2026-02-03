import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "../../common/enums/user-role.enum";

export class CreateChatMessageDto {
  @IsString()
  @IsNotEmpty()
  threadId!: string;

  @IsEnum(UserRole)
  senderRole!: UserRole;

  @IsString()
  @IsNotEmpty()
  senderName!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
