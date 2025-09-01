// src/features/auth/auth.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authService } from "./auth.service.js";
import { config } from "../../config/index.js";
import { createHttpError } from "../../utils/error.factory.js";

const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
  expiresAt: Date
) => {
  res.cookie(config.cookies.refreshTokenName, refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "none",
    expires: expiresAt,
  });
};

class AuthController {
  signup = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.registerUser(req.body);
    setRefreshTokenCookie(
      res,
      tokens.refreshToken,
      tokens.refreshTokenExpiresAt
    );
    res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      data: { user, accessToken: tokens.accessToken },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.loginUser(req.body);
    setRefreshTokenCookie(
      res,
      tokens.refreshToken,
      tokens.refreshTokenExpiresAt
    );
    res.status(200).json({
      status: "success",
      message: "Logged in successfully.",
      data: { user, accessToken: tokens.accessToken },
    });
  });

  refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies[config.cookies.refreshTokenName];
    const { newAccessToken, newRefreshToken, newRefreshTokenExpiresAt } =
      await authService.handleRefreshTokenRotation({ incomingRefreshToken });
    setRefreshTokenCookie(res, newRefreshToken, newRefreshTokenExpiresAt);
    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully.",
      data: { accessToken: newAccessToken },
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies[config.cookies.refreshTokenName];
    await authService.handleUserLogout({ incomingRefreshToken });
    res.clearCookie(config.cookies.refreshTokenName);
    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully." });
  });

  // ✅ REPLACED: This method now handles different OAuth providers.
  handleOAuth = asyncHandler(async (req: Request, res: Response) => {
    const { provider, code } = req.body;

    if (!provider || !code) {
      throw createHttpError(400, "Provider and code are required.");
    }

    let result;
    if (provider === "google") {
      result = await authService.handleGoogleSignIn(code);
    } else {
      throw createHttpError(400, "Unsupported OAuth provider.");
    }

    const { user, tokens } = result;

    setRefreshTokenCookie(
      res,
      tokens.refreshToken,
      tokens.refreshTokenExpiresAt
    );
    res.status(200).json({
      status: "success",
      data: { user, accessToken: tokens.accessToken },
    });
  });

  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await authService.revokeAllRefreshTokensForUser(userId);
    res.clearCookie(config.cookies.refreshTokenName);
    res.status(200).json({
      status: "success",
      message: "Successfully logged out of all devices.",
    });
  });
}

export const authController = new AuthController();
