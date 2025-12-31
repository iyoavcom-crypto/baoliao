/**
 * @packageDocumentation
 * @module dto/admin/safety/rate-limit-log
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 频控日志相关数据传输对象
 */

/**
 * @interface RateLimitLogListDto
 * @description 频控日志列表项
 * @property {number} id - 日志ID
 * @property {string | null} ip - IP地址
 * @property {string | null} userId - 用户ID
 * @property {string} endpoint - 端点
 * @property {number} count - 请求次数
 * @property {number} limit - 限制次数
 * @property {Date} createdAt - 创建时间
 */
export interface RateLimitLogListDto {
  id: number;
  ip: string | null;
  userId: string | null;
  endpoint: string;
  count: number;
  limit: number;
  createdAt: Date;
}

/**
 * @interface RateLimitLogDetailDto
 * @description 频控日志详情
 * @property {number} id - 日志ID
 * @property {string | null} ip - IP地址
 * @property {string | null} userId - 用户ID
 * @property {string} endpoint - 端点
 * @property {number} count - 请求次数
 * @property {number} limit - 限制次数
 * @property {Date} createdAt - 创建时间
 */
export interface RateLimitLogDetailDto {
  id: number;
  ip: string | null;
  userId: string | null;
  endpoint: string;
  count: number;
  limit: number;
  createdAt: Date;
}

/**
 * @interface RateLimitLogCreatableDto
 * @description 频控日志可创建字段
 * @property {string} ip - IP地址
 * @property {string} userId - 用户ID
 * @property {string} endpoint - 端点
 * @property {number} count - 请求次数
 * @property {number} limit - 限制次数
 */
export interface RateLimitLogCreatableDto {
  ip?: string;
  userId?: string;
  endpoint: string;
  count: number;
  limit: number;
}
