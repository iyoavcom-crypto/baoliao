/**
 * @packageDocumentation
 * @module dto/conversation/list
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 会话列表相关数据传输对象
 */

/**
 * @interface ConversationListRequestDto
 * @description 会话列表请求体
 * @property {string} userId - 用户ID
 */
export interface ConversationListRequestDto {
  userId: string;
}

/**
 * @interface ConversationListResponseDto
 * @description 会话列表响应体
 * @property {Array<ConversationListItemDto>} items - 会话列表
 */
export interface ConversationListResponseDto {
  items: ConversationListItemDto[];
}

/**
 * @interface ConversationListItemDto
 * @description 会话列表项
 * @property {number} id - 会话ID
 * @property {number} unreadCount - 未读数量
 * @property {number} lastSeq - 最后序列号
 * @property {number | null} nextCursor - 下一页游标
 */
export interface ConversationListItemDto {
  id: number;
  unreadCount: number;
  lastSeq: number;
  nextCursor: number | null;
}