//src/features/auth/auth.types.ts

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
  systemRole: SystemRole; // This field might not be in the actual token but is useful for type consistency.
}

// --- Service Input DTOs ---

// ✅ UPDATED: This DTO is now simpler, only requiring email and password.
export interface SignUpInputDto {
  email: string;
  password: string;
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
