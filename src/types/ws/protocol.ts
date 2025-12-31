/**
 * @packageDocumentation
 * @module types/ws/protocol
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 协议类型定义
 */

/**
 * @type EventType
 * @description 事件类型枚举
 */
export type EventType = "req" | "ack" | "push";

/**
 * @interface WsEvent
 * @description WebSocket 事件基础接口
 */
export interface WsEvent {
  /** 事件名称，格式：<模块>.<功能>.<类型> */
  event: string;
  /** 响应码（仅ACK事件） */
  code?: string;
  /** 错误信息（可选） */
  message?: string;
  /** 事件数据 */
  data?: any;
  /** 请求ID（用于匹配请求-响应） */
  requestId?: string;
  /** 协议版本 */
  version?: string;
}

/**
 * @interface WsRequest
 * @description WebSocket 请求事件（C→S）
 */
export interface WsRequest extends WsEvent {
  event: `${string}.req`;
  requestId: string;
}

/**
 * @interface WsAcknowledge
 * @description WebSocket 响应事件（S→C）
 */
export interface WsAcknowledge extends WsEvent {
  event: `${string}.ack`;
  code: string;
  requestId: string;
}

/**
 * @interface WsPush
 * @description WebSocket 推送事件（S→C）
 */
export interface WsPush extends WsEvent {
  event: `${string}.push`;
}

/**
 * @type EventHandler
 * @description 事件处理器函数类型
 */
export type EventHandler = (socket: any, event: WsEvent) => Promise<void> | void;

/**
 * @interface EventHandlerMap
 * @description 事件处理器映射表
 */
export interface EventHandlerMap {
  [eventName: string]: EventHandler;
}
