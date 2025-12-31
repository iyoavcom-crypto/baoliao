/**
 * @packageDocumentation
 * @module dto/group/member
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群组成员相关数据传输对象
 */

/**
 * @interface GroupMemberListDto
 * @description 群成员列表项
 * @property {number} id - 成员ID
 * @property {number} groupId - 群组ID
 * @property {string} userId - 用户ID
 * @property {'owner' | 'admin' | 'member'} role - 角色
 * @property {string | null} nicknameInGroup - 群内昵称
 * @property {Date} joinedAt - 进群时间
 */
export interface GroupMemberListDto {
  id: number;
  groupId: number;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  nicknameInGroup: string | null;
  joinedAt: Date;
}

/**
 * @interface GroupMemberDetailDto
 * @description 群成员详情
 * @property {number} id - 成员ID
 * @property {number} groupId - 群组ID
 * @property {string} userId - 用户ID
 * @property {'owner' | 'admin' | 'member'} role - 角色
 * @property {string | null} nicknameInGroup - 群内昵称
 * @property {Date} joinedAt - 进群时间
 * @property {'invited' | 'search'} joinMethod - 进群方式
 * @property {string | null} invitedBy - 邀请人ID
 * @property {boolean} muted - 是否被禁言
 * @property {Date | null} mutedUntil - 禁言截止时间
 * @property {Date} createdAt - 创建时间
 */
export interface GroupMemberDetailDto {
  id: number;
  groupId: number;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  nicknameInGroup: string | null;
  joinedAt: Date;
  joinMethod: 'invited' | 'search';
  invitedBy: string | null;
  muted: boolean;
  mutedUntil: Date | null;
  createdAt: Date;
}

/**
 * @interface GroupMemberCreatableDto
 * @description 群成员可创建字段
 * @property {number} groupId - 群组ID
 * @property {string} userId - 用户ID
 * @property {'invited' | 'search'} joinMethod - 进群方式
 * @property {string} invitedBy - 邀请人ID
 */
export interface GroupMemberCreatableDto {
  groupId: number;
  userId: string;
  joinMethod: 'invited' | 'search';
  invitedBy?: string;
}

/**
 * @interface GroupMemberUpdatableDto
 * @description 群成员可更新字段
 * @property {'owner' | 'admin' | 'member'} role - 角色
 * @property {string} nicknameInGroup - 群内昵称
 * @property {boolean} muted - 是否被禁言
 * @property {Date} mutedUntil - 禁言截止时间
 */
export interface GroupMemberUpdatableDto {
  role?: 'owner' | 'admin' | 'member';
  nicknameInGroup?: string;
  muted?: boolean;
  mutedUntil?: Date | null;
}
