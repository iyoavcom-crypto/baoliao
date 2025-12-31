/**
 * @packageDocumentation
 * @module dto/group/join-request
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 群组加入请求相关数据传输对象
 */

/**
 * @interface GroupJoinRequestListDto
 * @description 加群请求列表项
 * @property {number} id - 请求ID
 * @property {number} groupId - 群组ID
 * @property {string} userId - 用户ID
 * @property {'pending' | 'accepted' | 'rejected'} status - 状态
 * @property {Date} createdAt - 创建时间
 */
export interface GroupJoinRequestListDto {
  id: number;
  groupId: number;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

/**
 * @interface GroupJoinRequestDetailDto
 * @description 加群请求详情
 * @property {number} id - 请求ID
 * @property {number} groupId - 群组ID
 * @property {string} userId - 用户ID
 * @property {string | null} inviterId - 邀请人ID
 * @property {string | null} reason - 申请理由
 * @property {'pending' | 'accepted' | 'rejected'} status - 状态
 * @property {Date} createdAt - 创建时间
 * @property {Date | null} handledAt - 处理时间
 * @property {string | null} handledBy - 处理人ID
 */
export interface GroupJoinRequestDetailDto {
  id: number;
  groupId: number;
  userId: string;
  inviterId: string | null;
  reason: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  handledAt: Date | null;
  handledBy: string | null;
}

/**
 * @interface GroupJoinRequestCreatableDto
 * @description 加群请求可创建字段
 * @property {number} groupId - 群组ID
 * @property {string} reason - 申请理由
 */
export interface GroupJoinRequestCreatableDto {
  groupId: number;
  reason?: string;
}

/**
 * @interface GroupJoinRequestHandleDto
 * @description 处理加群请求
 * @property {number} requestId - 请求ID
 * @property {'accepted' | 'rejected'} action - 操作
 */
export interface GroupJoinRequestHandleDto {
  requestId: number;
  action: 'accepted' | 'rejected';
}
