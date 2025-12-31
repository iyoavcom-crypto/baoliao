/**
 * @packageDocumentation
 * @module controllers/ws/conversation.controller
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 会话控制器
 */

import type { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import type {
  ConversationTypingReqData,
  ConversationTypingPushData,
} from "@/types/ws/events";
import { connectionManager } from "@/routes/ws/connection-manager";
import { createAckEvent, createPushEvent, createErrorEvent } from "@/routes/ws/protocol";
import { WS_ERROR_CODES } from "@/constants/ws/errors";
import {
  CONVERSATION_TYPING_PUSH,
} from "@/constants/ws/events";
import { ConversationMember } from "@/models";
import { Conversation, User, UserFriend } from "@/models";
import { getLogger } from "@/tools/logging";

const logger = getLogger("ws:conversation");

// 输入状态缓存：conversationId -> Map<userId, timeout>
const typingState = new Map<number, Map<string, NodeJS.Timeout>>();

/**
 * @function handleTyping
 * @description 处理输入状态通知
 */
export async function handleTyping(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(
      JSON.stringify(
        createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)
      )
    );
    return;
  }

  const data = event.data as ConversationTypingReqData;

  if (!data || !data.conversationId || typeof data.typing !== "boolean") {
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.INVALID_REQUEST,
          "conversationId and typing are required",
          event.requestId
        )
      )
    );
    return;
  }

  try {
    // 验证用户是否是会话成员
    const member = await ConversationMember.findOne({
      where: { conversationId: data.conversationId, userId },
    });

    if (!member) {
      socket.send(
        JSON.stringify(
          createErrorEvent(
            WS_ERROR_CODES.NOT_MEMBER,
            "You are not a member of this conversation",
            event.requestId
          )
        )
      );
      return;
    }

    // 获取或创建会话的输入状态映射
    if (!typingState.has(data.conversationId)) {
      typingState.set(data.conversationId, new Map());
    }
    const conversationTyping = typingState.get(data.conversationId)!;

    // 如果正在输入
    if (data.typing) {
      // 清除之前的超时定时器
      const existingTimeout = conversationTyping.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // 设置5秒后自动取消输入状态
      const timeout = setTimeout(() => {
        conversationTyping.delete(userId);
        
        // 推送停止输入状态
        pushTypingStatus(data.conversationId, userId, false);
      }, 5000);

      conversationTyping.set(userId, timeout);
    } else {
      // 停止输入
      const existingTimeout = conversationTyping.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        conversationTyping.delete(userId);
      }
    }

    // 推送输入状态给会话其他成员
    pushTypingStatus(data.conversationId, userId, data.typing);

    logger.debug("[WS] Typing status updated", {
      conversationId: data.conversationId,
      userId,
      typing: data.typing,
    });
  } catch (error: any) {
    logger.error("[WS] Failed to handle typing status", { error: error.message });
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.INTERNAL_ERROR,
          error.message || "Failed to handle typing status",
          event.requestId
        )
      )
    );
  }
}

/**
 * @function pushTypingStatus
 * @description 推送输入状态给会话其他成员
 */
async function pushTypingStatus(
  conversationId: number,
  userId: string,
  typing: boolean
): Promise<void> {
  try {
    // 获取会话成员
    const members = await ConversationMember.findAll({
      where: { conversationId },
      attributes: ["userId"],
    });

    const pushData: ConversationTypingPushData = {
      conversationId,
      userId,
      typing,
      timestamp: Date.now(),
    };

    // 推送给除了当前用户外的所有成员
    for (const m of members) {
      if (m.userId !== userId) {
        connectionManager.pushToUser(
          m.userId,
          createPushEvent(CONVERSATION_TYPING_PUSH, pushData)
        );
      }
    }
  } catch (error: any) {
    logger.error("[WS] Failed to push typing status", { error: error.message });
  }
}

/**
 * @function clearUserTypingState
 * @description 清除用户在所有会话中的输入状态（用户断开连接时调用）
 */
export function clearUserTypingState(userId: string): void {
  for (const [conversationId, conversationTyping] of typingState.entries()) {
    const timeout = conversationTyping.get(userId);  if (timeout) {
      clearTimeout(timeout);
      conversationTyping.delete(userId);
      
      // 推送停止输入状态
      pushTypingStatus(conversationId, userId, false);
    }
  }
}

/**
 * @function handleCreate
 * @description 处理创建会话（私聊或群聊）
 */
export async function handleCreate(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // ConversationCreateReqData
  if (!data || (!data.targetUserId && !data.groupId)) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "targetUserId or groupId is required", event.requestId)));
    return;
  }

  try {
    let conversation: any;
    let type: 'private' | 'group';

    if (data.targetUserId) {
      // 私聊：检查是否是好友
      const friendship = await UserFriend.findOne({
        where: { userId, friendId: data.targetUserId, status: 'accepted' }
      });

      if (!friendship) {
        socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.FRIEND_NOT_FOUND, "Not friends", event.requestId)));
        return;
      }

      // 检查是否已存在私聊会话
      const existingConv = await Conversation.findOne({
        include: [
          {
            model: ConversationMember,
            as: 'members',
            where: { userId: [userId, data.targetUserId] },
            required: true
          }
        ]
      });

      if (existingConv) {
        // 返回已存在的会话
        const ackData: any = {
          conversationId: existingConv.id,
          type: 'private',
          timestamp: Date.now()
        };
        socket.send(JSON.stringify(createAckEvent('conversation.create.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));
        return;
      }

      // 创建新的私聊会话
      conversation = await Conversation.create({
        lastMessageId: 0
      });

      // 添加两个成员
      await Promise.all([
        ConversationMember.create({
          conversationId: conversation.id,
          userId,
          role: 'member',
          joinedAt: new Date(),
          lastReadMessageId: 0,
          unreadCount: 0
        }),
        ConversationMember.create({
          conversationId: conversation.id,
          userId: data.targetUserId,
          role: 'member',
          joinedAt: new Date(),
          lastReadMessageId: 0,
          unreadCount: 0
        })
      ]);

      type = 'private';
    } else {
      // 群聊：查找群组对应的会话
      conversation = await Conversation.findOne({
        where: { groupId: data.groupId }
      });

      if (!conversation) {
        socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.CONVERSATION_NOT_FOUND, "Group conversation not found", event.requestId)));
        return;
      }

      type = 'group';
    }

    const timestamp = Date.now();
    const ackData: any = {
      conversationId: conversation.id,
      type,
      timestamp
    };

    socket.send(JSON.stringify(createAckEvent('conversation.create.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] Conversation created", { conversationId: conversation.id, type, userId });
  } catch (error: any) {
    logger.error("[WS] Failed to create conversation", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleList
 * @description 处理会话列表查询
 */
export async function handleList(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // ConversationListReqData
  const page = data?.page || 1;
  const limit = data?.limit || 20;

  try {
    const { Message, Group } = require('@/models');

    // 查找用户加入的所有会话
    const members = await ConversationMember.findAll({
      where: { userId },
      include: [
        {
          model: Conversation,
          as: 'conversation',
          required: true
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    const total = await ConversationMember.count({
      where: { userId }
    });

    const conversations = [];

    for (const member of members) {
      const conv = (member as any).conversation;
      if (!conv) continue;

      // 判断会话类型
      let type: 'private' | 'group' = 'private';
      let targetId: string | undefined;
      let groupId: number | undefined;

      if (conv.groupId) {
        type = 'group';
        groupId = conv.groupId;
      } else {
        // 私聊，查找对方用户
        const otherMember = await ConversationMember.findOne({
          where: {
            conversationId: conv.id,
            userId: { [require('sequelize').Op.ne]: userId }
          }
        });
        if (otherMember) {
          targetId = otherMember.userId;
        }
      }

      // 查找最后一条消息
      let lastMessage: any = undefined;
      if (conv.lastMessageId > 0) {
        const msg = await Message.findOne({
          where: {
            conversationId: conv.id,
            seq: conv.lastMessageId
          }
        });

        if (msg) {
          lastMessage = {
            msgId: msg.msgId,
            content: msg.content,
            senderId: msg.senderId,
            timestamp: msg.createdAt.getTime()
          };
        }
      }

      conversations.push({
        conversationId: conv.id,
        type,
        targetId,
        groupId,
        lastMessage,
        unreadCount: member.unreadCount || 0,
        lastReadMessageId: member.lastReadMessageId || 0,
        updatedAt: conv.updatedAt ? conv.updatedAt.getTime() : Date.now()
      });
    }

    const ackData: any = {
      conversations,
      total,
      timestamp: Date.now()
    };

    socket.send(JSON.stringify(createAckEvent('conversation.list.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] Conversation list retrieved", { userId, count: conversations.length, total });
  } catch (error: any) {
    logger.error("[WS] Failed to get conversation list", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}
