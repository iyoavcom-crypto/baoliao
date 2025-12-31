/**
 * @packageDocumentation
 * @module models/message/read-hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description MessageRead 模型钩子函数
 */

import type { MessageRead } from "./read.js";
import type { Conversation } from "../conversation/index.js";
import type { ConversationMember } from "../conversation/member.js";

/** 大群阈值：超过此人数不写入 message_reads */
const LARGE_GROUP_THRESHOLD = 50;

/**
 * @function setupMessageReadHooks
 * @description 设置 MessageRead 模型的钩子函数
 * @param {typeof MessageRead} MessageReadModel - MessageRead 模型类
 */
export function setupMessageReadHooks(MessageReadModel: typeof MessageRead): void {
  // 创建前：大群优化逻辑
  MessageReadModel.beforeCreate(async (read) => {
    // 如果提供了 conversationId，检查是否为大群
    if (read.conversationId) {
      const ConversationModel = MessageReadModel.sequelize?.models.Conversation as typeof Conversation;
      const ConversationMemberModel = MessageReadModel.sequelize?.models.ConversationMember as typeof ConversationMember;
      
      if (ConversationModel && ConversationMemberModel) {
        const conversation = await ConversationModel.findByPk(read.conversationId, {
          attributes: ['id', 'kind']
        });
        
        // 只对群聊检查
        if (conversation && conversation.kind === 'group') {
          const memberCount = await ConversationMemberModel.count({
            where: { 
              conversationId: read.conversationId,
              leftAt: null // 只计算未离开的成员
            }
          });
          
          // 大群：跳过写入 message_reads，仅更新 conversation_members.lastReadMessageId
          if (memberCount >= LARGE_GROUP_THRESHOLD) {
            // 直接更新游标，不写入 message_reads
            await ConversationMemberModel.update(
              { 
                lastReadMessageId: read.messageId,
                lastReadAt: new Date()
              },
              { 
                where: { 
                  conversationId: read.conversationId,
                  userId: read.userId 
                }
              }
            );
            // 抛出错误终止创建（已经处理完）
            throw new Error('LARGE_GROUP_SKIP');
          }
        }
      }
    }

    // 小群/私聊：正常检查重复
    const existing = await MessageReadModel.findOne({
      where: {
        messageId: read.messageId,
        userId: read.userId,
      },
    });

    if (existing) {
      throw new Error('已读回执重复：该用户已标记此消息为已读');
    }

    // 设置默认已读时间
    if (!read.readAt) {
      read.readAt = new Date();
    }
  });

  // 保存前：验证数据完整性
  MessageReadModel.beforeSave(async (read) => {
    // 验证消息ID和用户ID不能为空
    if (!read.messageId) {
      throw new Error('消息ID不能为空');
    }

    if (!read.userId) {
      throw new Error('用户ID不能为空');
    }

    // 验证会话ID（如果提供）
    if (read.conversationId && read.conversationId <= 0) {
      throw new Error('会话ID必须为正整数');
    }
  });

  // 创建后：触发已读通知
  MessageReadModel.afterCreate(async (read) => {
    // 触发消息已读事件（用于实时通知发送方）
    // eventEmitter.emit('message:read', {
    //   messageId: read.messageId,
    //   userId: read.userId,
    //   readAt: read.readAt,
    // });
  });

  // 批量创建前：去重验证
  MessageReadModel.beforeBulkCreate(async (reads, options) => {
    // 提取所有的 messageId 和 userId 组合
    const pairs = reads.map(r => ({
      messageId: r.messageId,
      userId: r.userId,
    }));

    // 批量检查是否存在重复
    const messageIds = [...new Set(pairs.map(p => p.messageId))];
    const userIds = [...new Set(pairs.map(p => p.userId))];

    const existing = await MessageReadModel.findAll({
      where: {
        messageId: messageIds,
        userId: userIds,
      },
      attributes: ['messageId', 'userId'],
    });

    // 如果存在重复，过滤掉已存在的记录
    if (existing.length > 0) {
      const existingSet = new Set(
        existing.map(e => `${e.messageId}_${e.userId}`)
      );

      const filtered = reads.filter(r => {
        const key = `${r.messageId}_${r.userId}`;
        return !existingSet.has(key);
      });

      // 替换原数组
      reads.splice(0, reads.length, ...filtered);
      
      console.log(`批量创建已读回执：过滤了 ${existing.length} 条重复记录`);
    }
  });
}

/**
 * @function markMessagesAsRead
 * @description 批量标记消息为已读（辅助函数）
 * @param {typeof MessageRead} MessageReadModel - MessageRead 模型类
 * @param {string} userId - 用户ID
 * @param {number[]} messageIds - 消息ID列表
 * @param {number} conversationId - 会话ID
 */
export async function markMessagesAsRead(
  MessageReadModel: typeof MessageRead,
  userId: string,
  messageIds: number[],
  conversationId: number
): Promise<number> {
  const reads = messageIds.map(messageId => ({
    messageId,
    userId,
    conversationId,
    readAt: new Date(),
  }));

  const created = await MessageReadModel.bulkCreate(reads, {
    ignoreDuplicates: true, // 忽略重复记录
  });

  return created.length;
}
