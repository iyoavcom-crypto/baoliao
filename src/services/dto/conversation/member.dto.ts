/**
 * @packageDocumentation
 * @module dto/conversation/member
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 会话成员相关数据传输对象
 */

/**
 * @interface ConversationMemberListDto
 * @description 会话成员列表项
 * @property {number} id - 成员ID
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 用户ID
 * @property {'owner' | 'admin' | 'member'} role - 角色
 * @property {Date} joinedAt - 加入时间
 * @property {boolean} pinned - 是否置顶
 * @property {number} unreadCount - 未读数
 */
export interface ConversationMemberListDto {
  id: number;
  conversationId: number;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  pinned: boolean;
  unreadCount: number;
}

/**
 * @interface ConversationMemberDetailDto
 * @description 会话成员详情
 * @property {number} id - 成员ID
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 用户ID
 * @property {'owner' | 'admin' | 'member'} role - 角色
 * @property {Date} joinedAt - 加入时间
 * @property {Date | null} leftAt - 离开时间
 * @property {Date | null} lastReadAt - 最近阅读时间
 * @property {number | null} lastReadMessageId - 最近阅读消息ID
 * @property {number} unreadCount - 未读数
 * @property {number | null} lastDeliveredMessageId - 最后送达消息ID
 * @property {string | null} draft - 草稿
 * @property {string | null} clientCursor - 客户端游标
 * @property {boolean} muted - 是否静音
 * @property {Date | null} mutedUntil - 静音截止时间
 * @property {'all' | 'mentions' | 'none'} notificationPref - 通知偏好
 * @property {boolean} pinned - 是否置顶
 * @property {Date | null} archivedAt - 归档时间
 * @property {Date} createdAt - 创建时间
 */
export interface ConversationMemberDetailDto {
  id: number;
  conversationId: number;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  leftAt: Date | null;
  lastReadAt: Date | null;
  lastReadMessageId: number | null;
  unreadCount: number;
  lastDeliveredMessageId: number | null;
  draft: string | null;
  clientCursor: string | null;
  muted: boolean;
  mutedUntil: Date | null;
  notificationPref: 'all' | 'mentions' | 'none';
  pinned: boolean;
  archivedAt: Date | null;
  createdAt: Date;
}

/**
 * @interface ConversationMemberUpdatableDto
 * @description 会话成员可更新字段
 * @property {'owner' | 'admin' | 'member'} role - 角色
 * @property {number} lastReadMessageId - 最近阅读消息ID
 * @property {string} draft - 草稿
 * @property {boolean} muted - 是否静音
 * @property {Date} mutedUntil - 静音截止时间
 * @property {'all' | 'mentions' | 'none'} notificationPref - 通知偏好
 * @property {boolean} pinned - 是否置顶
 * @property {Date} archivedAt - 归档时间
 */
export interface ConversationMemberUpdatableDto {
  role?: 'owner' | 'admin' | 'member';
  lastReadMessageId?: number;
  draft?: string | null;
  muted?: boolean;
  mutedUntil?: Date | null;
  notificationPref?: 'all' | 'mentions' | 'none';
  pinned?: boolean;
  archivedAt?: Date | null;
}
