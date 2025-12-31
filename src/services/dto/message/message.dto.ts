/**
 * @packageDocumentation
 * @module dto/message/message
 * @since 1.0.0 (2025-12-26)
 * @author Z-kali
 * @description 消息数据传输对象，处理通信层与模型层之间的字段映射
 */

import type { MessageType as MessageKind } from "@/constants/index.js";
import type { MessageContent } from "@/models/message/message.js";

/**
 * @interface MessageListDto
 * @description 消息列表项
 * @property {string} id - 消息ID
 * @property {number} conversationId - 会话ID
 * @property {number} seq - 序列号
 * @property {MessageKind} kind - 消息类型
 * @property {string} senderId - 发送者ID
 * @property {Date} createdAt - 创建时间
 */
export interface MessageListDto {
  id: string;
  conversationId: number;
  seq: number;
  kind: MessageKind;
  senderId: string;
  createdAt: Date;
}

/**
 * @interface MessageDetailDto
 * @description 消息详情
 * @property {string} id - 消息ID
 * @property {string} msgId - 业务消息ID
 * @property {number} conversationId - 会话ID
 * @property {number} seq - 序列号
 * @property {MessageKind} kind - 消息类型
 * @property {MessageContent} content - 消息内容
 * @property {string} senderId - 发送者ID
 * @property {string} clientMsgId - 客户端消息ID
 * @property {Date} serverReceivedAt - 服务器接收时间
 * @property {Date} createdAt - 创建时间
 * @property {Date | undefined} recalledAt - 撤回时间
 * @property {string | undefined} recalledBy - 撤回者ID
 * @property {string | undefined} recallReason - 撤回原因
 */
export interface MessageDetailDto {
  id: string;
  msgId: string;
  conversationId: number;
  seq: number;
  kind: MessageKind;
  content: MessageContent;
  senderId: string;
  clientMsgId: string;
  serverReceivedAt: Date;
  createdAt: Date;
  
  // 撤回相关
  recalledAt?: Date;
  recalledBy?: string;
  recallReason?: string;
  
  // ✅ 新增：附件与提及（JSON冗余字段，与 message_attachments/message_mentions 表并存）
  attachments?: Array<{url: string; type: string; name?: string; size?: number}>;
  mentionedUserIds?: string[];
  
  // ✅ 新增：回复消息
  repliedMessageId?: number | null;
  
  // ✅ 新增：删除相关
  deletedForAll: boolean;
  deleted: boolean;
  deletedAt?: Date | null;
  
  // ✅ 新增：编辑相关
  edited: boolean;
  editedAt?: Date | null;
}

/**
 * @interface MessageUpdatableDto
 * @description 消息可更新字段（仅撤回相关）
 * @property {Date} recalledAt - 撤回时间
 * @property {string} recalledBy - 撤回者ID
 * @property {string} recallReason - 撤回原因
 */
export interface MessageUpdatableDto {
  recalledAt?: Date;
  recalledBy?: string;
  recallReason?: string;
}

/**
 * @interface MessageCreatableDto
 * @description 消息可创建字段
 * @property {string} msgId - 业务消息ID
 * @property {number} conversationId - 会话ID
 * @property {number} seq - 序列号
 * @property {MessageKind} kind - 消息类型
 * @property {MessageContent} content - 消息内容
 * @property {string} senderId - 发送者ID
 * @property {string} clientMsgId - 客户端消息ID
 * @property {Date} serverReceivedAt - 服务器接收时间
 */
export interface MessageCreatableDto {
  msgId: string;
  conversationId: number;
  seq: number;
  kind: MessageKind;
  content: MessageContent;
  senderId: string;
  clientMsgId: string;
  serverReceivedAt: Date;
}