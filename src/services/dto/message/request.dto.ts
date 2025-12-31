/**
 * @packageDocumentation
 * @module dto/message/request
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息请求相关数据传输对象
 */

/**
 * @interface MessageRequestListDto
 * @description 消息请求列表项
 * @property {number} id - 请求ID
 * @property {string} fromUserId - 发起人ID
 * @property {string} toUserId - 接收人ID
 * @property {string | null} firstMessagePreview - 首条消息预览
 * @property {'pending' | 'accepted' | 'rejected' | 'expired'} status - 状态
 * @property {Date} createdAt - 创建时间
 */
export interface MessageRequestListDto {
  id: number;
  fromUserId: string;
  toUserId: string;
  firstMessagePreview: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
}

/**
 * @interface MessageRequestDetailDto
 * @description 消息请求详情
 * @property {number} id - 请求ID
 * @property {string} fromUserId - 发起人ID
 * @property {string} toUserId - 接收人ID
 * @property {string | null} firstMessagePreview - 首条消息预览
 * @property {'pending' | 'accepted' | 'rejected' | 'expired'} status - 状态
 * @property {Date} createdAt - 创建时间
 * @property {Date | null} respondedAt - 响应时间
 */
export interface MessageRequestDetailDto {
  id: number;
  fromUserId: string;
  toUserId: string;
  firstMessagePreview: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  respondedAt: Date | null;
}

/**
 * @interface MessageRequestCreatableDto
 * @description 消息请求可创建字段
 * @property {string} toUserId - 接收人ID
 * @property {string} firstMessagePreview - 首条消息预览
 */
export interface MessageRequestCreatableDto {
  toUserId: string;
  firstMessagePreview?: string;
}

/**
 * @interface MessageRequestHandleDto
 * @description 处理消息请求
 * @property {number} requestId - 请求ID
 * @property {'accepted' | 'rejected'} action - 操作
 */
export interface MessageRequestHandleDto {
  requestId: number;
  action: 'accepted' | 'rejected';
}
