/**
 * @packageDocumentation
 * @module dto/message/quote
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息引用/回复相关数据传输对象
 */

/**
 * @interface MessageQuoteListDto
 * @description 消息引用列表项
 * @property {number} id - 引用ID
 * @property {number} messageId - 消息ID
 * @property {number} quotedMessageId - 被引用消息ID
 * @property {string} quotedContent - 被引用内容预览
 * @property {string} quotedSenderId - 被引用消息发送者ID
 * @property {Date} createdAt - 创建时间
 */
export interface MessageQuoteListDto {
  id: number;
  messageId: number;
  quotedMessageId: number;
  quotedContent: string;
  quotedSenderId: string;
  createdAt: Date;
}

/**
 * @interface MessageQuoteDetailDto
 * @description 消息引用详情
 * @property {number} id - 引用ID
 * @property {number} messageId - 消息ID
 * @property {number} quotedMessageId - 被引用消息ID
 * @property {string} quotedContent - 被引用内容
 * @property {string} quotedSenderId - 被引用消息发送者ID
 * @property {string} quotedMessageType - 被引用消息类型
 * @property {Date} quotedAt - 被引用消息时间
 * @property {Date} createdAt - 创建时间
 */
export interface MessageQuoteDetailDto {
  id: number;
  messageId: number;
  quotedMessageId: number;
  quotedContent: string;
  quotedSenderId: string;
  quotedMessageType: string;
  quotedAt: Date;
  createdAt: Date;
}

/**
 * @interface MessageQuoteCreatableDto
 * @description 消息引用可创建字段
 * @property {number} messageId - 当前消息ID
 * @property {number} quotedMessageId - 被引用消息ID
 */
export interface MessageQuoteCreatableDto {
  messageId: number;
  quotedMessageId: number;
}

/**
 * @interface MessageQuoteChainDto
 * @description 消息引用链（查询某条消息的所有回复）
 * @property {number} rootMessageId - 根消息ID
 * @property {number} replyCount - 回复总数
 * @property {MessageQuoteDetailDto[]} replies - 回复列表
 */
export interface MessageQuoteChainDto {
  rootMessageId: number;
  replyCount: number;
  replies: MessageQuoteDetailDto[];
}
