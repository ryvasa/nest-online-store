import { ApiProperty } from '@nestjs/swagger';

export class UserData {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  id: string;

  @ApiProperty({ type: String, example: 'johndoe' })
  username: string;

  @ApiProperty({ type: String, example: 'john' })
  name: string;

  @ApiProperty({ type: String, example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ type: Date, example: '2024-08-22T06:58:54.173Z' })
  createdDate: Date;

  @ApiProperty({ type: Date, example: '2024-08-22T06:58:54.173Z' })
  updatedDate: Date;
}

export class UserResponse {
  @ApiProperty({ type: UserData })
  data: UserData;
}

export class ArrayUserResponse {
  @ApiProperty({ type: Array })
  data: UserData[];
}

export class MessageData {
  @ApiProperty({ type: String, example: 'User has been deleted' })
  message: string;
}

export class MessageResponse {
  @ApiProperty({ type: MessageData })
  data: MessageData;
}
