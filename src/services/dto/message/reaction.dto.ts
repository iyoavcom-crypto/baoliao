/**
 * @packageDocumentation
 * @module dto/message/reaction
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息反应相关数据传输对象
 */

/**
 * @interface MessageReactionListDto
 * @description 消息反应列表项
 * @property {number} id - 反应ID
 * @property {number} messageId - 消息ID
 * @property {string} userId - 用户ID
 * @property {string} emoji - 表情
 * @property {Date} createdAt - 创建时间
 */
export interface MessageReactionListDto {
  id: number;
  messageId: number;
  userId: string;
  emoji: string;
  createdAt: Date;
}

/**
 * @interface MessageReactionDetailDto
 * @description 消息反应详情
 * @property {number} id - 反应ID
 * @property {number} messageId - 消息ID
 * @property {string} userId - 用户ID
 * @property {string} emoji - 表情
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface MessageReactionDetailDto {
  id: number;
  messageId: number;
  userId: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface MessageReactionCreatableDto
 * @description 消息反应可创建字段
 * @property {number} messageId - 消息ID
 * @property {string} emoji - 表情
 */
export interface MessageReactionCreatableDto {
  messageId: number;
  emoji: string;
}

/**
 * @interface MessageReactionDeleteDto
 * @description 删除消息反应
 * @property {number} messageId - 消息ID
 * @property {string} emoji - 表情
 */
export interface MessageReactionDeleteDto {
  messageId: number;
  emoji: string;
}
