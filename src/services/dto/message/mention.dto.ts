/**
 * @packageDocumentation
 * @module dto/message/mention
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息@提及相关数据传输对象（与 message_mentions 表对应）
 */

/**
 * @interface MessageMentionListDto
 * @description 消息提及列表项
 * @property {number} id - 提及ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 被@的用户ID
 * @property {Date} createdAt - 创建时间
 */
export interface MessageMentionListDto {
  id: number;
  messageId: number;
  conversationId: number;
  userId: string;
  createdAt: Date;
}

/**
 * @interface MessageMentionDetailDto
 * @description 消息提及详情
 * @property {number} id - 提及ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 被@的用户ID
 * @property {Date} createdAt - 创建时间
 */
export interface MessageMentionDetailDto {
  id: number;
  messageId: number;
  conversationId: number;
  userId: string;
  createdAt: Date;
}

/**
 * @interface CreateMessageMentionDto
 * @description 创建消息提及（用于批量创建）
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 被@的用户ID
 */
export interface CreateMessageMentionDto {
  messageId: number;
  conversationId: number;
  userId: string;
}

/**
 * @interface MessageMentionQueryDto
 * @description 查询@消息
 * @property {string} userId - 用户ID（查询@我的消息）
 * @property {number} [conversationId] - 会话ID（可选）
 * @property {number} [page] - 页码
 * @property {number} [limit] - 每页数量
 */
export interface MessageMentionQueryDto {
  userId: string;
  conversationId?: number;
  page?: number;
  limit?: number;
}
