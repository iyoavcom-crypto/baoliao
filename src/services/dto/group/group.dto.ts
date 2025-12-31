/**
 * @packageDocumentation
 * @module dto/group/group
 * @since 1.0.0 (2025-12-26)
 * @author Z-kali
 * @description 群组数据传输对象，处理通信层与模型层之间的字段映射
 */

/**
 * @interface GroupListDto
 * @description 群组列表项
 * @property {number} id - 群组ID
 * @property {string} name - 群组名称
 * @property {string} avatarUrl - 群头像URL
 * @property {string} userId - 群主ID
 * @property {'active' | 'dissolved'} status - 群状态
 * @property {number} capacity - 群容量
 * @property {Date} createdAt - 创建时间
 */
export interface GroupListDto {
  id: number;
  name: string;
  avatarUrl: string;
  userId: string;
  status: 'active' | 'dissolved';
  capacity: number;
  createdAt: Date;
}

/**
 * @interface GroupDetailDto
 * @description 群组详情
 * @property {number} id - 群组ID
 * @property {string} name - 群组名称
 * @property {string} avatarUrl - 群头像URL
 * @property {string} description - 群简介
 * @property {string} userId - 群主ID
 * @property {string} pinnedMessageId - 置顶消息ID
 * @property {'active' | 'dissolved'} status - 群状态
 * @property {boolean} muteAll - 是否全员禁言
 * @property {number} capacity - 群容量
 * @property {Date} capacityUpdatedAt - 容量更新时间
 * @property {'invite' | 'request' | 'open'} joinPolicy - 加群策略
 * @property {boolean} allowMemberInvite - 是否允许成员邀请
 * @property {boolean} allowSearchJoin - 是否允许搜索加群
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */
export interface GroupDetailDto {
  id: number;
  name: string;
  avatarUrl: string;
  description: string;
  userId: string;
  pinnedMessageId: number | null;  // 修正：模型中为 BIGINT，不是 string
  status: 'active' | 'dissolved';
  muteAll: boolean;
  capacity: number;
  capacityUpdatedAt: Date;
  joinPolicy: 'invite' | 'request' | 'open';
  allowMemberInvite: boolean;
  allowSearchJoin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface GroupUpdatableDto
 * @description 群组可更新字段
 * @property {string} name - 群组名称
 * @property {string} avatarUrl - 群头像URL
 * @property {string} description - 群简介
 * @property {string} pinnedMessageId - 置顶消息ID
 * @property {boolean} muteAll - 是否全员禁言
 * @property {number} capacity - 群容量
 * @property {'invite' | 'request' | 'open'} joinPolicy - 加群策略
 * @property {boolean} allowMemberInvite - 是否允许成员邀请
 * @property {boolean} allowSearchJoin - 是否允许搜索加群
 */
export interface GroupUpdatableDto {
  name?: string;
  avatarUrl?: string;
  description?: string;
  pinnedMessageId?: number | null;  // 修正：模型中为 BIGINT，不是 string
  muteAll?: boolean;
  capacity?: number;
  joinPolicy?: 'invite' | 'request' | 'open';
  allowMemberInvite?: boolean;
  allowSearchJoin?: boolean;
}

/**
 * @interface GroupCreatableDto
 * @description 群组可创建字段
 * @property {string} name - 群组名称
 * @property {string} avatarUrl - 群头像URL
 * @property {string} description - 群简介
 * @property {string} userId - 群主ID
 * @property {number} capacity - 群容量
 * @property {'invite' | 'request' | 'open'} joinPolicy - 加群策略
 * @property {boolean} allowMemberInvite - 是否允许成员邀请
 * @property {boolean} allowSearchJoin - 是否允许搜索加群
 */
export interface GroupCreatableDto {
  name: string;
  avatarUrl?: string;
  description?: string;
  userId: string;
  capacity?: number;
  joinPolicy?: 'invite' | 'request' | 'open';
  allowMemberInvite?: boolean;
  allowSearchJoin?: boolean;
}