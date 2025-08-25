// src/config/logger.ts

import pino from "pino";
import { config } from "./index.js";

// Determine the log level from environment variables
const level = config.logLevel;

// Define transport options based on the environment
const transport =
  config.nodeEnv === "development"
    ? // In development, use pino-pretty for human-readable, colorful logs
      pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss", // Human-readable time format
          ignore: "pid,hostname", // Don't show process ID and hostname
        },
      })
    : // In production, log as standard JSON (which is the default)
      undefined;

/**
 * The application's central logger instance.
 * It's configured to be environment-aware and to redact sensitive data.
 */
export const logger = pino(
  {
    level: level,
    // Redact sensitive information from logs automatically
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.email",
      "req.body.currentPassword",
      "req.body.newPassword",
    ],
  },
  transport
);

logger.info(`✅ Logger configured with level: '${level}'`);
