/**
 * @packageDocumentation
 * @module dto/conversation/mute
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 会话免打扰相关数据传输对象
 */

/**
 * @interface ConversationMuteDto
 * @description 会话免打扰操作
 * @property {number} conversationId - 会话ID
 * @property {boolean} muted - 是否免打扰
 * @property {Date} muteUntil - 免打扰截止时间（null表示永久）
 */
export interface ConversationMuteDto {
  conversationId: number;
  muted: boolean;
  muteUntil?: Date | null;
}

/**
 * @interface ConversationMuteListDto
 * @description 免打扰会话列表项
 * @property {number} conversationId - 会话ID
 * @property {boolean} muted - 是否免打扰
 * @property {Date | null} muteUntil - 免打扰截止时间
 * @property {Date} mutedAt - 设置时间
 */
export interface ConversationMuteListDto {
  conversationId: number;
  muted: boolean;
  muteUntil: Date | null;
  mutedAt: Date;
}

/**
 * @interface ConversationMuteBatchDto
 * @description 批量免打扰操作
 * @property {number[]} conversationIds - 会话ID列表
 * @property {boolean} muted - 是否免打扰
 * @property {Date} muteUntil - 免打扰截止时间
 */
export interface ConversationMuteBatchDto {
  conversationIds: number[];
  muted: boolean;
  muteUntil?: Date | null;
}
