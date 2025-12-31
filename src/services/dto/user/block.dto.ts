/**
 * @packageDocumentation
 * @module dto/user/block
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 用户拉黑相关数据传输对象
 */

/**
 * @interface UserBlockListDto
 * @description 拉黑用户列表项
 * @property {number} id - 拉黑记录ID
 * @property {string} userId - 拉黑人ID
 * @property {string} blockedUserId - 被拉黑用户ID
 * @property {string | null} reason - 拉黑原因
 * @property {Date} createdAt - 创建时间
 */
export interface UserBlockListDto {
  id: number;
  userId: string;
  blockedUserId: string;
  reason: string | null;
  createdAt: Date;
}

/**
 * @interface UserBlockDetailDto
 * @description 拉黑用户详情
 * @property {number} id - 拉黑记录ID
 * @property {string} userId - 拉黑人ID
 * @property {string} blockedUserId - 被拉黑用户ID
 * @property {string | null} reason - 拉黑原因
 * @property {Date} createdAt - 创建时间
 */
export interface UserBlockDetailDto {
  id: number;
  userId: string;
  blockedUserId: string;
  reason: string | null;
  createdAt: Date;
}

/**
 * @interface UserBlockCreatableDto
 * @description 拉黑用户可创建字段
 * @property {string} blockedUserId - 被拉黑用户ID
 * @property {string} reason - 拉黑原因
 */
export interface UserBlockCreatableDto {
  blockedUserId: string;
  reason?: string;
}

/**
 * @interface UserUnblockDto
 * @description 解除拉黑
 * @property {string} blockedUserId - 被拉黑用户ID
 */
export interface UserUnblockDto {
  blockedUserId: string;
}

/**
 * @interface UserBlockCheckDto
 * @description 检查是否拉黑
 * @property {string} userId - 用户ID
 * @property {string} targetUserId - 目标用户ID
 */
export interface UserBlockCheckDto {
  userId: string;
  targetUserId: string;
}

/**
 * @interface UserBlockCheckResponseDto
 * @description 拉黑检查响应
 * @property {boolean} isBlocked - 是否已拉黑
 * @property {boolean} isMutual - 是否互相拉黑
 */
export interface UserBlockCheckResponseDto {
  isBlocked: boolean;
  isMutual: boolean;
}
