// src/features/auth/auth.types.ts

import { JwtPayload as OriginalJwtPayload } from "jsonwebtoken";
import { SystemRole } from "../../types/user.types.js";

// --- JWT Payloads ---
export interface DecodedAccessTokenPayload {
  id: string;
  systemRole: SystemRole;
  type: "access";
  iat: number;
  exp: number;
}

export interface DecodedRefreshTokenPayload extends OriginalJwtPayload {
  id: string;
  jti: string;
  type: "refresh";
  systemRole: SystemRole;
}

// --- Service Input DTOs ---
export interface SignUpInputDto {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface LoginInputDto {
  email: string;
  password: string;
}

export interface RefreshTokenInputDto {
  incomingRefreshToken: string;
}

export interface LogoutInputDto {
  incomingRefreshToken?: string | undefined;
}

// --- Service Output DTOs ---
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}
