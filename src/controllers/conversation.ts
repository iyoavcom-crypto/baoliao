/**
 * @packageDocumentation
 * @module controllers/conversation
 * @since 1.0.0 (2025-12-31)
 * @author Z-kali
 * @description 会话管理控制器（HTTP API）
 */

import type { Request, Response } from "express";
import { Conversation, ConversationMember, UserFriend } from "@/models";
import type { AuthRequest } from "@/middleware/auth/require";
import { uuid4 } from "@/utils/common/generate/uuid";

/**
 * @function createConversation
 * @description 创建会话
 * - 私聊：需要 targetUserId，检查好友关系
 * - 群聊：需要 groupId
 */
export async function createConversation(req: Request, res: Response): Promise<void> {
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

    const { targetUserId, groupId, kind } = req.body;

    // 校验参数
    if (!targetUserId && !groupId) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "targetUserId or groupId is required",
        status: 400
      });
      return;
    }

    // 自动生成 convId
    const convId = uuid4();

    if (targetUserId) {
      // 私聊
      if (userId === targetUserId) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: "Cannot create conversation with yourself",
          status: 400
        });
        return;
      }

      // 检查是否是好友
      const friendship = await UserFriend.findOne({
        where: { userId, friendId: targetUserId, status: "accepted" }
      });

      if (!friendship) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "You are not friends with the target user",
          status: 403
        });
        return;
      }

      // 生成私聊唯一键
      const directKey = [userId, targetUserId].sort().join("_");

      // 检查是否已存在私聊会话
      const existingConv = await Conversation.findOne({
        where: { directKey }
      });

      if (existingConv) {
        res.status(200).json({
          code: "SUCCESS",
          message: "Conversation already exists",
          data: {
            id: existingConv.id,
            convId: existingConv.convId,
            kind: existingConv.kind,
            directKey: existingConv.directKey,
            directUserA: existingConv.directUserA,
            directUserB: existingConv.directUserB,
            createdAt: existingConv.createdAt
          },
          status: 200
        });
        return;
      }

      // 创建私聊会话
      const conversation = await Conversation.create({
        convId,
        kind: "direct",
        directKey,
        directUserA: userId,
        directUserB: targetUserId
      });

      // 创建会话成员
      await Promise.all([
        ConversationMember.create({
          conversationId: conversation.id,
          userId,
          role: "member",
          joinedAt: new Date(),
          lastReadMessageId: 0,
          unreadCount: 0
        }),
        ConversationMember.create({
          conversationId: conversation.id,
          userId: targetUserId,
          role: "member",
          joinedAt: new Date(),
          lastReadMessageId: 0,
          unreadCount: 0
        })
      ]);

      res.status(201).json({
        code: "SUCCESS",
        message: "Conversation created",
        data: {
          id: conversation.id,
          convId: conversation.convId,
          kind: conversation.kind,
          directKey: conversation.directKey,
          directUserA: conversation.directUserA,
          directUserB: conversation.directUserB,
          createdAt: conversation.createdAt
        },
        status: 201
      });
      return;
    }

    if (groupId) {
      // 群聊：查找群组对应的会话
      const existingConv = await Conversation.findOne({
        where: { groupId }
      });

      if (existingConv) {
        res.status(200).json({
          code: "SUCCESS",
          message: "Group conversation already exists",
          data: {
            id: existingConv.id,
            convId: existingConv.convId,
            kind: existingConv.kind,
            groupId: existingConv.groupId,
            createdAt: existingConv.createdAt
          },
          status: 200
        });
        return;
      }

      // 创建群聊会话
      const conversation = await Conversation.create({
        convId,
        kind: kind || "group",
        groupId
      });

      res.status(201).json({
        code: "SUCCESS",
        message: "Group conversation created",
        data: {
          id: conversation.id,
          convId: conversation.convId,
          kind: conversation.kind,
          groupId: conversation.groupId,
          createdAt: conversation.createdAt
        },
        status: 201
      });
      return;
    }
  } catch (error: any) {
    console.error("[createConversation] Error:", error);
    res.status(500).json({
      code: error.name || "INTERNAL_ERROR",
      message: error.message || "Failed to create conversation",
      status: 500
    });
  }
}
