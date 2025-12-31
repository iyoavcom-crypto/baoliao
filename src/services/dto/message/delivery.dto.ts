/**
 * @packageDocumentation
 * @module dto/message/delivery
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息投递相关数据传输对象
 */

/**
 * @interface MessageDeliveryListDto
 * @description 消息投递列表项
 * @property {number} id - 投递ID
 * @property {number} messageId - 消息ID
 * @property {string} toUserId - 接收人ID
 * @property {'queued' | 'sent' | 'delivered' | 'failed'} status - 状态
 * @property {Date | null} deliveredAt - 投递时间
 */
export interface MessageDeliveryListDto {
  id: number;
  messageId: number;
  toUserId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  deliveredAt: Date | null;
}

/**
 * @interface MessageDeliveryDetailDto
 * @description 消息投递详情
 * @property {number} id - 投递ID
 * @property {number} messageId - 消息ID
 * @property {string} toUserId - 接收人ID
 * @property {string | null} toDeviceId - 接收设备ID
 * @property {'queued' | 'sent' | 'delivered' | 'failed'} status - 状态
 * @property {number} attempts - 重试次数
 * @property {Date | null} lastAttemptAt - 最后尝试时间
 * @property {Date | null} deliveredAt - 投递时间
 * @property {string | null} failReason - 失败原因
 * @property {Date} createdAt - 创建时间
 */
export interface MessageDeliveryDetailDto {
  id: number;
  messageId: number;
  toUserId: string;
  toDeviceId: string | null;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt: Date | null;
  deliveredAt: Date | null;
  failReason: string | null;
  createdAt: Date;
}

/**
 * @interface MessageDeliveryCreatableDto
 * @description 消息投递可创建字段
 * @property {number} messageId - 消息ID
 * @property {string} toUserId - 接收人ID
 * @property {string} toDeviceId - 接收设备ID
 */
export interface MessageDeliveryCreatableDto {
  messageId: number;
  toUserId: string;
  toDeviceId?: string;
}

/**
 * @interface MessageDeliveryUpdatableDto
 * @description 消息投递可更新字段
 * @property {'queued' | 'sent' | 'delivered' | 'failed'} status - 状态
 * @property {Date} deliveredAt - 投递时间
 * @property {string} failReason - 失败原因
 */
export interface MessageDeliveryUpdatableDto {
  status?: 'queued' | 'sent' | 'delivered' | 'failed';
  deliveredAt?: Date;
  failReason?: string;
}
