//src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
const isDevelopment = process.env.NODE_ENV === "development";

// ✅ ADDED: A more lenient limiter specifically for map routes.
export const mapApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Allow more map-related requests
  message:
    "Too many map requests from this IP, please try again after 15 minutes.",
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// A general limiter for most API routes to prevent abuse.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes.",
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// A stricter limiter for sensitive authentication routes.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 10, // 100 requests for dev, 10 for production
  message:
    "Too many login or registration attempts from this IP, please try again after 15 minutes.",
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
