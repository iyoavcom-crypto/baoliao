/**
 * @packageDocumentation
 * @module models/message/hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Message 模型钩子函数
 */

import { v4 as uuidv4 } from "uuid";
import type { Message } from "./index.js";

/**
 * @function setupMessageHooks
 * @description 设置 Message 模型的钩子函数
 * @param {typeof Message} MessageModel - Message 模型类
 */
export function setupMessageHooks(MessageModel: typeof Message): void {
  // 创建前：生成唯一 msgId 和 seq
  MessageModel.beforeCreate(async (message) => {
    if (!message.msgId) {
      message.msgId = `msg_${uuidv4()}`;
    }
    
    // 设置服务器接收时间
    if (!message.serverReceivedAt) {
      message.serverReceivedAt = new Date();
    }

    // 自动生成 seq（会话内自增序列）
    if (!message.seq) {
      // 查询当前会话的最大 seq
      const lastMessage = await MessageModel.findOne({
        where: { conversationId: message.conversationId },
        order: [['seq', 'DESC']],
        attributes: ['seq']
      });
      message.seq = lastMessage ? (lastMessage.seq ?? 0) + 1 : 1;
    }
  });

  // 保存前：验证数据完整性
  MessageModel.beforeSave(async (message) => {
    // 验证消息类型与内容的匹配性
    if (message.kind === 'text' && !message.content) {
      throw new Error('文本消息必须包含 content 字段');
    }

    if ((message.kind === 'image' || message.kind === 'file') && (!message.attachments || message.attachments.length === 0)) {
      throw new Error('图片/文件消息必须包含 attachments 字段');
    }

    // 清理已删除消息的敏感数据
    if (message.changed('deleted') && message.deleted) {
      message.deletedAt = new Date();
    }

    // 记录编辑时间
    if (message.changed('edited') && message.edited && !message.editedAt) {
      message.editedAt = new Date();
    }

    // 记录撤回时间
    if (message.changed('recallBy') && message.recallBy && !message.recalledAt) {
      message.recalledAt = new Date();
    }
  });

  // 更新后：触发会话最后消息更新
  MessageModel.afterCreate(async (message) => {
    // 可以在这里触发事件通知 WebSocket
    // 例如：eventEmitter.emit('message:created', message);
  });

  // 删除前：防止物理删除（应使用软删除）
  MessageModel.beforeDestroy(async (message) => {
    throw new Error('禁止物理删除消息，请使用软删除（设置 deleted 字段）');
  });
}
