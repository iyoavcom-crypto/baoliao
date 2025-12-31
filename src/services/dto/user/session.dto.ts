/**
 * @packageDocumentation
 * @module dto/user/session
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 用户会话相关数据传输对象
 */

/**
 * @interface SessionListDto
 * @description 会话列表项
 * @property {string} id - 会话ID
 * @property {string} userId - 用户ID
 * @property {string} deviceId - 设备ID
 * @property {Date} createdAt - 创建时间
 */
export interface SessionListDto {
  id: string;
  userId: string;
  deviceId: string;
  createdAt: Date;
}

/**
 * @interface SessionDetailDto
 * @description 会话详情
 * @property {string} id - 会话ID
 * @property {string} userId - 用户ID
 * @property {string} deviceId - 设备ID
 * @property {string | null} token - 令牌快照
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface SessionDetailDto {
  id: string;
  userId: string;
  deviceId: string;
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface SessionCreatableDto
 * @description 会话可创建字段
 * @property {string} userId - 用户ID
 * @property {string} deviceId - 设备ID
 * @property {string} token - 令牌快照
 */
export interface SessionCreatableDto {
  userId: string;
  deviceId: string;
  token?: string;
}
