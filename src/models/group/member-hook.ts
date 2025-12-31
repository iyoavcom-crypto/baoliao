/**
 * @packageDocumentation
 * @module models/group/member-hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description GroupMember 模型钩子函数
 */

import type { GroupMember } from "./member.js";

/**
 * @function setupGroupMemberHooks
 * @description 设置 GroupMember 模型的钩子函数
 * @param {typeof GroupMember} GroupMemberModel - GroupMember 模型类
 */
export function setupGroupMemberHooks(GroupMemberModel: typeof GroupMember): void {
  // 创建前：验证数据合法性
  GroupMemberModel.beforeCreate(async (member) => {
    // 设置默认加入时间
    if (!member.joinedAt) {
      member.joinedAt = new Date();
    }

    // 验证邀请逻辑
    if (member.joinMethod === 'invited' && !member.invitedBy) {
      throw new Error('通过邀请加入必须指定 invitedBy 字段');
    }

    // 搜索加入不应有邀请人
    if (member.joinMethod === 'search' && member.invitedBy) {
      member.invitedBy = null;
    }
  });

  // 保存前：验证禁言逻辑
  GroupMemberModel.beforeSave(async (member) => {
    // 验证禁言状态
    if (member.changed('muted')) {
      if (member.muted && !member.mutedUntil) {
        // 如果设置禁言但没有截止时间，设为永久禁言
        member.mutedUntil = null;
      }
      
      if (!member.muted) {
        // 取消禁言时清空禁言时间
        member.mutedUntil = null;
      }
    }

    // 验证禁言时间合法性
    if (member.mutedUntil && member.mutedUntil <= new Date()) {
      throw new Error('禁言截止时间必须大于当前时间');
    }

    // 验证角色变更
    if (member.changed('role')) {
      // 群主角色变更需要特殊处理
      if (member.role === 'owner') {
        // 确保群内只有一个群主
        const ownerCount = await GroupMemberModel.count({
          where: {
            groupId: member.groupId,
            role: 'owner',
          },
        });
        
        if (ownerCount > 0 && !member.isNewRecord) {
          throw new Error('群内已存在群主，请先转让群主');
        }
      }
    }
  });

  // 创建后：触发群成员变更事件
  GroupMemberModel.afterCreate(async (member) => {
    // 触发新成员加入事件
    // eventEmitter.emit('group:member:joined', member);
  });

  // 删除前：验证删除权限
  GroupMemberModel.beforeDestroy(async (member) => {
    // 群主不能直接删除，需要先转让群主
    if (member.role === 'owner') {
      throw new Error('群主不能直接退出，请先转让群主');
    }
  });

  // 删除后：触发成员退出事件
  GroupMemberModel.afterDestroy(async (member) => {
    // 触发成员退出事件
    // eventEmitter.emit('group:member:left', member);
  });
}
