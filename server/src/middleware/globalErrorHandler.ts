// src/middleware/globalErrorHandler.ts

import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { config } from "../config/index.js";
import { HttpError } from "../utils/HttpError.js";
import { logger } from "../config/logger.js";
import { MulterError } from "multer";

export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "An internal server error occurred.";
  let status = "error";

  logger.error({ err }, "💥 Global Error Handler Caught");

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  } else if (err instanceof ZodError) {
    statusCode = 400;
    const firstError = err.issues[0]?.message;

    message = firstError || "Invalid input provided.";
    status = "fail";
  } else if (err.name === "MongoServerError" && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode = 409;
    message = `A record with this ${field} already exists.`;
    status = "fail";
  } else if (err instanceof MulterError) {
    statusCode = 400;
    status = "fail";
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File is too large. The maximum allowed size is 5MB.";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files uploaded. Please check the limit.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = `An unexpected file was uploaded for the '${err.field}' field.`;
        break;
      default:
        message = "A file upload error occurred.";
        break;
    }
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Unauthorized: Your session has expired. Please log in again.";
    status = "fail";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Unauthorized: Invalid session token.";
    status = "fail";
  }

  const responsePayload: { status: string; message: string; stack?: string } = {
    status,
    message,
  };

  if (config.nodeEnv === "development" && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};
