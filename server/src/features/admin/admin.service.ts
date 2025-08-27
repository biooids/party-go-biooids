// src/features/admin/admin.service.ts

import { User } from "../../db/mongo.js";
import Event from "../event/event.model.js";
import { EventStatus } from "../event/event.types.js";
import { createHttpError } from "../../utils/error.factory.js";
import { BanUserDto, UpdateUserRoleDto } from "./admin.types.js";
import { authService } from "../auth/auth.service.js";
import { logger } from "../../config/logger.js";
import { SystemRole } from "../../types/user.types.js";
import VerificationRequest, {
  VerificationStatus,
} from "../verificationRequest/verificationRequest.model.js";

export class AdminService {
  // === Super Admin Methods ===

  /**
   * (Super Admin) Retrieves a paginated list of all users.
   */
  async listAllUsers(page = 1, limit = 20) {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return users;
  }

  /**
   * (Super Admin) Changes a user's system role.
   */
  async changeUserRole(
    targetUserId: string,
    { systemRole }: UpdateUserRoleDto,
    actor: { id: string; systemRole: SystemRole } // ✅ 2. Accept the 'actor'
  ) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw createHttpError(404, "User not found.");
    }

    // ✅ 3. Add security check
    if (targetUser._id.toString() === actor.id) {
      throw createHttpError(400, "You cannot change your own role.");
    }
    if (targetUser.systemRole === SystemRole.SUPER_ADMIN) {
      throw createHttpError(403, "Cannot change the role of a Super Admin.");
    }

    targetUser.systemRole = systemRole;
    await targetUser.save();
    logger.info(
      { userId: targetUserId, newRole: systemRole },
      "User role updated."
    );
    return targetUser.toObject();
  }

  /**
   * (Super Admin) Deletes a user from the database.
   */
  async deleteUser(
    targetUserId: string,
    actor: { id: string; systemRole: SystemRole } // ✅ 2. Accept the 'actor'
  ) {
    const targetUser = await User.findById(targetUserId).lean();
    if (!targetUser) {
      throw createHttpError(404, "User not found.");
    }

    // ✅ 3. Add security check
    if (targetUser._id.toString() === actor.id) {
      throw createHttpError(400, "You cannot delete your own account.");
    }
    if (targetUser.systemRole === SystemRole.SUPER_ADMIN) {
      throw createHttpError(403, "A Super Admin account cannot be deleted.");
    }

    await User.findByIdAndDelete(targetUserId);
    logger.warn({ userId: targetUserId }, "User permanently deleted.");
    return { message: "User deleted successfully." };
  }

  // === Admin & Super Admin Methods ===

  /**
   * (Admin) Bans a user, logs them out of all devices, and records the reason.
   */
  async banUser(
    targetUserId: string,
    { banReason, bannedUntil }: BanUserDto,
    actor: { id: string; systemRole: SystemRole }
  ) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw createHttpError(404, "User not found.");
    }

    if (targetUser._id.toString() === actor.id) {
      throw createHttpError(400, "You cannot ban yourself.");
    }
    if (targetUser.systemRole === SystemRole.SUPER_ADMIN) {
      throw createHttpError(403, "A Super Admin cannot be banned.");
    }

    targetUser.isBanned = true;
    targetUser.banReason = banReason;
    targetUser.bannedUntil = bannedUntil || null;
    await targetUser.save();

    await authService.revokeAllRefreshTokensForUser(targetUserId);
    logger.warn(
      { userId: targetUserId, reason: banReason },
      "User has been banned."
    );
    return targetUser.toObject();
  }

  /**
   * (Admin) Un-bans a user.
   */
  // Corrected unbanUser function
  async unbanUser(
    targetUserId: string,
    actor: { id: string; systemRole: SystemRole }
  ) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw createHttpError(404, "User not found.");
    }

    if (targetUser._id.toString() === actor.id) {
      throw createHttpError(400, "You cannot unban yourself.");
    }

    if (targetUser.systemRole === SystemRole.SUPER_ADMIN) {
      throw createHttpError(403, "A Super Admin's status cannot be modified.");
    }

    targetUser.isBanned = false;
    targetUser.banReason = null;
    targetUser.bannedUntil = null;
    await targetUser.save();
    logger.info({ userId: targetUserId }, "User has been un-banned.");
    return targetUser.toObject();
  }
  /**
   * (Admin) Retrieves a paginated list of all events pending approval.
   */
  async listPendingEvents(page = 1, limit = 10) {
    const events = await Event.find({ status: EventStatus.PENDING })
      .populate("creatorId", "name username")
      .populate("categoryId", "name")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return events;
  }

  /**
   * (Admin) Approves a pending event.
   */
  async approveEvent(eventId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, "Event not found.");
    }
    if (event.status !== EventStatus.PENDING) {
      throw createHttpError(
        400,
        `Event is already in '${event.status}' status.`
      );
    }
    event.status = EventStatus.APPROVED;
    await event.save();
    logger.info({ eventId }, "Event approved.");
    return event.toObject();
  }

  /**
   * (Admin) Rejects a pending event.
   */
  async rejectEvent(eventId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, "Event not found.");
    }
    if (event.status !== EventStatus.PENDING) {
      throw createHttpError(
        400,
        `Event is already in '${event.status}' status.`
      );
    }
    event.status = EventStatus.REJECTED;
    await event.save();
    logger.warn({ eventId }, "Event rejected.");
    return event.toObject();
  }

  /**
   * (Admin) Retrieves a paginated list of all pending verification requests.
   */
  async listPendingVerificationRequests(page = 1, limit = 10) {
    const requests = await VerificationRequest.find({
      status: VerificationStatus.PENDING,
    })
      .populate("userId", "name username email")
      .populate("preferredCategories", "name")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return requests;
  }

  /**
   * (Admin) Approves a user's verification request.
   */
  async approveVerificationRequest(requestId: string) {
    const request = await VerificationRequest.findById(requestId);
    if (!request || request.status !== VerificationStatus.PENDING) {
      throw createHttpError(404, "Pending request not found.");
    }

    // Update the user's isVerifiedCreator status to true
    await User.findByIdAndUpdate(request.userId, { isVerifiedCreator: true });

    // Update the request's status to Approved
    request.status = VerificationStatus.APPROVED;
    await request.save();

    logger.info(
      { requestId, userId: request.userId },
      "Verification request approved."
    );
    return request.toObject();
  }

  /**
   * (Admin) Rejects a user's verification request.
   */
  async rejectVerificationRequest(requestId: string) {
    const request = await VerificationRequest.findById(requestId);
    if (!request || request.status !== VerificationStatus.PENDING) {
      throw createHttpError(404, "Pending request not found.");
    }

    // Update the request's status to Rejected
    request.status = VerificationStatus.REJECTED;
    await request.save();

    logger.warn(
      { requestId, userId: request.userId },
      "Verification request rejected."
    );
    return request.toObject();
  }

  /**
   * (Admin) Revokes a user's verified creator status.
   */
  async revokeCreatorStatus(
    targetUserId: string,
    actor: { id: string; systemRole: SystemRole }
  ) {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw createHttpError(404, "User not found.");
    }

    // Security check to prevent revoking Super Admins or self
    if (targetUser._id.toString() === actor.id) {
      throw createHttpError(400, "You cannot revoke your own creator status.");
    }
    if (targetUser.systemRole === SystemRole.SUPER_ADMIN) {
      throw createHttpError(403, "A Super Admin's status cannot be modified.");
    }

    targetUser.isVerifiedCreator = false;
    await targetUser.save();

    logger.warn(
      { targetUserId, actorId: actor.id },
      "User's creator status has been revoked."
    );
    return targetUser.toObject();
  }
}

export const adminService = new AdminService();
