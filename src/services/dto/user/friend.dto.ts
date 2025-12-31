/**
 * @packageDocumentation
 * @module dto/user/friend
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 用户好友相关数据传输对象
 */

/**
 * @interface FriendListDto
 * @description 好友列表项
 * @property {number} id - 好友关系ID
 * @property {string} userId - 当前用户ID
 * @property {string} friendId - 好友用户ID
 * @property {'pending' | 'accepted' | 'rejected' | 'blocked'} status - 关系状态
 * @property {string | null} remark - 备注
 * @property {Date} requestedAt - 请求时间
 */
export interface FriendListDto {
  id: number;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  remark: string | null;
  requestedAt: Date;
}

/**
 * @interface FriendDetailDto
 * @description 好友详情
 * @property {number} id - 好友关系ID
 * @property {string} userId - 当前用户ID
 * @property {string} friendId - 好友用户ID
 * @property {'pending' | 'accepted' | 'rejected' | 'blocked'} status - 关系状态
 * @property {string | null} requestedBy - 发起方用户ID
 * @property {string | null} blockedBy - 拉黑方用户ID
 * @property {string | null} blockReason - 拉黑原因
 * @property {string | null} source - 来源
 * @property {Date} requestedAt - 请求时间
 * @property {Date | null} respondedAt - 响应时间
 * @property {string | null} remark - 备注
 * @property {Date} createdAt - 创建时间
 */
export interface FriendDetailDto {
  id: number;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  requestedBy: string | null;
  blockedBy: string | null;
  blockReason: string | null;
  source: string | null;
  requestedAt: Date;
  respondedAt: Date | null;
  remark: string | null;
  createdAt: Date;
}

/**
 * @interface FriendRequestDto
 * @description 好友请求
 * @property {string} friendId - 好友用户ID
 * @property {string} source - 来源
 * @property {string} remark - 备注
 */
export interface FriendRequestDto {
  friendId: string;
  source?: string;
  remark?: string;
}

/**
 * @interface FriendAcceptDto
 * @description 接受好友请求
 * @property {string} friendId - 好友用户ID
 * @property {string} remark - 备注
 */
export interface FriendAcceptDto {
  friendId: string;
  remark?: string;
}

/**
 * @interface FriendBlockDto
 * @description 拉黑好友
 * @property {string} friendId - 好友用户ID
 * @property {string} reason - 拉黑原因
 */
export interface FriendBlockDto {
  friendId: string;
  reason?: string;
}

/**
 * @interface FriendUpdatableDto
 * @description 好友可更新字段
 * @property {string} remark - 备注
 */
export interface FriendUpdatableDto {
  remark?: string;
}
