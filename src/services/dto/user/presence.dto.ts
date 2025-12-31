/**
 * @packageDocumentation
 * @module dto/user/presence
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 用户在线状态相关数据传输对象
 */

/**
 * @interface UserPresenceDto
 * @description 用户在线状态
 * @property {string} userId - 用户ID
 * @property {'online' | 'offline' | 'away' | 'busy' | 'invisible'} status - 在线状态
 * @property {string | null} customStatus - 自定义状态文本
 * @property {Date} lastActiveAt - 最后活跃时间
 * @property {Date} updatedAt - 更新时间
 */
export interface UserPresenceDto {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  customStatus: string | null;
  lastActiveAt: Date;
  updatedAt: Date;
}

/**
 * @interface UserPresenceUpdateDto
 * @description 更新用户在线状态
 * @property {'online' | 'offline' | 'away' | 'busy' | 'invisible'} status - 在线状态
 * @property {string} customStatus - 自定义状态文本
 */
export interface UserPresenceUpdateDto {
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  customStatus?: string;
}

/**
 * @interface UserPresenceBatchDto
 * @description 批量查询用户在线状态
 * @property {string[]} userIds - 用户ID列表
 */
export interface UserPresenceBatchDto {
  userIds: string[];
}

/**
 * @interface UserPresenceBatchResponseDto
 * @description 批量在线状态响应
 * @property {Record<string, UserPresenceDto>} presences - 用户状态映射
 */
export interface UserPresenceBatchResponseDto {
  presences: Record<string, UserPresenceDto>;
}

/**
 * @interface UserPresenceSubscribeDto
 * @description 订阅用户状态变化
 * @property {string[]} userIds - 要订阅的用户ID列表
 */
export interface UserPresenceSubscribeDto {
  userIds: string[];
}
