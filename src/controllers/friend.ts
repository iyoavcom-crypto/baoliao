/**
 * @packageDocumentation
 * @module controllers/friend
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 好友管理控制器
 */

import type { Request, Response } from "express";
import { UserFriend, FriendRequestEvent } from "@/models";
import type { AuthRequest } from "@/middleware/auth/require";
import { ok } from "@/middleware/requests/crud/ok";
import { fail } from "@/middleware/requests/crud/fail";
import { wrap } from "@/middleware/requests/crud/wrap";
import { validateAuthRequired, validateRequired, validateNotSelf } from "@/utils/validation/http-validation";

/**
 * @function addFriend
 * @description 发送好友申请
 */
export const addFriend = wrap(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const userId = validateAuthRequired(authReq, res);
  if (!userId) return;

  const { friendId, message, source } = req.body;
  
  if (!validateRequired(res, { friendId })) return;
  if (!validateNotSelf(res, userId, friendId, "Cannot add yourself as friend")) return;

  // 检查是否已经是好友
  const existing = await UserFriend.findOne({
    where: { userId, friendId }
  });

  if (existing) {
    res.status(409).json({
      code: "ALREADY_EXISTS",
      message: "Friend relationship already exists",
      status: 409
    });
    return;
  }

  // 创建好友申请事件
  const requestEvent = await FriendRequestEvent.create({
    fromId: userId,
    toId: friendId,
    message: message || null,
    status: "pending",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
  });

  // 创建待确认的好友关系
  const friend = await UserFriend.create({
    userId,
    friendId,
    status: "pending",
    requestedBy: userId,
    source: source || null
  });

  ok(res, {
    id: friend.id,
    requestId: requestEvent.id,
    userId,
    friendId,
    status: "pending"
  }, "Friend request sent", 201);
});

/**
 * @function acceptFriend
 * @description 接受好友申请
 */
export const acceptFriend = wrap(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const userId = validateAuthRequired(authReq, res);
  if (!userId) return;

  const requestId = req.params.id;

  // 查找好友申请
  const requestEvent = await FriendRequestEvent.findByPk(requestId);
  
  if (!requestEvent) {
    const error: any = new Error("Friend request not found");
    error.status = 404;
    throw error;
  }

  // 验证是申请的接收方
  if (requestEvent.toId !== userId) {
    res.status(403).json({
      code: "FORBIDDEN",
      message: "You are not the recipient of this request",
      status: 403
    });
    return;
  }

  // 检查申请状态
  if (requestEvent.status !== "pending") {
    res.status(400).json({
      code: "BAD_REQUEST",
      message: `Request already ${requestEvent.status}`,
      status: 400
    });
    return;
  }

  // 更新申请状态
  await requestEvent.update({
    status: "approved",
    reviewedAt: new Date()
  });

  // 更新好友关系状态（申请方的记录）
  await UserFriend.update(
    {
      status: "accepted",
      respondedAt: new Date()
    },
    {
      where: {
        userId: requestEvent.fromId,
        friendId: userId
      }
    }
  );

  // 创建反向好友关系（接受方的记录）
  await UserFriend.findOrCreate({
    where: {
      userId,
      friendId: requestEvent.fromId
    },
    defaults: {
      userId,
      friendId: requestEvent.fromId,
      status: "accepted",
      requestedBy: requestEvent.fromId,
      respondedAt: new Date()
    }
  });

  ok(res, {
    requestId: requestEvent.id,
    userId,
    friendId: requestEvent.fromId,
    status: "accepted"
  }, "Friend request accepted");
});
