/**
 * @packageDocumentation
 * @module dto/group/invite
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群组邀请相关数据传输对象
 */

/**
 * @interface GroupInviteListDto
 * @description 群邀请列表项
 * @property {number} id - 邀请ID
 * @property {number} groupId - 群组ID
 * @property {string} creatorId - 创建者ID
 * @property {string} code - 邀请码
 * @property {'link' | 'qrcode'} type - 类型
 * @property {number} uses - 使用次数
 * @property {number | null} maxUses - 最大使用次数
 * @property {Date | null} expiresAt - 过期时间
 */
export interface GroupInviteListDto {
  id: number;
  groupId: number;
  creatorId: string;
  code: string;
  type: 'link' | 'qrcode';
  uses: number;
  maxUses: number | null;
  expiresAt: Date | null;
}

/**
 * @interface GroupInviteDetailDto
 * @description 群邀请详情
 * @property {number} id - 邀请ID
 * @property {number} groupId - 群组ID
 * @property {string} creatorId - 创建者ID
 * @property {string} code - 邀请码
 * @property {'link' | 'qrcode'} type - 类型
 * @property {number} uses - 使用次数
 * @property {number | null} maxUses - 最大使用次数
 * @property {Date | null} expiresAt - 过期时间
 * @property {Date} createdAt - 创建时间
 */
export interface GroupInviteDetailDto {
  id: number;
  groupId: number;
  creatorId: string;
  code: string;
  type: 'link' | 'qrcode';
  uses: number;
  maxUses: number | null;
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * @interface GroupInviteCreatableDto
 * @description 群邀请可创建字段
 * @property {number} groupId - 群组ID
 * @property {'link' | 'qrcode'} type - 类型
 * @property {number} maxUses - 最大使用次数
 * @property {Date} expiresAt - 过期时间
 */
export interface GroupInviteCreatableDto {
  groupId: number;
  type: 'link' | 'qrcode';
  maxUses?: number | null;
  expiresAt?: Date | null;
}

/**
 * @interface GroupInviteUseDto
 * @description 使用群邀请
 * @property {string} code - 邀请码
 */
export interface GroupInviteUseDto {
  code: string;
}
