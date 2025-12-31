/**
 * @packageDocumentation
 * @module dto/message/history
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 消息历史相关数据传输对象
 */

/**
 * @interface MessageHistoryRequestDto
 * @description 消息历史请求体
 * @property {number} conversationId - 会话ID
 * @property {number} beforeSeq - 序列号（拉取此序列号之前的消息）
 * @property {number} limit - 限制数量
 */
export interface MessageHistoryRequestDto {
  conversationId: number;
  beforeSeq?: number;
  limit?: number;
}

/**
 * @interface MessageHistoryResponseDto
 * @description 消息历史响应体
 * @property {Array<Message>} items - 消息列表
 * @property {number} page - 页码
 * @property {number} size - 每页大小
 * @property {number} total - 总数
 * @property {'seq' | 'createdAt'} orderBy - 排序字段
 * @property {'ASC' | 'DESC'} order - 排序方式
 */
export interface MessageHistoryResponseDto {
  items: MessageHistoryItemDto[];
  page: number;
  size: number;
  total: number;
  orderBy: 'seq' | 'createdAt';
  order: 'ASC' | 'DESC';
}

/**
 * @interface MessageHistoryItemDto
 * @description 消息历史项
 * @property {string} id - 消息ID
 * @property {string} msgId - 消息唯一ID
 * @property {number} conversationId - 会话ID
 * @property {number} seq - 序列号
 * @property {string} kind - 消息类型
 * @property {any} content - 消息内容
 * @property {string} senderId - 发送者ID
 * @property {string} clientMsgId - 客户端消息ID
 * @property {Date} serverReceivedAt - 服务器接收时间
 * @property {Date} createdAt - 创建时间
 * @property {Date | null} recalledAt - 撤回时间
 * @property {string | null} recalledBy - 撤回者
 * @property {string | null} recallReason - 撤回原因
 */
export interface MessageHistoryItemDto {
  id: string;
  msgId: string;
  conversationId: number;
  seq: number;
  kind: string;
  content: any;
  senderId: string;
  clientMsgId: string;
  serverReceivedAt: Date;
  createdAt: Date;
  recalledAt: Date | null;
  recalledBy: string | null;
  recallReason: string | null;
}