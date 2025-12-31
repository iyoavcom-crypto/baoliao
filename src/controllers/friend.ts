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

/**
 * @function addFriend
 * @description 发送好友申请
 */
export async function addFriend(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    
    if (!userId) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
        status: 401
      });
      return;
    }

    const { friendId, message, source } = req.body;
    
    if (!friendId) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "friendId is required",
        status: 400
      });
      return;
    }

    // 不能添加自己为好友
    if (userId === friendId) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "Cannot add yourself as friend",
        status: 400
      });
      return;
    }

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

    res.status(201).json({
      code: "SUCCESS",
      message: "Friend request sent",
      data: {
        id: friend.id,
        requestId: requestEvent.id,
        userId,
        friendId,
        status: "pending"
      },
      status: 201
    });
  } catch (error: any) {
    console.error("[addFriend] Error:", error);
    res.status(500).json({
      code: error.name || "INTERNAL_ERROR",
      message: error.message || "Failed to send friend request",
      status: 500
    });
  }
}

/**
 * @function acceptFriend
 * @description 接受好友申请
 */
export async function acceptFriend(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    const requestId = req.params.id;
    
    if (!userId) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
        status: 401
      });
      return;
    }

    // 查找好友申请
    const requestEvent = await FriendRequestEvent.findByPk(requestId);
    
    if (!requestEvent) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "Friend request not found",
        status: 404
      });
      return;
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
    const reverseFriend = await UserFriend.findOrCreate({
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

    res.status(200).json({
      code: "SUCCESS",
      message: "Friend request accepted",
      data: {
        requestId: requestEvent.id,
        userId,
        friendId: requestEvent.fromId,
        status: "accepted"
      },
      status: 200
    });
  } catch (error: any) {
    console.error("[acceptFriend] Error:", error);
    res.status(500).json({
      code: error.name || "INTERNAL_ERROR",
      message: error.message || "Failed to accept friend request",
      status: 500
    });
  }
}
