/**
 * @packageDocumentation
 * @module controllers/ws/message.controller
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 消息控制器
 */

import type { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import type {
  MessageSendReqData,
  MessageSendAckData,
  MessagePushData,
  MessageRecallReqData,
  MessageRecalledPushData,
  MessageReadReqData,
  MessageReadAckData,
  MessageReadPushData,
} from "@/types/ws/events";
import { connectionManager } from "@/routes/ws/connection-manager";
import { createAckEvent, createPushEvent, createErrorEvent } from "@/routes/ws/protocol";
import { WS_ERROR_CODES } from "@/constants/ws/errors";
import {
  MESSAGE_SEND_ACK,
  MESSAGE_PUSH,
  MESSAGE_RECALL_ACK,
  MESSAGE_RECALLED_PUSH,
  MESSAGE_READ_ACK,
  MESSAGE_READ_PUSH,
  MESSAGE_EDIT_ACK,
  MESSAGE_EDITED_PUSH,
  MESSAGE_HISTORY_PULL_ACK,
} from "@/constants/ws/events";
import { Message, ConversationMember } from "@/models";
import { getLogger } from "@/tools/logging";
import { uuid4 } from "@/utils/common/generate/uuid";
import { 
  wsRequireAuth, 
  wsValidateRequired, 
  wsHandleError, 
  wsValidateCustom,
  wsSendError 
} from "@/utils/validation/ws-validation";

const logger = getLogger("ws:message");

/**
 * @function handleSend
 * @description 处理消息发送请求
 */
export async function handleSend(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = wsRequireAuth(socket, event);
  if (!userId) return;

  const data = event.data as MessageSendReqData;
  if (!wsValidateRequired(socket, event, { 
    conversationId: data?.conversationId, 
    content: data?.content 
  })) return;

  await wsHandleError(socket, event, async () => {
    // 验证权限（用户是否是会话成员）
    const member = await ConversationMember.findOne({
      where: { conversationId: data.conversationId, userId },
    });

    if (!wsValidateCustom(
      socket, 
      event, 
      !!member, 
      WS_ERROR_CODES.NOT_MEMBER, 
      "You are not a member of this conversation"
    )) return;

    // 生成消息ID和序列号
    const msgId = uuid4();
    const maxSeq = await Message.max("seq", {
      where: { conversationId: data.conversationId },
    });
    const seq = (maxSeq as number || 0) + 1;

    // 存储消息
    const message = await Message.create({
      msgId,
      conversationId: data.conversationId,
      senderId: userId,
      content: data.content,
      kind: (data.type as any) || "text",
      seq,
      deletedForAll: false,
      edited: false,
      deleted: false,
    });

    // 返回 ACK 给发送者
    const ackData: MessageSendAckData = {
      msgId,
      seq,
      timestamp: message.createdAt.getTime(),
    };

    socket.send(
      JSON.stringify(
        createAckEvent(MESSAGE_SEND_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)
      )
    );

    // 推送给会话其他成员
    const members = await ConversationMember.findAll({
      where: { conversationId: data.conversationId },
      attributes: ["userId"],
    });

    const pushData: MessagePushData = {
      msgId,
      conversationId: data.conversationId,
      senderId: userId,
      content: data.content,
      type: data.type || "text",
      seq,
      timestamp: message.createdAt.getTime(),
      mentions: data.mentions,
    };

    for (const m of members) {
      if (m.userId !== userId) {
        connectionManager.pushToUser(m.userId, createPushEvent(MESSAGE_PUSH, pushData));
      }
    }

    logger.info("[WS] Message sent", {
      msgId,
      conversationId: data.conversationId,
      senderId: userId,
    });
  });
}

/**
 * @function handleRecall
 * @description 处理消息撤回请求
 */
export async function handleRecall(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = wsRequireAuth(socket, event);
  if (!userId) return;

  const data = event.data as MessageRecallReqData;
  if (!wsValidateRequired(socket, event, { msgId: data?.msgId })) return;

  await wsHandleError(socket, event, async () => {
    // 查找消息
    const message = await Message.findOne({
      where: { msgId: data.msgId },
    });

    if (!wsValidateCustom(
      socket, 
      event, 
      !!message, 
      WS_ERROR_CODES.MESSAGE_NOT_FOUND, 
      "Message not found"
    )) return;

    // 验证权限（只能撤回自己的消息）
    if (!wsValidateCustom(
      socket,
      event,
      message!.senderId === userId,
      WS_ERROR_CODES.FORBIDDEN,
      "You can only recall your own messages"
    )) return;

    // 更新消息状态
    await message!.update({ 
      deletedForAll: true,
      recallBy: userId,
      recalledAt: new Date()
    });

    // 返回 ACK
    socket.send(
      JSON.stringify(
        createAckEvent(MESSAGE_RECALL_ACK, WS_ERROR_CODES.SUCCESS, undefined, event.requestId)
      )
    );

    // 推送撤回通知给会话成员
    const members = await ConversationMember.findAll({
      where: { conversationId: message!.conversationId },
      attributes: ["userId"],
    });

    const pushData: MessageRecalledPushData = {
      msgId: data.msgId,
      conversationId: message!.conversationId,
      recalledAt: Date.now(),
    };

    for (const m of members) {
      connectionManager.pushToUser(
        m.userId,
        createPushEvent(MESSAGE_RECALLED_PUSH, pushData)
      );
    }

    logger.info("[WS] Message recalled", {
      msgId: data.msgId,
      userId,
    });
  });
}

/**
 * @function handleRead
 * @description 处理消息已读标记请求
 */
export async function handleRead(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(
      JSON.stringify(
        createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)
      )
    );
    return;
  }

  const data = event.data as MessageReadReqData;

  if (!data || !data.conversationId || typeof data.seq !== "number") {
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.INVALID_REQUEST,
          "conversationId and seq are required",
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

    // 更新已读序号（使用 lastReadMessageId 字段存储 seq）
    const currentReadSeq = member.lastReadMessageId || 0;
    if (data.seq <= currentReadSeq) {
      // 已读序号没有增加，不需要更新
      const ackData: MessageReadAckData = {
        conversationId: data.conversationId,
        seq: currentReadSeq,
        timestamp: Date.now(),
      };
      socket.send(
        JSON.stringify(
          createAckEvent(MESSAGE_READ_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)
        )
      );
      return;
    }

    // 更新成员的已读信息
    await member.update({
      lastReadMessageId: data.seq, // 存储 seq 到这个字段
      lastReadAt: new Date(),
      unreadCount: 0, // 重置未读数
    });

    const timestamp = Date.now();

    // 返回 ACK
    const ackData: MessageReadAckData = {
      conversationId: data.conversationId,
      seq: data.seq,
      timestamp,
    };

    socket.send(
      JSON.stringify(
        createAckEvent(MESSAGE_READ_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)
      )
    );

    // 推送已读回执给会话其他成员（主要是消息发送者）
    const members = await ConversationMember.findAll({
      where: { conversationId: data.conversationId },
      attributes: ["userId"],
    });

    const pushData: MessageReadPushData = {
      conversationId: data.conversationId,
      userId,
      seq: data.seq,
      timestamp,
    };

    for (const m of members) {
      if (m.userId !== userId) {
        connectionManager.pushToUser(m.userId, createPushEvent(MESSAGE_READ_PUSH, pushData));
      }
    }

    logger.info("[WS] Message read", {
      conversationId: data.conversationId,
      userId,
      seq: data.seq,
    });
  } catch (error: any) {
    logger.error("[WS] Failed to mark message as read", { error: error.message });
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.INTERNAL_ERROR,
          error.message || "Failed to mark message as read",
          event.requestId
        )
      )
    );
  }
}

/**
 * @function handleEdit
 * @description 处理消息编辑请求
 */
export async function handleEdit(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // MessageEditReqData
  if (!data || !data.messageId || !data.content) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "messageId and content are required", event.requestId)));
    return;
  }

  try {
    const message = await Message.findByPk(data.messageId);
    if (!message) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.MESSAGE_NOT_FOUND, "Message not found", event.requestId)));
      return;
    }

    // 验证权限（只能编辑自己的消息）
    if (message.senderId !== userId) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.FORBIDDEN, "You can only edit your own messages", event.requestId)));
      return;
    }

    // 更新消息
    await message.update({
      content: data.content,
      edited: true,
      editedAt: new Date()
    });

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      messageId: data.messageId,
      editedAt: message.editedAt?.getTime() || timestamp,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent(MESSAGE_EDIT_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    // 推送给会话成员
    const members = await ConversationMember.findAll({
      where: { conversationId: message.conversationId },
      attributes: ["userId"]
    });

    const pushData: any = {
      messageId: data.messageId,
      conversationId: message.conversationId,
      content: data.content,
      editedAt: message.editedAt?.getTime() || timestamp,
      timestamp
    };

    for (const m of members) {
      connectionManager.pushToUser(m.userId, createPushEvent(MESSAGE_EDITED_PUSH, pushData));
    }

    logger.info("[WS] Message edited", { messageId: data.messageId, userId });
  } catch (error: any) {
    logger.error("[WS] Failed to edit message", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleHistoryPull
 * @description 处理历史消息拉取请求
 */
export async function handleHistoryPull(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // MessageHistoryPullReqData
  if (!data || !data.conversationId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "conversationId is required", event.requestId)));
    return;
  }

  try {
    // 验证权限
    const member = await ConversationMember.findOne({
      where: { conversationId: data.conversationId, userId }
    });

    if (!member) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.NOT_MEMBER, "Not a member of this conversation", event.requestId)));
      return;
    }

    const limit = data.limit || 20;
    const startSeq = data.startSeq;

    // 拉取消息
    const where: any = {
      conversationId: data.conversationId,
      deleted: false
    };

    if (startSeq) {
      where.seq = { [require('sequelize').Op.lt]: startSeq };
    }

    const messages = await Message.findAll({
      where,
      order: [['seq', 'DESC']],
      limit: limit + 1
    });

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;

    const ackData: any = {
      conversationId: data.conversationId,
      messages: resultMessages.map(m => ({
        msgId: m.msgId,
        senderId: m.senderId,
        content: m.content,
        type: m.kind,
        seq: m.seq,
        timestamp: m.createdAt.getTime(),
        edited: m.edited,
        editedAt: m.editedAt?.getTime()
      })),
      hasMore,
      timestamp: Date.now()
    };

    socket.send(JSON.stringify(createAckEvent(MESSAGE_HISTORY_PULL_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] History pulled", { conversationId: data.conversationId, count: resultMessages.length, hasMore });
  } catch (error: any) {
    logger.error("[WS] Failed to pull history", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleReactSet
 * @description 处理消息表情反应
 */
export async function handleReactSet(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // MessageReactSetReqData
  if (!data || !data.messageId || !data.reactionType || !data.action) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "messageId, reactionType and action are required", event.requestId)));
    return;
  }

  try {
    const message = await Message.findByPk(data.messageId);
    if (!message) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.MESSAGE_NOT_FOUND, "Message not found", event.requestId)));
      return;
    }

    // 验证是否是会话成员
    const member = await ConversationMember.findOne({
      where: { conversationId: message.conversationId, userId }
    });

    if (!member) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.NOT_MEMBER, "Not a member of this conversation", event.requestId)));
      return;
    }

    const { MessageReaction } = require('@/models');

    if (data.action === 'add') {
      // 添加表情
      await MessageReaction.findOrCreate({
        where: {
          messageId: data.messageId,
          userId,
          reactionType: data.reactionType
        },
        defaults: {
          messageId: data.messageId,
          userId,
          reactionType: data.reactionType
        }
      });
    } else {
      // 移除表情
      await MessageReaction.destroy({
        where: {
          messageId: data.messageId,
          userId,
          reactionType: data.reactionType
        }
      });
    }

    // 获取当前表情统计
    const reactions = await MessageReaction.findAll({
      where: { messageId: data.messageId },
      attributes: ['reactionType', [require('sequelize').fn('COUNT', 'id'), 'count']],
      group: ['reactionType'],
      raw: true
    });

    const reactionCount: Record<string, number> = {};
    reactions.forEach((r: any) => {
      reactionCount[r.reactionType] = parseInt(r.count);
    });

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      messageId: data.messageId,
      reactionType: data.reactionType,
      action: data.action,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('message.react.set.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    // 推送给会话成员
    const members = await ConversationMember.findAll({
      where: { conversationId: message.conversationId },
      attributes: ["userId"]
    });

    const pushData: any = {
      messageId: data.messageId,
      conversationId: message.conversationId,
      userId,
      reactionType: data.reactionType,
      action: data.action,
      reactionCount,
      timestamp
    };

    for (const m of members) {
      connectionManager.pushToUser(m.userId, createPushEvent('message.react.push', pushData));
    }

    logger.info("[WS] Reaction set", { messageId: data.messageId, userId, action: data.action });
  } catch (error: any) {
    logger.error("[WS] Failed to set reaction", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}
