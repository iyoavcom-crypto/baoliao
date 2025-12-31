/**
 * @packageDocumentation
 * @module dto/message/offline
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 离线消息相关数据传输对象
 */

/**
 * @interface OfflineInboxListDto
 * @description 离线消息列表项
 * @property {number} id - 离线消息ID
 * @property {string} userId - 用户ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {Date} createdAt - 创建时间
 */
export interface OfflineInboxListDto {
  id: number;
  userId: string;
  messageId: number;
  conversationId: number;
  createdAt: Date;
}

/**
 * @interface OfflineInboxDetailDto
 * @description 离线消息详情
 * @property {number} id - 离线消息ID
 * @property {string} userId - 用户ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {Date} createdAt - 创建时间
 */
export interface OfflineInboxDetailDto {
  id: number;
  userId: string;
  messageId: number;
  conversationId: number;
  createdAt: Date;
}

/**
 * @interface OfflineInboxCreatableDto
 * @description 离线消息可创建字段
 * @property {string} userId - 用户ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 */
export interface OfflineInboxCreatableDto {
  userId: string;
  messageId: number;
  conversationId: number;
}
