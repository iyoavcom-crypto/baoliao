/**
 * @packageDocumentation
 * @module models/message-read
 * @since 1.0.0 (2025-12-23)
 * @author Z-kali
 * @description 消息已读关系（UNIQUE(messageId,userId)）
 */

/**
 * @interface MessageRead
 * @description 已读关系对象
 * @property {string} messageId - 消息ID
 * @property {string} userId - 用户ID
 * @property {number} ts - 已读时间戳
 */
export interface MessageRead {
  messageId: string;
  userId: string;
  ts: number;
}

