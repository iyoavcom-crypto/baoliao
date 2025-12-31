/**
 * @packageDocumentation
 * @module dto/conversation/conversation
 * @since 1.0.0 (2025-12-26)
 * @author Z-kali
 * @description 会话数据传输对象，处理通信层与模型层之间的字段映射
 */

/**
 * @interface ConversationListDto
 * @description 会话列表项（修正：完全对齐模型字段）
 * @property {number} id - 会话ID
 * @property {string} convId - 会话标识符
 * @property {'system'|'group_broadcast'|'direct'|'group'} kind - 会话类型
 * @property {string | null} title - 标题
 * @property {number | null} lastMessageId - 最后消息ID
 * @property {Date | null} lastMessageAt - 最后消息时间
 * @property {number | null} groupId - 关联群组ID
 */
export interface ConversationListDto {
  id: number;
  convId: string;
  kind: 'system' | 'group_broadcast' | 'direct' | 'group';
  title?: string | null;
  lastMessageId?: number | null;
  lastMessageAt?: Date | null;
  groupId?: number | null;
}

/**
 * @interface ConversationDetailDto
 * @description 会话详情（修正：完全对齐模型字段）
 * @property {number} id - 会话ID
 * @property {string} convId - 会话标识符
 * @property {'system'|'group_broadcast'|'direct'|'group'} kind - 会话类型
 * @property {string | null} title - 标题
 * @property {string | null} senderId - 发送方ID
 * @property {string | null} directKey - 单聊唯一键
 * @property {string | null} directUserA - 单聊用户A
 * @property {string | null} directUserB - 单聊用户B
 * @property {number | null} lastMessageId - 最后消息ID
 * @property {Date | null} lastMessageAt - 最后消息时间
 * @property {number | null} groupId - 关联群组ID
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface ConversationDetailDto {
  id: number;
  convId: string;
  kind: 'system' | 'group_broadcast' | 'direct' | 'group';
  title?: string | null;
  senderId?: string | null;
  directKey?: string | null;
  directUserA?: string | null;
  directUserB?: string | null;
  lastMessageId?: number | null;
  lastMessageAt?: Date | null;
  groupId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface ConversationUpdatableDto
 * @description 会话可更新字段（修正：对齐模型）
 * @property {string} title - 标题
 * @property {number} lastMessageId - 最后消息ID
 * @property {Date} lastMessageAt - 最后消息时间
 */
export interface ConversationUpdatableDto {
  title?: string | null;
  lastMessageId?: number | null;
  lastMessageAt?: Date | null;
}

/**
 * @interface ConversationCreatableDto
 * @description 会话可创建字段（修正：对齐模型）
 * @property {string} convId - 会话标识符
 * @property {'system'|'group_broadcast'|'direct'|'group'} kind - 会话类型
 * @property {string} title - 标题
 * @property {string} senderId - 发送方ID
 * @property {string} directKey - 单聊唯一键
 * @property {string} directUserA - 单聊用户A
 * @property {string} directUserB - 单聊用户B
 * @property {number} groupId - 关联群组ID
 */
export interface ConversationCreatableDto {
  convId: string;
  kind: 'system' | 'group_broadcast' | 'direct' | 'group';
  title?: string | null;
  senderId?: string | null;
  directKey?: string | null;
  directUserA?: string | null;
  directUserB?: string | null;
  groupId?: number | null;
}