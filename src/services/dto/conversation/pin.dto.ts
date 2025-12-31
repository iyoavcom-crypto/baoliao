/**
 * @packageDocumentation
 * @module dto/conversation/pin
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 会话置顶相关数据传输对象
 */

/**
 * @interface ConversationPinDto
 * @description 会话置顶操作
 * @property {number} conversationId - 会话ID
 * @property {boolean} pinned - 是否置顶
 * @property {number} pinOrder - 置顶排序（数字越大越靠前）
 */
export interface ConversationPinDto {
  conversationId: number;
  pinned: boolean;
  pinOrder?: number;
}

/**
 * @interface ConversationPinListDto
 * @description 置顶会话列表项
 * @property {number} conversationId - 会话ID
 * @property {boolean} pinned - 是否置顶
 * @property {number} pinOrder - 置顶排序
 * @property {Date} pinnedAt - 置顶时间
 */
export interface ConversationPinListDto {
  conversationId: number;
  pinned: boolean;
  pinOrder: number;
  pinnedAt: Date;
}

/**
 * @interface ConversationPinBatchDto
 * @description 批量置顶操作
 * @property {number[]} conversationIds - 会话ID列表
 * @property {boolean} pinned - 是否置顶
 */
export interface ConversationPinBatchDto {
  conversationIds: number[];
  pinned: boolean;
}
