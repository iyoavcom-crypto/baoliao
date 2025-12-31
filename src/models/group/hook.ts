/**
 * @packageDocumentation
 * @module models/group/hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Group 模型钩子函数
 */

import type { Group } from "./index.js";

/**
 * @function setupGroupHooks
 * @description 设置 Group 模型的钩子函数
 * @param {typeof Group} GroupModel - Group 模型类
 */
export function setupGroupHooks(GroupModel: typeof Group): void {
  // 创建前：设置默认值
  GroupModel.beforeCreate(async (group) => {
    // 默认群容量
    if (!group.capacity) {
      group.capacity = 200;
    }

    // 默认状态
    if (!group.status) {
      group.status = 'active';
    }

    // 默认加群策略
    if (!group.joinPolicy) {
      group.joinPolicy = 'invite';
    }
  });

  // 保存前：验证数据合法性
  GroupModel.beforeSave(async (group) => {
    // 验证群容量范围
    if (group.capacity < 2) {
      throw new Error('群容量不能少于2人');
    }

    if (group.capacity > 5000) {
      throw new Error('群容量不能超过5000人');
    }

    // 记录容量变更时间
    if (group.changed('capacity')) {
      group.capacityUpdatedAt = new Date();
    }

    // 验证群状态变更
    if (group.changed('status') && group.status === 'dissolved') {
      // 群解散后不能再修改其他属性
      const changedFields = group.changed() as string[];
      if (changedFields.length > 1 || changedFields[0] !== 'status') {
        throw new Error('已解散的群组不能修改其他属性');
      }
    }
  });

  // 删除前：防止物理删除（应使用软删除）
  GroupModel.beforeDestroy(async (group) => {
    throw new Error('禁止物理删除群组，请设置 status 为 dissolved');
  });

  // 更新后：触发群成员通知
  GroupModel.afterUpdate(async (group) => {
    if (group.changed('name') || group.changed('avatarUrl') || group.changed('description')) {
      // 触发群信息变更事件
      // eventEmitter.emit('group:updated', group);
    }
  });
}
