/**
 * @packageDocumentation
 * @module dto/message/recall
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息撤回相关数据传输对象
 */

/**
 * @interface MessageRecallListDto
 * @description 消息撤回记录列表项
 * @property {number} id - 撤回记录ID
 * @property {number} messageId - 消息ID
 * @property {string} recalledBy - 撤回人ID
 * @property {Date} recalledAt - 撤回时间
 * @property {boolean} isAdmin - 是否管理员撤回
 */
export interface MessageRecallListDto {
  id: number;
  messageId: number;
  recalledBy: string;
  recalledAt: Date;
  isAdmin: boolean;
}

/**
 * @interface MessageRecallDetailDto
 * @description 消息撤回记录详情
 * @property {number} id - 撤回记录ID
 * @property {number} messageId - 消息ID
 * @property {string} recalledBy - 撤回人ID
 * @property {Date} recalledAt - 撤回时间
 * @property {string | null} reason - 撤回原因
 * @property {boolean} isAdmin - 是否管理员撤回
 */
export interface MessageRecallDetailDto {
  id: number;
  messageId: number;
  recalledBy: string;
  recalledAt: Date;
  reason: string | null;
  isAdmin: boolean;
}

/**
 * @interface MessageRecallRequestDto
 * @description 撤回消息请求
 * @property {number} messageId - 消息ID
 * @property {string} reason - 撤回原因
 */
export interface MessageRecallRequestDto {
  messageId: number;
  reason?: string;
}
