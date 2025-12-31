/**
 * @packageDocumentation
 * @module dto/message/forward
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息转发相关数据传输对象
 */

/**
 * @interface MessageForwardListDto
 * @description 消息转发记录列表项
 * @property {number} id - 转发记录ID
 * @property {number} originalMessageId - 原始消息ID
 * @property {number} forwardedMessageId - 转发后的消息ID
 * @property {number} fromConversationId - 来源会话ID
 * @property {number} toConversationId - 目标会话ID
 * @property {string} forwardedBy - 转发人ID
 * @property {Date} createdAt - 创建时间
 */
export interface MessageForwardListDto {
  id: number;
  originalMessageId: number;
  forwardedMessageId: number;
  fromConversationId: number;
  toConversationId: number;
  forwardedBy: string;
  createdAt: Date;
}

/**
 * @interface MessageForwardDetailDto
 * @description 消息转发记录详情
 * @property {number} id - 转发记录ID
 * @property {number} originalMessageId - 原始消息ID
 * @property {number} forwardedMessageId - 转发后的消息ID
 * @property {number} fromConversationId - 来源会话ID
 * @property {number} toConversationId - 目标会话ID
 * @property {string} forwardedBy - 转发人ID
 * @property {string} originalContent - 原始内容
 * @property {string} originalType - 原始消息类型
 * @property {Date} createdAt - 创建时间
 */
export interface MessageForwardDetailDto {
  id: number;
  originalMessageId: number;
  forwardedMessageId: number;
  fromConversationId: number;
  toConversationId: number;
  forwardedBy: string;
  originalContent: string;
  originalType: string;
  createdAt: Date;
}

/**
 * @interface MessageForwardCreatableDto
 * @description 消息转发可创建字段
 * @property {number} messageId - 要转发的消息ID
 * @property {number[]} toConversationIds - 目标会话ID列表
 * @property {boolean} withHistory - 是否携带聊天记录
 */
export interface MessageForwardCreatableDto {
  messageId: number;
  toConversationIds: number[];
  withHistory?: boolean;
}

/**
 * @interface MessageForwardBatchDto
 * @description 批量转发消息
 * @property {number[]} messageIds - 要转发的消息ID列表
 * @property {number} toConversationId - 目标会话ID
 * @property {boolean} merge - 是否合并转发
 */
export interface MessageForwardBatchDto {
  messageIds: number[];
  toConversationId: number;
  merge?: boolean;
}
