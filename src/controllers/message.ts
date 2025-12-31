/**
 * @packageDocumentation
 * @module controllers/message
 * @since 1.0.0 (2025-12-31)
 * @author Z-kali
 * @description 消息管理控制器（HTTP API）
 */

import type { Request, Response } from "express";
import { Message, ConversationMember, Conversation } from "@/models";
import type { AuthRequest } from "@/middleware/auth/require";
import { uuid4 } from "@/utils/common/generate/uuid";

/**
 * @function sendMessage
 * @description 发送消息
 * - 自动生成 msgId (UUID)
 * - 自动注入 senderId (当前用户ID)
 * - 自动生成 seq (会话内序列号)
 * - 验证用户是否有权限发送
 */
export async function sendMessage(req: Request, res: Response): Promise<void> {
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

    const { conversationId, content, kind, clientMsgId, attachments, mentionedUserIds, repliedMessageId } = req.body;

    // 校验必需参数
    if (!conversationId) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "conversationId is required",
        status: 400
      });
      return;
    }

    if (!content && (!attachments || attachments.length === 0)) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "content or attachments is required",
        status: 400
      });
      return;
    }

    // 验证用户是否是会话成员
    const member = await ConversationMember.findOne({
      where: { conversationId, userId }
    });

    if (!member) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "You are not a member of this conversation",
        status: 403
      });
      return;
    }

    // 检查会话是否存在
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      res.status(404).json({
        code: "NOT_FOUND",
        message: "Conversation not found",
        status: 404
      });
      return;
    }

    // 自动生成 msgId
    const msgId = uuid4();

    // 自动生成 seq (查询会话最大seq + 1)
    const maxSeq = await Message.max("seq", {
      where: { conversationId }
    });
    const seq = (maxSeq as number || 0) + 1;

    // 创建消息
    const message = await Message.create({
      msgId,
      conversationId,
      senderId: userId,
      kind: kind || "text",
      content: content || null,
      attachments: attachments || [],
      mentionedUserIds: mentionedUserIds || [],
      repliedMessageId: repliedMessageId || null,
      clientMsgId: clientMsgId || null,
      seq,
      serverReceivedAt: new Date(),
      deletedForAll: false,
      edited: false,
      deleted: false
    });

    // 更新会话的最后消息信息
    await conversation.update({
      lastMessageId: message.id,
      lastMessageAt: message.createdAt
    });

    // 更新其他成员的未读数
    await ConversationMember.increment("unreadCount", {
      by: 1,
      where: {
        conversationId,
        userId: { [require("sequelize").Op.ne]: userId }
      }
    });

    res.status(201).json({
      code: "SUCCESS",
      message: "Message sent",
      data: {
        id: message.id,
        msgId: message.msgId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        kind: message.kind,
        content: message.content,
        attachments: message.attachments,
        mentionedUserIds: message.mentionedUserIds,
        repliedMessageId: message.repliedMessageId,
        clientMsgId: message.clientMsgId,
        seq: message.seq,
        serverReceivedAt: message.serverReceivedAt,
        createdAt: message.createdAt
      },
      status: 201
    });
  } catch (error: any) {
    console.error("[sendMessage] Error:", error);
    res.status(500).json({
      code: error.name || "INTERNAL_ERROR",
      message: error.message || "Failed to send message",
      status: 500
    });
  }
}
