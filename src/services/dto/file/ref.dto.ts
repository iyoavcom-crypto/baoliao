/**
 * @packageDocumentation
 * @module dto/file/ref
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 文件引用相关数据传输对象
 */

/**
 * @interface FileRefListDto
 * @description 文件引用列表项
 * @property {number} id - 引用ID
 * @property {string} fileId - 文件ID
 * @property {number | null} messageId - 消息ID
 * @property {number | null} conversationId - 会话ID
 * @property {string | null} userId - 用户ID
 * @property {Date} createdAt - 创建时间
 */
export interface FileRefListDto {
  id: number;
  fileId: string;
  messageId: number | null;
  conversationId: number | null;
  userId: string | null;
  createdAt: Date;
}

/**
 * @interface FileRefDetailDto
 * @description 文件引用详情
 * @property {number} id - 引用ID
 * @property {string} fileId - 文件ID
 * @property {number | null} messageId - 消息ID
 * @property {number | null} conversationId - 会话ID
 * @property {string | null} userId - 用户ID
 * @property {Date} createdAt - 创建时间
 */
export interface FileRefDetailDto {
  id: number;
  fileId: string;
  messageId: number | null;
  conversationId: number | null;
  userId: string | null;
  createdAt: Date;
}

/**
 * @interface FileRefCreatableDto
 * @description 文件引用可创建字段
 * @property {string} fileId - 文件ID
 * @property {number} messageId - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {string} userId - 用户ID
 */
export interface FileRefCreatableDto {
  fileId: string;
  messageId?: number;
  conversationId?: number;
  userId?: string;
}
