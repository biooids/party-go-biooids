//src/lib/features/auth/authTypes.ts
export enum SystemRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

// --- DTOs for API requests ---

export interface LoginInputDto {
  email: string;
  password: string;
}

// ✅ CORRECT: This remains simple because 'acceptTerms' is not sent to the API.
export interface SignUpInputDto {
  email: string;
  password: string;
}

// --- The user object shape from the backend ---
export interface SanitizedUserDto {
  _id: string;
  name: string;
  username: string;
  email: string;
  systemRole: SystemRole;
  profileImage?: string | null;
  bannerImage?: string | null;
  bio?: string | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  isVerifiedCreator: boolean;
  xp: number;
}

// --- API Response Shape ---
export interface LoginApiResponse {
  status: string;
  message: string;
  data: {
    user: SanitizedUserDto;
    accessToken: string;
  };
}
