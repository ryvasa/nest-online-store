import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class LoginData {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  id: string;

  @ApiProperty({ type: String, example: 'johndoe' })
  username: string;

  @ApiProperty({ type: String, example: 'john' })
  firstName: string;

  @ApiProperty({ type: String, example: 'doe' })
  lastName: string;

  @ApiProperty({ type: String, example: '0987654321' })
  phone: string;

  @ApiProperty({ type: String, example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ type: Date, example: '2024-08-22T06:58:54.173Z' })
  createdDate: Date;

  @ApiProperty({ type: Date, example: '2024-08-22T06:58:54.173Z' })
  updatedDate: Date;

  @ApiProperty({
    type: String,
    example:
      'w1SaKdd2ggOh3jSkIk4Aopp5lN5mmnDb6vMc7c8CxI9s0sWw0wYe0rtyU0uEuWi2ii669Yy8r83w8w84weUItKt',
  })
  accessToken: string;
}

export class LoginResponse {
  @ApiProperty({ type: LoginData })
  data: LoginData;
}

export class CurrentUser {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export class GoogleAuthRequest {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  username: string;
  picture: string;
}
export class RequestWithGoogleCredential extends Request {
  user: GoogleAuthRequest;
}
export class RequestWithCredential extends Request {
  user: User;
}

export class MessageData {
  @ApiProperty({ type: String, example: 'User has been logout' })
  message: string;
}

export class MessageResponse {
  @ApiProperty({ type: MessageData })
  data: MessageData;
}

export class RefreshData {
  @ApiProperty({
    type: String,
    example:
      'w1SaKdd2ggOh3jSkIk4Aopp5lN5mmnDb6vMc7c8CxI9s0sWw0wYe0rtyU0uEuWi2ii669Yy8r83w8w84weUItKt',
  })
  accessToken: string;
}
export class RefreshResponse {
  @ApiProperty({ type: RefreshData })
  data: RefreshData;
}
