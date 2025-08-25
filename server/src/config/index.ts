// src/config/index.ts

import { config as dotenvConfig } from "dotenv";
import path from "path";
import { z } from "zod";

// Load environment variables from .env file
dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().positive("PORT must be a positive integer."),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL."),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required."),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required."),
  ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number().int().positive(),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required."),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive(),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "CLOUDINARY_CLOUD_NAME is required."),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required."),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET is required."),
});

/**
 * strongly-typed object is always returned or the process exits.
 */
function createConfig() {
  try {
    const parsedEnv = envSchema.parse(process.env);

    return {
      nodeEnv: parsedEnv.NODE_ENV,
      port: parsedEnv.PORT,
      databaseUrl: parsedEnv.DATABASE_URL,
      corsOrigin: parsedEnv.CORS_ORIGIN,
      logLevel: parsedEnv.LOG_LEVEL,
      jwt: {
        accessSecret: parsedEnv.ACCESS_TOKEN_SECRET,
        accessExpiresInSeconds: parsedEnv.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        refreshSecret: parsedEnv.REFRESH_TOKEN_SECRET,
        refreshExpiresInDays: parsedEnv.REFRESH_TOKEN_EXPIRES_IN_DAYS,
      },
      cloudinary: {
        cloudName: parsedEnv.CLOUDINARY_CLOUD_NAME,
        apiKey: parsedEnv.CLOUDINARY_API_KEY,
        apiSecret: parsedEnv.CLOUDINARY_API_SECRET,
      },
      cookies: {
        refreshTokenName: "jid",
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:", error.format());
    } else {
      console.error(
        "❌ Critical error during application configuration setup:",
        error
      );
    }
    process.exit(1);
  }
}

// Export a constant 'config' that is the result of the function call.
// This ensures its type is correctly inferred and exported.
export const config = createConfig();

export type AppConfig = typeof config;
