// src/features/checkIn/checkIn.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { checkInService } from "./checkIn.service.js";

class CheckInController {
  checkIn = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await checkInService.checkInUser(req.body, userId);

    res.status(200).json({
      status: "success",
      data: result,
    });
  });
}

export const checkInController = new CheckInController();
