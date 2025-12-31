/**
 * @packageDocumentation
 * @module dto/user/typing
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 正在输入提示相关数据传输对象
 */

/**
 * @interface TypingIndicatorDto
 * @description 正在输入提示
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 用户ID
 * @property {boolean} isTyping - 是否正在输入
 * @property {Date} timestamp - 时间戳
 */
export interface TypingIndicatorDto {
  conversationId: number;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

/**
 * @interface TypingIndicatorStartDto
 * @description 开始输入
 * @property {number} conversationId - 会话ID
 */
export interface TypingIndicatorStartDto {
  conversationId: number;
}

/**
 * @interface TypingIndicatorStopDto
 * @description 停止输入
 * @property {number} conversationId - 会话ID
 */
export interface TypingIndicatorStopDto {
  conversationId: number;
}

/**
 * @interface TypingIndicatorBatchDto
 * @description 批量正在输入状态
 * @property {number} conversationId - 会话ID
 * @property {string[]} typingUserIds - 正在输入的用户ID列表
 * @property {Date} timestamp - 时间戳
 */
export interface TypingIndicatorBatchDto {
  conversationId: number;
  typingUserIds: string[];
  timestamp: Date;
}
