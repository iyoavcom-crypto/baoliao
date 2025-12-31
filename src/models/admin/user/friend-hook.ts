/**
 * @packageDocumentation
 * @module models/user/friend-hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description UserFriend 模型钩子函数
 */

import type { UserFriend } from "./friend.js";

/**
 * @function setupUserFriendHooks
 * @description 设置 UserFriend 模型的钩子函数
 * @param {typeof UserFriend} UserFriendModel - UserFriend 模型类
 */
export function setupUserFriendHooks(UserFriendModel: typeof UserFriend): void {
  // 创建前：验证数据合法性
  UserFriendModel.beforeCreate(async (friend) => {
    // 设置默认请求时间
    if (!friend.requestedAt) {
      friend.requestedAt = new Date();
    }

    // 验证不能添加自己为好友
    if (friend.userId === friend.friendId) {
      throw new Error('不能添加自己为好友');
    }

    // 验证请求方
    if (!friend.requestedBy) {
      // 默认为当前用户发起请求
      friend.requestedBy = friend.userId;
    }

    // 检查是否已存在好友关系
    const existing = await UserFriendModel.findOne({
      where: {
        userId: friend.userId,
        friendId: friend.friendId,
      },
    });

    if (existing) {
      throw new Error('好友关系已存在');
    }
  });

  // 保存前：验证状态变更
  UserFriendModel.beforeSave(async (friend) => {
    // 状态变更时设置响应时间
    if (friend.changed('status')) {
      if (friend.status === 'accepted' || friend.status === 'rejected') {
        if (!friend.respondedAt) {
          friend.respondedAt = new Date();
        }
      }

      // 拉黑时设置拉黑方
      if (friend.status === 'blocked' && !friend.blockedBy) {
        friend.blockedBy = friend.userId;
      }

      // 从拉黑恢复时清除拉黑信息
      if (friend.status !== 'blocked') {
        friend.blockedBy = null;
        friend.blockReason = null;
      }
    }

    // 验证状态转换合法性
    if (friend.changed('status')) {
      const oldStatus = friend.previous('status');
      const newStatus = friend.status;

      // pending -> accepted/rejected/blocked 合法
      // accepted -> blocked 合法
      // rejected -> pending 合法（重新申请）
      // blocked -> pending 合法（解除拉黑后重新申请）
      
      // 不允许从 accepted 变为 rejected
      if (oldStatus === 'accepted' && newStatus === 'rejected') {
        throw new Error('不能将已接受的好友关系改为拒绝');
      }
    }
  });

  // 创建后：创建双向好友关系
  UserFriendModel.afterCreate(async (friend) => {
    if (friend.status === 'accepted') {
      // 自动创建反向好友关系
      const reverseExists = await UserFriendModel.findOne({
        where: {
          userId: friend.friendId,
          friendId: friend.userId,
        },
      });

      if (!reverseExists) {
        await UserFriendModel.create({
          userId: friend.friendId,
          friendId: friend.userId,
          status: 'accepted',
          requestedBy: friend.requestedBy,
          requestedAt: friend.requestedAt,
          respondedAt: friend.respondedAt,
        });
      }
    }

    // 触发好友关系变更事件
    // eventEmitter.emit('friend:request:created', friend);
  });

  // 更新后：同步双向关系
  UserFriendModel.afterUpdate(async (friend) => {
    if (friend.changed('status') && friend.status === 'accepted') {
      // 同步更新反向关系
      await UserFriendModel.update(
        {
          status: 'accepted',
          respondedAt: friend.respondedAt,
        },
        {
          where: {
            userId: friend.friendId,
            friendId: friend.userId,
          },
        }
      );
    }

    // 触发好友状态变更事件
    // eventEmitter.emit('friend:status:updated', friend);
  });

  // 删除后：同步删除双向关系
  UserFriendModel.afterDestroy(async (friend) => {
    // 删除反向好友关系
    await UserFriendModel.destroy({
      where: {
        userId: friend.friendId,
        friendId: friend.userId,
      },
    });

    // 触发好友关系删除事件
    // eventEmitter.emit('friend:deleted', friend);
  });
}
