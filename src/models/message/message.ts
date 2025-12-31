/**
 * @packageDocumentation
 * @module models/message
 * @since 1.0.0 (2025-12-23)
 * @author Z-kali
 * @description 消息模型定义
 */

import type { MessageType as MessageKind } from "@/constants/index.js";

/**
 * @interface MessageContent
 * @description 消息内容结构，支持多种内容类型
 * @property {string} kind - 消息内容类型
 */
export type MessageContent =
  | { kind: "text"; text: string }
  | { kind: "image"; url: string; width?: number; height?: number; size?: number }
  | { kind: "emoji"; shortcode: string }
  | { kind: "file"; url: string; name: string; size: number }
  | { kind: "voice"; url: string; duration: number }
  | { kind: "custom"; data: Record<string, unknown> };

/**
 * @interface Message
 * @description 消息领域对象
 * @property {string} id - 消息ID
 * @property {string} msgId - 业务消息ID（与数据库模型对齐）
 * @property {number} conversationId - 会话ID（与数据库模型对齐）
 * @property {number} seq - 会话内自增序列号
 * @property {MessageKind} kind - 消息类型
 * @property {MessageContent} content - 消息内容结构
 * @property {string} senderId - 发送者用户ID
 * @property {string} clientMsgId - 客户端幂等ID
 * @property {Date} serverReceivedAt - 服务器接收时间
 * @property {Date} createdAt - 创建时间
 * @property {Date} [recalledAt] - 撤回时间（可选）
 * @property {string} [recalledBy] - 撤回操作者ID（可选）
 * @property {string} [recallReason] - 撤回原因（可选）
 */
export interface Message {
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
  recalledAt?: Date;
  recalledBy?: string;
  recallReason?: string;
}
