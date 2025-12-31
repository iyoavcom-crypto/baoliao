/**
 * @packageDocumentation
 * @module controllers/ws/group.controller
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 群组控制器
 */

import type { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import { connectionManager } from "@/routes/ws/connection-manager";
import { createAckEvent, createPushEvent, createErrorEvent } from "@/routes/ws/protocol";
import { WS_ERROR_CODES } from "@/constants/ws/errors";
import { Group, GroupMember, Conversation, ConversationMember, User } from "@/models";
import { getLogger } from "@/tools/logging";
import { uuid4 } from "@/utils/common/generate/uuid";

const logger = getLogger("ws:group");

/**
 * @function handleCreate
 * @description 处理创建群组
 */
export async function handleCreate(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // GroupCreateReqData
  if (!data || !data.name || !data.memberIds || data.memberIds.length === 0) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "name and memberIds are required", event.requestId)));
    return;
  }

  try {
    const groupId = uuid4();
    const timestamp = Date.now();

    // 创建群组
    const group = await Group.create({
      name: data.name,
      avatar: data.avatar || '',
      ownerId: userId,
      memberCount: data.memberIds.length + 1,
      maxMembers: 500,
      status: 'active'
    } as any);

    // 创建会话
    const conversation = await Conversation.create({
      lastMessageId: 0,
      groupId: group.id
    } as any);

    // 添加创建者为群主
    await GroupMember.create({
      groupId: group.id,
      userId,
      role: 'owner',
      joinedAt: new Date()
    } as any);

    // 添加创建者到会话
    await ConversationMember.create({
      conversationId: conversation.id,
      userId,
      role: 'member',
      joinedAt: new Date(),
      lastReadMessageId: 0,
      unreadCount: 0
    });

    // 添加其他成员
    const allMemberIds = [userId, ...data.memberIds];
    for (const memberId of data.memberIds) {
      await GroupMember.create({
        groupId: group.id,
        userId: memberId,
        role: 'member',
        joinedAt: new Date()
      } as any);

      await ConversationMember.create({
        conversationId: conversation.id,
        userId: memberId,
        role: 'member',
        joinedAt: new Date(),
        lastReadMessageId: 0,
        unreadCount: 0
      });
    }

    // 返回ACK
    const ackData: any = {
      groupId: group.id,
      conversationId: conversation.id,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('group.create.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    // 推送给所有成员
    const pushData: any = {
      groupId: group.id,
      userIds: data.memberIds,
      inviterId: userId,
      timestamp
    };

    for (const memberId of allMemberIds) {
      connectionManager.pushToUser(memberId, createPushEvent('group.member.joined.push', pushData));
    }

    logger.info("[WS] Group created", { groupId: group.id, ownerId: userId, memberCount: allMemberIds.length });
  } catch (error: any) {
    logger.error("[WS] Failed to create group", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleInvite
 * @description 处理邀请入群
 */
export async function handleInvite(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // GroupInviteReqData
  if (!data || !data.groupId || !data.memberIds || data.memberIds.length === 0) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "groupId and memberIds are required", event.requestId)));
    return;
  }

  try {
    // 查找群组
    const group = await Group.findByPk(data.groupId);
    if (!group) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.GROUP_NOT_FOUND, "Group not found", event.requestId)));
      return;
    }

    // 验证是否是群成员
    const member = await GroupMember.findOne({
      where: { groupId: data.groupId, userId }
    });

    if (!member) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.NOT_MEMBER, "You are not a member of this group", event.requestId)));
      return;
    }

    // 查找会话
    const conversation = await Conversation.findOne({
      where: { groupId: data.groupId }
    });

    if (!conversation) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.CONVERSATION_NOT_FOUND, "Conversation not found", event.requestId)));
      return;
    }

    let successCount = 0;
    const addedUserIds: string[] = [];

    // 添加成员
    for (const memberId of data.memberIds) {
      try {
        // 检查是否已是成员
        const existingMember = await GroupMember.findOne({
          where: { groupId: data.groupId, userId: memberId }
        });

        if (existingMember) {
          continue;
        }

        // 添加到群组
        await GroupMember.create({
          groupId: data.groupId,
          userId: memberId,
          role: 'member',
          joinedAt: new Date(),
          joinMethod: 'invite'
        } as any);

        // 添加到会话
        await ConversationMember.create({
          conversationId: conversation.id,
          userId: memberId,
          role: 'member',
          joinedAt: new Date(),
          lastReadMessageId: 0,
          unreadCount: 0
        });

        successCount++;
        addedUserIds.push(memberId);
      } catch (err) {
        logger.error("[WS] Failed to add member", { memberId, error: err });
      }
    }

    // 更新群成员数量 (暂时禁用)
    // await group.update({ memberCount: group.memberCount + successCount } as any);

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      successCount,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('group.invite.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    // 推送给所有群成员
    if (addedUserIds.length > 0) {
      const allMembers = await GroupMember.findAll({
        where: { groupId: data.groupId },
        attributes: ['userId']
      });

      const pushData: any = {
        groupId: data.groupId,
        userIds: addedUserIds,
        inviterId: userId,
        timestamp
      };

      for (const m of allMembers) {
        connectionManager.pushToUser(m.userId, createPushEvent('group.member.joined.push', pushData));
      }
    }

    logger.info("[WS] Members invited", { groupId: data.groupId, successCount });
  } catch (error: any) {
    logger.error("[WS] Failed to invite members", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleJoin
 * @description 处理加入群组
 */
export async function handleJoin(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // GroupJoinReqData
  if (!data || !data.groupId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "groupId is required", event.requestId)));
    return;
  }

  try {
    const group = await Group.findByPk(data.groupId);
    if (!group) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.GROUP_NOT_FOUND, "Group not found", event.requestId)));
      return;
    }

    // 检查是否已是成员
    const existingMember = await GroupMember.findOne({
      where: { groupId: data.groupId, userId }
    });

    if (existingMember) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.ALREADY_MEMBER, "Already a member", event.requestId)));
      return;
    }

    // 查找会话
    const conversation = await Conversation.findOne({
      where: { groupId: data.groupId }
    });

    if (!conversation) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.CONVERSATION_NOT_FOUND, "Conversation not found", event.requestId)));
      return;
    }

    // 加入群组
    await GroupMember.create({
      groupId: data.groupId,
      userId,
      role: 'member',
      joinedAt: new Date(),
      joinMethod: 'join'
    } as any);

    // 加入会话
    await ConversationMember.create({
      conversationId: conversation.id,
      userId,
      role: 'member',
      joinedAt: new Date(),
      lastReadMessageId: 0,
      unreadCount: 0
    });

    // 更新群成员数量 (暂时禁用)
    // await group.update({ memberCount: group.memberCount + 1 } as any);

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      groupId: data.groupId,
      conversationId: conversation.id,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('group.join.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    // 推送给所有群成员
    const members = await GroupMember.findAll({
      where: { groupId: data.groupId },
      attributes: ['userId']
    });

    const pushData: any = {
      groupId: data.groupId,
      userIds: [userId],
      timestamp
    };

    for (const m of members) {
      connectionManager.pushToUser(m.userId, createPushEvent('group.member.joined.push', pushData));
    }

    logger.info("[WS] User joined group", { groupId: data.groupId, userId });
  } catch (error: any) {
    logger.error("[WS] Failed to join group", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleLeave
 * @description 处理退出群组
 */
export async function handleLeave(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // GroupLeaveReqData
  if (!data || !data.groupId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "groupId is required", event.requestId)));
    return;
  }

  try {
    const group = await Group.findByPk(data.groupId);
    if (!group) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.GROUP_NOT_FOUND, "Group not found", event.requestId)));
      return;
    }

    // 检查是否是群主 (暂时禁用)
    // if (group.ownerId === userId) {
    //   socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.OWNER_CANNOT_LEAVE, "Owner cannot leave group", event.requestId)));
    //   return;
    // }

    // 检查是否是成员
    const member = await GroupMember.findOne({
      where: { groupId: data.groupId, userId }
    });

    if (!member) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.NOT_MEMBER, "Not a member of this group", event.requestId)));
      return;
    }

    // 查找会话
    const conversation = await Conversation.findOne({
      where: { groupId: data.groupId }
    });

    // 移除成员
    await GroupMember.destroy({
      where: { groupId: data.groupId, userId }
    });

    if (conversation) {
      await ConversationMember.destroy({
        where: { conversationId: conversation.id, userId }
      });
    }

    // 更新群成员数量 (暂时禁用)
    // await group.update({ memberCount: group.memberCount - 1 } as any);

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      groupId: data.groupId,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('group.leave.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    // 推送给其他群成员
    const members = await GroupMember.findAll({
      where: { groupId: data.groupId },
      attributes: ['userId']
    });

    const pushData: any = {
      groupId: data.groupId,
      userId,
      type: 'leave',
      timestamp
    };

    for (const m of members) {
      connectionManager.pushToUser(m.userId, createPushEvent('group.member.left.push', pushData));
    }

    logger.info("[WS] User left group", { groupId: data.groupId, userId });
  } catch (error: any) {
    logger.error("[WS] Failed to leave group", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleKick
 * @description 处理踢出成员
 */
export async function handleKick(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // GroupKickReqData
  if (!data || !data.groupId || !data.userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "groupId and userId are required", event.requestId)));
    return;
  }

  try {
    const group = await Group.findByPk(data.groupId);
    if (!group) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.GROUP_NOT_FOUND, "Group not found", event.requestId)));
      return;
    }

    // 验证操作权限（只有群主和管理员可以踢人）
    const operator = await GroupMember.findOne({
      where: { groupId: data.groupId, userId }
    });

    if (!operator || (operator.role !== 'owner' && operator.role !== 'admin')) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.PERMISSION_DENIED, "Permission denied", event.requestId)));
      return;
    }

    // 不能踢出群主 (暂时禁用)
    // if (data.userId === group.ownerId) {
    //   socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.CANNOT_KICK_OWNER, "Cannot kick owner", event.requestId)));
    //   return;
    // }

    // 检查目标用户是否是成员
    const targetMember = await GroupMember.findOne({
      where: { groupId: data.groupId, userId: data.userId }
    });

    if (!targetMember) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.USER_NOT_FOUND, "User not found in group", event.requestId)));
      return;
    }

    // 查找会话
    const conversation = await Conversation.findOne({
      where: { groupId: data.groupId }
    });

    // 移除成员
    await GroupMember.destroy({
      where: { groupId: data.groupId, userId: data.userId }
    });

    if (conversation) {
      await ConversationMember.destroy({
        where: { conversationId: conversation.id, userId: data.userId }
      });
    }

    // 更新群成员数量 (暂时禁用)
    // await group.update({ memberCount: group.memberCount - 1 } as any);

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      groupId: data.groupId,
      userId: data.userId,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('group.kick.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    // 推送给所有群成员（包括被踢出的用户）
    const members = await GroupMember.findAll({
      where: { groupId: data.groupId },
      attributes: ['userId']
    });

    const pushData: any = {
      groupId: data.groupId,
      userId: data.userId,
      type: 'kick',
      operatorId: userId,
      timestamp
    };

    // 推送给当前成员
    for (const m of members) {
      connectionManager.pushToUser(m.userId, createPushEvent('group.member.left.push', pushData));
    }

    // 也推送给被踢出的用户
    connectionManager.pushToUser(data.userId, createPushEvent('group.member.left.push', pushData));

    logger.info("[WS] User kicked from group", { groupId: data.groupId, userId: data.userId, operatorId: userId });
  } catch (error: any) {
    logger.error("[WS] Failed to kick user", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}
