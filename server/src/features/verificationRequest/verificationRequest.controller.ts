// src/features/verificationRequest/verificationRequest.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { verificationRequestService } from "./verificationRequest.service.js";

class VerificationRequestController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const request = await verificationRequestService.createRequest(
      req.body,
      userId
    );

    res.status(201).json({
      status: "success",
      message: "Your verification request has been submitted for review.",
      data: { request },
    });
  });

  getMyRequest = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const request = await verificationRequestService.findRequestByUserId(
      userId
    );
    res.status(200).json({
      status: "success",
      data: { request },
    });
  });
}

export const verificationRequestController =
  new VerificationRequestController();
