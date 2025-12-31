/**
 * @packageDocumentation
 * @module dto/message/dedup
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息去重相关数据传输对象
 */

/**
 * @interface MessageDedupListDto
 * @description 消息去重列表项
 * @property {number} id - 去重记录ID
 * @property {string} clientMsgId - 客户端消息ID
 * @property {string} senderId - 发送者ID
 * @property {number} conversationId - 会话ID
 * @property {number} messageId - 消息ID
 * @property {Date} createdAt - 创建时间
 */
export interface MessageDedupListDto {
  id: number;
  clientMsgId: string;
  senderId: string;
  conversationId: number;
  messageId: number;
  createdAt: Date;
}

/**
 * @interface MessageDedupDetailDto
 * @description 消息去重详情
 * @property {number} id - 去重记录ID
 * @property {string} clientMsgId - 客户端消息ID
 * @property {string} senderId - 发送者ID
 * @property {number} conversationId - 会话ID
 * @property {number} messageId - 消息ID
 * @property {Date} createdAt - 创建时间
 */
export interface MessageDedupDetailDto {
  id: number;
  clientMsgId: string;
  senderId: string;
  conversationId: number;
  messageId: number;
  createdAt: Date;
}

/**
 * @interface MessageDedupCheckDto
 * @description 检查消息是否重复
 * @property {string} clientMsgId - 客户端消息ID
 */
export interface MessageDedupCheckDto {
  clientMsgId: string;
}

/**
 * @interface MessageDedupCheckResponseDto
 * @description 消息去重检查响应
 * @property {boolean} isDuplicate - 是否重复
 * @property {number} messageId - 消息ID（如果重复）
 */
export interface MessageDedupCheckResponseDto {
  isDuplicate: boolean;
  messageId?: number;
}
