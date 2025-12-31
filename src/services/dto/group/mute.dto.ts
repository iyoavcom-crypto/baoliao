/**
 * @packageDocumentation
 * @module dto/group/mute
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群禁言管理相关数据传输对象
 */

/**
 * @interface GroupMuteListDto
 * @description 群禁言列表项
 * @property {number} id - 禁言记录ID
 * @property {number} groupId - 群组ID
 * @property {string | null} userId - 被禁言用户ID（null表示全员禁言）
 * @property {string} mutedBy - 禁言操作人ID
 * @property {Date | null} muteUntil - 禁言截止时间（null表示永久）
 * @property {string | null} reason - 禁言原因
 * @property {Date} createdAt - 创建时间
 */
export interface GroupMuteListDto {
  id: number;
  groupId: number;
  userId: string | null;
  mutedBy: string;
  muteUntil: Date | null;
  reason: string | null;
  createdAt: Date;
}

/**
 * @interface GroupMuteDetailDto
 * @description 群禁言详情
 * @property {number} id - 禁言记录ID
 * @property {number} groupId - 群组ID
 * @property {string | null} userId - 被禁言用户ID
 * @property {string} mutedBy - 禁言操作人ID
 * @property {Date | null} muteUntil - 禁言截止时间
 * @property {string | null} reason - 禁言原因
 * @property {boolean} isActive - 是否生效中
 * @property {Date} createdAt - 创建时间
 */
export interface GroupMuteDetailDto {
  id: number;
  groupId: number;
  userId: string | null;
  mutedBy: string;
  muteUntil: Date | null;
  reason: string | null;
  isActive: boolean;
  createdAt: Date;
}

/**
 * @interface GroupMuteCreatableDto
 * @description 群禁言可创建字段
 * @property {number} groupId - 群组ID
 * @property {string} userId - 被禁言用户ID（不传表示全员禁言）
 * @property {Date} muteUntil - 禁言截止时间
 * @property {string} reason - 禁言原因
 */
export interface GroupMuteCreatableDto {
  groupId: number;
  userId?: string;
  muteUntil?: Date | null;
  reason?: string;
}

/**
 * @interface GroupUnmuteDto
 * @description 解除禁言
 * @property {number} groupId - 群组ID
 * @property {string} userId - 用户ID（不传表示解除全员禁言）
 */
export interface GroupUnmuteDto {
  groupId: number;
  userId?: string;
}

/**
 * @interface GroupMuteBatchDto
 * @description 批量禁言
 * @property {number} groupId - 群组ID
 * @property {string[]} userIds - 用户ID列表
 * @property {Date} muteUntil - 禁言截止时间
 * @property {string} reason - 禁言原因
 */
export interface GroupMuteBatchDto {
  groupId: number;
  userIds: string[];
  muteUntil?: Date | null;
  reason?: string;
}
