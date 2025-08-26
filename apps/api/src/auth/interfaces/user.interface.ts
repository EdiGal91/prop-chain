export interface User {
  address: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface JwtPayload {
  address: string;
  iat?: number;
  exp?: number;
}
