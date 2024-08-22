import { User } from '../../users/entities/user.entity';

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  createdDate: Date;
  updatedDate: Date;
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export interface GoogleAuthRequest {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  username: string;
  picture: string;
}
export interface RequestWithGoogleCredential extends Request {
  user: GoogleAuthRequest;
}
export interface RequestWithCredential extends Request {
  user: User;
}
