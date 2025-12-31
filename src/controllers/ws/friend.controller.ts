/**
 * @packageDocumentation
 * @module controllers/ws/friend.controller
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 好友控制器
 */

import type { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import type {
  FriendApplyReqData,
  FriendApplyAckData,
  FriendApplyPushData,
  FriendAcceptReqData,
  FriendAcceptAckData,
  FriendRejectReqData,
} from "@/types/ws/events";
import { connectionManager } from "@/routes/ws/connection-manager";
import { createAckEvent, createPushEvent, createErrorEvent } from "@/routes/ws/protocol";
import { WS_ERROR_CODES } from "@/constants/ws/errors";
import {
  FRIEND_APPLY_ACK,
  FRIEND_APPLY_PUSH,
  FRIEND_ACCEPT_ACK,
  FRIEND_REJECT_ACK,
} from "@/constants/ws/events";
import { UserFriend, FriendRequestEvent, User } from "@/models";
import { getLogger } from "@/tools/logging";
import { 
  wsRequireAuth, 
  wsValidateRequired, 
  wsHandleError, 
  wsValidateCustom 
} from "@/utils/validation/ws-validation";

const logger = getLogger("ws:friend");

/**
 * @function handleApply
 * @description 处理好友申请
 */
export async function handleApply(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = wsRequireAuth(socket, event);
  if (!userId) return;

  const data = event.data as FriendApplyReqData;
  if (!wsValidateRequired(socket, event, { friendId: data?.friendId })) return;

  await wsHandleError(socket, event, async () => {
    // 检查目标用户是否存在
    const targetUser = await User.findByPk(data.friendId);
    if (!wsValidateCustom(
      socket, 
      event, 
      !!targetUser, 
      WS_ERROR_CODES.USER_NOT_FOUND, 
      "User not found"
    )) return;

    // 检查是否已经是好友
    const existingFriend = await UserFriend.findOne({
      where: { userId, friendId: data.friendId }
    });
    if (!wsValidateCustom(
      socket,
      event,
      !(existingFriend && existingFriend.status === 'accepted'),
      WS_ERROR_CODES.ALREADY_FRIEND,
      "Already friends"
    )) return;

    // 创建好友申请事件
    const request = await FriendRequestEvent.create({
      fromId: userId,
      toId: data.friendId,
      message: data.message || '',
      status: 'pending'
    });

    const timestamp = Date.now();

    // 返回ACK
    const ackData: FriendApplyAckData = {
      requestId: request.id,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent(FRIEND_APPLY_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    // 推送给目标用户
    const pushData: FriendApplyPushData = {
      requestId: request.id,
      fromId: userId,
      message: data.message,
      timestamp
    };
    connectionManager.pushToUser(data.friendId, createPushEvent(FRIEND_APPLY_PUSH, pushData));

    logger.info("[WS] Friend request sent", { fromId: userId, toId: data.friendId, requestId: request.id });
  });
}

/**
 * @function handleAccept
 * @description 处理接受好友申请
 */
export async function handleAccept(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as FriendAcceptReqData;
  if (!data || !data.requestId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "requestId is required", event.requestId)));
    return;
  }

  try {
    // 查找申请
    const request = await FriendRequestEvent.findByPk(data.requestId);
    if (!request) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.REQUEST_NOT_FOUND, "Request not found", event.requestId)));
      return;
    }

    // 验证权限
    if (request.toId !== userId) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.PERMISSION_DENIED, "Permission denied", event.requestId)));
      return;
    }

    if (request.status !== 'pending') {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.REQUEST_ALREADY_HANDLED, "Request already handled", event.requestId)));
      return;
    }

    // 更新申请状态
    await request.update({ status: 'approved', reviewedAt: new Date() });

    // 创建双向好友关系
    await Promise.all([
      UserFriend.create({
        userId: request.fromId,
        friendId: request.toId,
        status: 'accepted'
      }),
      UserFriend.create({
        userId: request.toId,
        friendId: request.fromId,
        status: 'accepted'
      })
    ]);

    const timestamp = Date.now();

    // 返回ACK
    const ackData: FriendAcceptAckData = {
      friendId: request.fromId,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent(FRIEND_ACCEPT_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] Friend request accepted", { fromId: request.fromId, toId: userId });
  } catch (error: any) {
    logger.error("[WS] Failed to accept friend request", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleReject
 * @description 处理拒绝好友申请
 */
export async function handleReject(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as FriendRejectReqData;
  if (!data || !data.requestId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "requestId is required", event.requestId)));
    return;
  }

  try {
    // 查找申请
    const request = await FriendRequestEvent.findByPk(data.requestId);
    if (!request) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.REQUEST_NOT_FOUND, "Request not found", event.requestId)));
      return;
    }

    // 验证权限
    if (request.toId !== userId) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.PERMISSION_DENIED, "Permission denied", event.requestId)));
      return;
    }

    if (request.status !== 'pending') {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.REQUEST_ALREADY_HANDLED, "Request already handled", event.requestId)));
      return;
    }

    // 更新申请状态
    await request.update({ 
      status: 'rejected', 
      reviewedAt: new Date(),
      reason: data.reason 
    });

    // 返回ACK
    socket.send(JSON.stringify(createAckEvent(FRIEND_REJECT_ACK, WS_ERROR_CODES.SUCCESS, { timestamp: Date.now() }, event.requestId)));

    logger.info("[WS] Friend request rejected", { fromId: request.fromId, toId: userId });
  } catch (error: any) {
    logger.error("[WS] Failed to reject friend request", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleDelete
 * @description 处理删除好友
 */
export async function handleDelete(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // FriendDeleteReqData
  if (!data || !data.friendId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "friendId is required", event.requestId)));
    return;
  }

  try {
    // 检查好友关系是否存在
    const friendship = await UserFriend.findOne({
      where: { userId, friendId: data.friendId, status: 'accepted' }
    });

    if (!friendship) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.FRIEND_NOT_FOUND, "Friend not found", event.requestId)));
      return;
    }

    // 删除双向好友关系
    await Promise.all([
      UserFriend.destroy({ where: { userId, friendId: data.friendId } }),
      UserFriend.destroy({ where: { userId: data.friendId, friendId: userId } })
    ]);

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      friendId: data.friendId,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('friend.delete.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] Friend deleted", { userId, friendId: data.friendId });
  } catch (error: any) {
    logger.error("[WS] Failed to delete friend", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleBlock
 * @description 处理拉黑好友
 */
export async function handleBlock(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // FriendBlockReqData
  if (!data || !data.friendId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "friendId is required", event.requestId)));
    return;
  }

  try {
    // 检查用户是否存在
    const targetUser = await User.findByPk(data.friendId);
    if (!targetUser) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.USER_NOT_FOUND, "User not found", event.requestId)));
      return;
    }

    // 删除好友关系（如果存在）
    await Promise.all([
      UserFriend.destroy({ where: { userId, friendId: data.friendId } }),
      UserFriend.destroy({ where: { userId: data.friendId, friendId: userId } })
    ]);

    // 添加拉黑记录（使用UserFriend表，设置status=blocked）
    await UserFriend.findOrCreate({
      where: { userId, friendId: data.friendId },
      defaults: {
        userId,
        friendId: data.friendId,
        status: 'blocked',
        remark: data.reason || ''
      }
    });

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      friendId: data.friendId,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('friend.block.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] Friend blocked", { userId, friendId: data.friendId });
  } catch (error: any) {
    logger.error("[WS] Failed to block friend", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleList
 * @description 处理好友列表查询
 */
export async function handleList(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // FriendListReqData
  const page = data?.page || 1;
  const limit = data?.limit || 20;
  const status = data?.status || 'accepted';

  try {
    const { User } = require('@/models');

    // 查询好友关系
    const friendships = await UserFriend.findAll({
      where: {
        userId,
        status
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    const total = await UserFriend.count({
      where: {
        userId,
        status
      }
    });

    // 获取好友详细信息
    const friendIds = friendships.map(f => f.friendId);
    const users = await User.findAll({
      where: {
        id: friendIds
      },
      attributes: ['id', 'username', 'nickname', 'avatar', 'createdAt']
    });

    const userMap: Record<string, any> = {};
    users.forEach((user: any) => {
      userMap[user.id] = user;
    });

    const friends = friendships.map((friendship: any) => {
      const user = userMap[friendship.friendId];
      return {
        friendId: friendship.friendId,
        username: user?.username,
        nickname: user?.nickname,
        avatar: user?.avatar,
        status: friendship.status,
        remark: friendship.remark,
        createdAt: friendship.createdAt.getTime()
      };
    });

    const ackData: any = {
      friends,
      total,
      timestamp: Date.now()
    };

    socket.send(JSON.stringify(createAckEvent('friend.list.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] Friend list retrieved", { userId, count: friends.length, total });
  } catch (error: any) {
    logger.error("[WS] Failed to get friend list", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleSearch
 * @description 处理好友搜索
 */
export async function handleSearch(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // FriendSearchReqData
  if (!data || !data.keyword) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "keyword is required", event.requestId)));
    return;
  }

  const keyword = data.keyword;
  const type = data.type || 'username';
  const page = data?.page || 1;
  const limit = data?.limit || 20;

  try {
    const { User, UserFriend } = require('@/models');

    // 构建查询条件
    const where: any = {};
    switch (type) {
      case 'username':
        where.username = { [require('sequelize').Op.like]: `%${keyword}%` };
        break;
      case 'nickname':
        where.nickname = { [require('sequelize').Op.like]: `%${keyword}%` };
        break;
      case 'phone':
        where.phone = { [require('sequelize').Op.like]: `%${keyword}%` };
        break;
      default:
        where.username = { [require('sequelize').Op.like]: `%${keyword}%` };
    }

    // 排除自己
    where.id = { [require('sequelize').Op.ne]: userId };

    // 查询用户
    const users = await User.findAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    const total = await User.count({ where });

    // 查询当前用户与这些用户的好友关系
    const userIds = users.map((u: any) => u.id);
    const friendships = await UserFriend.findAll({
      where: {
        userId,
        friendId: { [require('sequelize').Op.in]: userIds },
        status: { [require('sequelize').Op.in]: ['pending', 'accepted', 'blocked'] }
      }
    });

    const friendshipMap: Record<string, any> = {};
    friendships.forEach((f: any) => {
      friendshipMap[f.friendId] = f;
    });

    const searchResults = users.map((user: any) => {
      const friendship = friendshipMap[user.id];
      return {
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        status: friendship ? friendship.status : 'not_friend',
        friendId: friendship?.id,
        remark: friendship?.remark,
        createdAt: friendship?.createdAt?.getTime()
      };
    });

    const ackData: any = {
      users: searchResults,
      total,
      timestamp: Date.now()
    };

    socket.send(JSON.stringify(createAckEvent('friend.search.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] Friend search completed", { userId, keyword, count: searchResults.length, total });
  } catch (error: any) {
    logger.error("[WS] Failed to search friends", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}

/**
 * @function handleUnblock
 * @description 处理取消拉黑好友
 */
export async function handleUnblock(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)));
    return;
  }

  const data = event.data as any; // FriendUnblockReqData
  if (!data || !data.friendId) {
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "friendId is required", event.requestId)));
    return;
  }

  try {
    const { UserFriend } = require('@/models');

    // 查找拉黑记录
    const friendship = await UserFriend.findOne({
      where: {
        userId,
        friendId: data.friendId,
        status: 'blocked'
      }
    });

    if (!friendship) {
      socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.FRIEND_NOT_FOUND, "Friend not found or not blocked", event.requestId)));
      return;
    }

    // 删除拉黑记录
    await UserFriend.destroy({
      where: {
        userId,
        friendId: data.friendId
      }
    });

    const timestamp = Date.now();

    // 返回ACK
    const ackData: any = {
      friendId: data.friendId,
      timestamp
    };
    socket.send(JSON.stringify(createAckEvent('friend.unblock.ack', WS_ERROR_CODES.SUCCESS, ackData, event.requestId)));

    logger.info("[WS] Friend unblocked", { userId, friendId: data.friendId });
  } catch (error: any) {
    logger.error("[WS] Failed to unblock friend", { error: error.message });
    socket.send(JSON.stringify(createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)));
  }
}
