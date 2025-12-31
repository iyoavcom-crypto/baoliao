/**
 * @packageDocumentation
 * @module dto/conversation/clear
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 清空会话记录相关数据传输对象
 */

/**
 * @interface ConversationClearDto
 * @description 清空会话记录
 * @property {number} conversationId - 会话ID
 * @property {boolean} clearForBoth - 是否双向清空（仅单聊有效）
 * @property {Date} clearBefore - 清空此时间之前的消息
 */
export interface ConversationClearDto {
  conversationId: number;
  clearForBoth?: boolean;
  clearBefore?: Date;
}

/**
 * @interface ConversationClearHistoryDto
 * @description 清空历史记录
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 用户ID
 * @property {Date} clearedAt - 清空时间
 * @property {number} clearedMessageCount - 清空消息数量
 */
export interface ConversationClearHistoryDto {
  conversationId: number;
  userId: string;
  clearedAt: Date;
  clearedMessageCount: number;
}

/**
 * @interface ConversationClearBatchDto
 * @description 批量清空会话
 * @property {number[]} conversationIds - 会话ID列表
 */
export interface ConversationClearBatchDto {
  conversationIds: number[];
}
