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

export interface RequestWithCredential extends Request {
  user: CurrentUser;
}
