/**
 * @packageDocumentation
 * @module models/conversation
 * @since 1.0.0 (2025-12-23)
 * @author Z-kali
 * @description 会话模型定义
 */

/**
 * @interface Conversation
 * @description 会话领域对象
 * @property {number} id - 会话ID（与数据库模型对齐）
 * @property {string[]} memberIds - 成员ID列表
 * @property {number} lastSeq - 当前最大消息序号
 * @property {number} [unreadCountSelf] - 演示：当前用户未读数（按请求用户计算）
 * @property {number} [nextCursor] - 分页游标（演示）
 */
export interface Conversation {
  id: number;
  memberIds: string[];
  lastSeq: number;
  unreadCountSelf?: number;
  nextCursor?: number;
}

