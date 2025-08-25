// src/config/corsOptions.ts

import { CorsOptions } from "cors";
import { config } from "./index.js";
import { createHttpError } from "../utils/error.factory.js";
import { logger } from "./logger.js";

const allowedOrigins = config.corsOrigin
  .split(",")
  .map((origin: string) => origin.trim());

logger.info({ origins: allowedOrigins }, "✅ Configured Allowed CORS origins");

export const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(
        { blockedOrigin: origin, allowed: allowedOrigins },
        `🚫 CORS: Origin was blocked`
      );
      callback(
        createHttpError(403, `This origin is not allowed by CORS policy.`)
      );
    }
  },
  credentials: true,
};
