/**
 * @packageDocumentation
 * @module dto/conversation/draft
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 会话草稿相关数据传输对象
 */

/**
 * @interface ConversationDraftDto
 * @description 会话草稿
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 用户ID
 * @property {string} content - 草稿内容
 * @property {string | null} draftType - 草稿类型（text, image等）
 * @property {string | null} metadata - 元数据（JSON）
 * @property {Date} updatedAt - 更新时间
 */
export interface ConversationDraftDto {
  conversationId: number;
  userId: string;
  content: string;
  draftType: string | null;
  metadata: string | null;
  updatedAt: Date;
}

/**
 * @interface ConversationDraftSaveDto
 * @description 保存会话草稿
 * @property {number} conversationId - 会话ID
 * @property {string} content - 草稿内容
 * @property {string} draftType - 草稿类型
 * @property {string} metadata - 元数据（JSON）
 */
export interface ConversationDraftSaveDto {
  conversationId: number;
  content: string;
  draftType?: string;
  metadata?: string;
}

/**
 * @interface ConversationDraftDeleteDto
 * @description 删除会话草稿
 * @property {number} conversationId - 会话ID
 */
export interface ConversationDraftDeleteDto {
  conversationId: number;
}

/**
 * @interface ConversationDraftBatchDto
 * @description 批量获取草稿
 * @property {number[]} conversationIds - 会话ID列表
 */
export interface ConversationDraftBatchDto {
  conversationIds: number[];
}
