/**
 * @packageDocumentation
 * @module dto/user/friend-request-event
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 好友申请事件审计数据传输对象
 */

/**
 * @interface FriendRequestEventListDto
 * @description 好友申请事件列表项
 * @property {number} id - 事件ID
 * @property {string} fromId - 申请人ID
 * @property {string} toId - 被申请人ID
 * @property {string | null} message - 申请消息
 * @property {'pending' | 'approved' | 'rejected' | 'ignored'} status - 申请状态
 * @property {Date} createdAt - 创建时间
 * @property {Date} expiresAt - 过期时间
 */
export interface FriendRequestEventListDto {
  id: number;
  fromId: string;
  toId: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'ignored';
  createdAt: Date;
  expiresAt: Date;
}

/**
 * @interface FriendRequestEventDetailDto
 * @description 好友申请事件详情
 * @property {number} id - 事件ID
 * @property {string} fromId - 申请人ID
 * @property {string} toId - 被申请人ID
 * @property {string | null} message - 申请消息
 * @property {'pending' | 'approved' | 'rejected' | 'ignored'} status - 申请状态
 * @property {Date | null} reviewedAt - 处理时间
 * @property {string | null} reason - 拒绝原因
 * @property {Date} createdAt - 创建时间
 * @property {Date} expiresAt - 过期时间
 */
export interface FriendRequestEventDetailDto {
  id: number;
  fromId: string;
  toId: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'ignored';
  reviewedAt: Date | null;
  reason: string | null;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * @interface CreateFriendRequestEventDto
 * @description 创建好友申请事件
 * @property {string} toId - 被申请人ID
 * @property {string} [message] - 申请消息
 */
export interface CreateFriendRequestEventDto {
  toId: string;
  message?: string;
}

/**
 * @interface ReviewFriendRequestEventDto
 * @description 审核好友申请
 * @property {'approved' | 'rejected' | 'ignored'} status - 审核结果
 * @property {string} [reason] - 拒绝原因
 */
export interface ReviewFriendRequestEventDto {
  status: 'approved' | 'rejected' | 'ignored';
  reason?: string;
}

/**
 * @interface FriendRequestEventQueryDto
 * @description 好友申请事件查询
 * @property {string} [userId] - 用户ID（fromId或toId）
 * @property {'pending' | 'approved' | 'rejected' | 'ignored'} [status] - 申请状态
 * @property {Date} [startDate] - 开始日期
 * @property {Date} [endDate] - 结束日期
 * @property {number} [page] - 页码
 * @property {number} [pageSize] - 每页数量
 */
export interface FriendRequestEventQueryDto {
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'ignored';
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}
