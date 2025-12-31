/**
 * @packageDocumentation
 * @module dto/message/pin
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息置顶相关数据传输对象
 */

/**
 * @interface MessagePinListDto
 * @description 置顶消息列表项
 * @property {number} id - 置顶记录ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} pinnedBy - 置顶操作人ID
 * @property {number} pinOrder - 置顶排序
 * @property {Date} pinnedAt - 置顶时间
 */
export interface MessagePinListDto {
  id: number;
  messageId: number;
  conversationId: number;
  pinnedBy: string;
  pinOrder: number;
  pinnedAt: Date;
}

/**
 * @interface MessagePinDetailDto
 * @description 置顶消息详情
 * @property {number} id - 置顶记录ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} pinnedBy - 置顶操作人ID
 * @property {number} pinOrder - 置顶排序
 * @property {string} messageContent - 消息内容
 * @property {string} messageType - 消息类型
 * @property {Date} pinnedAt - 置顶时间
 */
export interface MessagePinDetailDto {
  id: number;
  messageId: number;
  conversationId: number;
  pinnedBy: string;
  pinOrder: number;
  messageContent: string;
  messageType: string;
  pinnedAt: Date;
}

/**
 * @interface MessagePinCreatableDto
 * @description 置顶消息可创建字段
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 */
export interface MessagePinCreatableDto {
  messageId: number;
  conversationId: number;
}

/**
 * @interface MessageUnpinDto
 * @description 取消置顶
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 */
export interface MessageUnpinDto {
  messageId: number;
  conversationId: number;
}
