/**
 * @packageDocumentation
 * @module dto/message/read
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息已读相关数据传输对象
 */

// ============ 模型对应DTO（新增） ============

/**
 * @interface MessageReadListDto
 * @description 消息已读记录列表项
 * @property {number} id - 主键ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 用户ID
 * @property {Date} readAt - 阅读时间
 */
export interface MessageReadListDto {
  id: number;
  messageId: number;
  conversationId: number;
  userId: string;
  readAt: Date;
}

/**
 * @interface MessageReadDetailDto
 * @description 消息已读记录详情
 * @property {number} id - 主键ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 用户ID
 * @property {Date} readAt - 阅读时间
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface MessageReadDetailDto {
  id: number;
  messageId: number;
  conversationId: number;
  userId: string;
  readAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============ 业务DTO（原有） ============

/**
 * @interface MessageReadRequestDto
 * @description 消息已读请求体
 * @property {number} convId - 会话ID
 * @property {number} uptoSeq - 已读到的序列号
 */
export interface MessageReadRequestDto {
  convId: number;
  uptoSeq: number;
}

/**
 * @interface MessageReadResponseDto
 * @description 消息已读响应体
 * @property {boolean} updated - 是否更新成功
 * @property {number} updatedCount - 更新的消息数量
 */
export interface MessageReadResponseDto {
  updated: boolean;
  updatedCount: number;
}

/**
 * @interface MessageReadReportDto
 * @description 消息已读上报
 * @property {number} conversationId - 会话ID
 * @property {number} userId - 用户ID
 * @property {number} ts - 时间戳
 * @property {number} uptoSeq - 已读到的序列号
 */
export interface MessageReadReportDto {
  conversationId: number;
  userId: string;
  ts: number;
  uptoSeq: number;
}