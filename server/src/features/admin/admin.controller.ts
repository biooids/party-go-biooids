// src/features/admin/admin.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { adminService } from "./admin.service.js";
import { SystemRole } from "../../types/user.types.js"; // ✅ 1. Import SystemRole

class AdminController {
  // === Super Admin Controllers ===

  listAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    const users = await adminService.listAllUsers(page, limit);
    res.status(200).json({ status: "success", data: { users } });
  });

  changeUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    // ✅ 2. Get the actor (the admin performing the action) from the request
    const actor = {
      id: req.user!.id,
      systemRole: req.user!.systemRole as SystemRole,
    };
    // ✅ 3. Pass the actor to the service method
    const updatedUser = await adminService.changeUserRole(
      userId,
      req.body,
      actor
    );
    res.status(200).json({ status: "success", data: { user: updatedUser } });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const actor = {
      id: req.user!.id,
      systemRole: req.user!.systemRole as SystemRole,
    };
    await adminService.deleteUser(userId, actor);
    res.status(204).send();
  });

  // === Admin & Super Admin Controllers ===

  banUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const actor = {
      id: req.user!.id,
      systemRole: req.user!.systemRole as SystemRole,
    };
    const bannedUser = await adminService.banUser(userId, req.body, actor);
    res.status(200).json({ status: "success", data: { user: bannedUser } });
  });

  unbanUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const actor = {
      id: req.user!.id,
      systemRole: req.user!.systemRole as SystemRole,
    };
    const unbannedUser = await adminService.unbanUser(userId, actor);
    res.status(200).json({ status: "success", data: { user: unbannedUser } });
  });

  listPendingEvents = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const events = await adminService.listPendingEvents(page, limit);
    res.status(200).json({ status: "success", data: { events } });
  });

  approveEvent = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const approvedEvent = await adminService.approveEvent(eventId);
    res.status(200).json({ status: "success", data: { event: approvedEvent } });
  });

  rejectEvent = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const rejectedEvent = await adminService.rejectEvent(eventId);
    res.status(200).json({ status: "success", data: { event: rejectedEvent } });
  });

  // === Verification Request Controllers ===

  listPendingVerificationRequests = asyncHandler(
    async (req: Request, res: Response) => {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;
      const requests = await adminService.listPendingVerificationRequests(
        page,
        limit
      );
      res.status(200).json({ status: "success", data: { requests } });
    }
  );

  approveVerificationRequest = asyncHandler(
    async (req: Request, res: Response) => {
      const { requestId } = req.params;
      const request = await adminService.approveVerificationRequest(requestId);
      res.status(200).json({
        status: "success",
        message: "Verification request approved.",
        data: { request },
      });
    }
  );

  rejectVerificationRequest = asyncHandler(
    async (req: Request, res: Response) => {
      const { requestId } = req.params;
      const request = await adminService.rejectVerificationRequest(requestId);
      res.status(200).json({
        status: "success",
        message: "Verification request rejected.",
        data: { request },
      });
    }
  );
}

export const adminController = new AdminController();
