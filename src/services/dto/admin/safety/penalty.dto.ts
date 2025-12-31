/**
 * @packageDocumentation
 * @module dto/admin/safety/penalty
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 用户处罚相关数据传输对象
 */

/**
 * @interface PenaltyListDto
 * @description 处罚列表项
 * @property {number} id - 处罚ID
 * @property {string} userId - 用户ID
 * @property {'ban_account' | 'ban_chat' | 'ban_add_friend' | 'ban_create_group'} type - 处罚类型
 * @property {string} reason - 处罚原因
 * @property {Date | null} expiresAt - 过期时间
 * @property {string} operatorId - 操作员ID
 * @property {boolean} active - 是否生效中
 * @property {Date} createdAt - 创建时间
 */
export interface PenaltyListDto {
  id: number;
  userId: string;
  type: 'ban_account' | 'ban_chat' | 'ban_add_friend' | 'ban_create_group';
  reason: string;
  expiresAt: Date | null;
  operatorId: string;
  active: boolean;
  createdAt: Date;
}

/**
 * @interface PenaltyDetailDto
 * @description 处罚详情
 * @property {number} id - 处罚ID
 * @property {string} userId - 用户ID
 * @property {'ban_account' | 'ban_chat' | 'ban_add_friend' | 'ban_create_group'} type - 处罚类型
 * @property {string} reason - 处罚原因
 * @property {Date | null} expiresAt - 过期时间
 * @property {string} operatorId - 操作员ID
 * @property {boolean} active - 是否生效中
 * @property {Date} createdAt - 创建时间
 */
export interface PenaltyDetailDto {
  id: number;
  userId: string;
  type: 'ban_account' | 'ban_chat' | 'ban_add_friend' | 'ban_create_group';
  reason: string;
  expiresAt: Date | null;
  operatorId: string;
  active: boolean;
  createdAt: Date;
}

/**
 * @interface PenaltyCreatableDto
 * @description 处罚可创建字段
 * @property {string} userId - 用户ID
 * @property {'ban_account' | 'ban_chat' | 'ban_add_friend' | 'ban_create_group'} type - 处罚类型
 * @property {string} reason - 处罚原因
 * @property {Date} expiresAt - 过期时间
 */
export interface PenaltyCreatableDto {
  userId: string;
  type: 'ban_account' | 'ban_chat' | 'ban_add_friend' | 'ban_create_group';
  reason: string;
  expiresAt?: Date;
}

/**
 * @interface PenaltyUpdatableDto
 * @description 处罚可更新字段
 * @property {boolean} active - 是否生效中
 */
export interface PenaltyUpdatableDto {
  active?: boolean;
}
