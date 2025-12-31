/**
 * @packageDocumentation
 * @module routes/ws/protocol
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 协议定义与验证
 */

import type { WsEvent } from "@/types/ws/protocol";
import { WS_CONFIG } from "@/constants/ws/config";
import { WS_ERROR_CODES } from "@/constants/ws/errors";

/**
 * @function validateEvent
 * @description 验证 WebSocket 事件格式
 * @param data 原始数据
 * @returns 验证结果
 */
export function validateEvent(data: any): {
  valid: boolean;
  event?: WsEvent;
  error?: { code: string; message: string };
} {
  // 检查是否为对象
  if (typeof data !== "object" || data === null) {
    return {
      valid: false,
      error: {
        code: WS_ERROR_CODES.INVALID_MESSAGE,
        message: "Message must be a JSON object",
      },
    };
  }

  // 检查必需字段
  if (typeof data.event !== "string" || !data.event) {
    return {
      valid: false,
      error: {
        code: WS_ERROR_CODES.INVALID_REQUEST,
        message: "Missing required field: event",
      },
    };
  }

  // 检查协议版本（可选）
  if (data.version && data.version !== WS_CONFIG.PROTOCOL_VERSION) {
    return {
      valid: false,
      error: {
        code: WS_ERROR_CODES.INVALID_REQUEST,
        message: `Unsupported protocol version: ${data.version}`,
      },
    };
  }

  return {
    valid: true,
    event: data as WsEvent,
  };
}

/**
 * @function parseMessage
 * @description 解析 WebSocket 消息
 * @param message 原始消息（字符串或 Buffer）
 * @returns 解析结果
 */
export function parseMessage(message: string | Buffer): {
  valid: boolean;
  event?: WsEvent;
  error?: { code: string; message: string };
} {
  try {
    const text = typeof message === "string" ? message : message.toString("utf-8");
    const data = JSON.parse(text);
    return validateEvent(data);
  } catch (error: any) {
    return {
      valid: false,
      error: {
        code: WS_ERROR_CODES.INVALID_MESSAGE,
        message: "Invalid JSON format",
      },
    };
  }
}

/**
 * @function createAckEvent
 * @description 创建 ACK 响应事件
 * @param eventName 事件名称
 * @param code 响应码
 * @param data 响应数据
 * @param requestId 请求ID（可选）
 * @param message 消息（可选）
 * @returns ACK 事件
 */
export function createAckEvent(
  eventName: string,
  code: string,
  data?: any,
  requestId?: string,
  message?: string
): WsEvent {
  const event: WsEvent = {
    event: eventName,
    code,
    version: WS_CONFIG.PROTOCOL_VERSION,
  };

  if (requestId) {
    event.requestId = requestId;
  }

  if (data !== undefined) {
    event.data = data;
  }

  if (message) {
    event.message = message;
  }

  return event;
}

/**
 * @function createPushEvent
 * @description 创建 PUSH 推送事件
 * @param eventName 事件名称
 * @param data 推送数据
 * @returns PUSH 事件
 */
export function createPushEvent(eventName: string, data: any): WsEvent {
  return {
    event: eventName,
    data,
    version: WS_CONFIG.PROTOCOL_VERSION,
  };
}

/**
 * @function createErrorEvent
 * @description 创建错误事件
 * @param code 错误码
 * @param message 错误消息
 * @param requestId 请求ID（可选）
 * @returns 错误事件
 */
export function createErrorEvent(
  code: string,
  message: string,
  requestId?: string
): WsEvent {
  const event: WsEvent = {
    event: "error",
    code,
    message,
    version: WS_CONFIG.PROTOCOL_VERSION,
  };

  if (requestId) {
    event.requestId = requestId;
  }

  return event;
}
