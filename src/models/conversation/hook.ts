/**
 * @packageDocumentation
 * @module models/conversation/hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Conversation 模型钩子函数
 */

import { v4 as uuidv4 } from "uuid";
import type { Conversation } from "./index.js";

/**
 * @function setupConversationHooks
 * @description 设置 Conversation 模型的钩子函数
 * @param {typeof Conversation} ConversationModel - Conversation 模型类
 */
export function setupConversationHooks(ConversationModel: typeof Conversation): void {
  // 创建前：生成唯一 convId 和 directKey
  ConversationModel.beforeCreate(async (conversation) => {
    if (!conversation.convId) {
      conversation.convId = `conv_${uuidv4()}`;
    }

    // 单聊自动生成 directKey
    if (conversation.kind === 'direct') {
      if (!conversation.directUserA || !conversation.directUserB) {
        throw new Error('单聊必须指定 directUserA 和 directUserB');
      }

      // 生成有序的 directKey（确保 A_B 和 B_A 是同一个会话）
      const userIds = [conversation.directUserA, conversation.directUserB].sort();
      conversation.directKey = `${userIds[0]}_${userIds[1]}`;
    }

    // 群聊必须关联 groupId
    if (conversation.kind === 'group' && !conversation.groupId) {
      throw new Error('群聊必须指定 groupId');
    }

    // 平台公告需要设置发送方
    if (conversation.kind === 'system' && !conversation.senderId) {
      throw new Error('平台公告必须指定 senderId');
    }
  });

  // 保存前：验证数据完整性
  ConversationModel.beforeSave(async (conversation) => {
    // 验证会话类型的必要字段
    if (conversation.kind === 'direct') {
      // 单聊不应有 groupId
      if (conversation.groupId) {
        (conversation as any).groupId = undefined;
      }
    }

    if (conversation.kind === 'group' || conversation.kind === 'group_broadcast') {
      // 群聊必须有 groupId
      if (!conversation.groupId) {
        throw new Error('群聊类型必须设置 groupId');
      }
      // 群聊不应有 directKey
      if (conversation.directKey) {
        (conversation as any).directKey = undefined;
      }
    }

    // 更新最后消息时间
    if (conversation.changed('lastMessageId')) {
      conversation.lastMessageAt = new Date();
    }
  });

  // 创建后：触发会话创建事件
  ConversationModel.afterCreate(async (conversation) => {
    // 触发会话创建事件
    // eventEmitter.emit('conversation:created', conversation);
  });

  // 删除前：检查是否有未读消息
  ConversationModel.beforeDestroy(async (conversation) => {
    // 可以在这里添加逻辑检查是否允许删除
    console.warn(`准备删除会话: ${conversation.convId}`);
  });
}

/**
 * @function generateDirectKey
 * @description 生成单聊唯一键（辅助函数）
 * @param {string} userA - 用户A的ID
 * @param {string} userB - 用户B的ID
 * @returns {string} 排序后的唯一键
 */
export function generateDirectKey(userA: string, userB: string): string {
  const userIds = [userA, userB].sort();
  return `${userIds[0]}_${userIds[1]}`;
}
