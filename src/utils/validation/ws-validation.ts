/**
 * @packageDocumentation
 * @module utils/validation/ws-validation
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket验证工具函数，用于减少WebSocket控制器中的重复验证代码
 */

import type { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import { connectionManager } from "@/routes/ws/connection-manager";
import { createErrorEvent } from "@/routes/ws/protocol";
import { WS_ERROR_CODES } from "@/constants/ws/errors";
import { getLogger } from "@/tools/logging";

const logger = getLogger("ws:validation");

/**
 * @function wsRequireAuth
 * @description 验证WebSocket连接是否已认证
 * @param {WebSocket} socket - WebSocket连接
 * @param {WsEvent} event - WebSocket事件
 * @returns {string | null} 返回userId如果已认证，否则返回null并发送错误事件
 */
export function wsRequireAuth(socket: WebSocket, event: WsEvent): string | null {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(
      JSON.stringify(
        createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)
      )
    );
    return null;
  }
  return userId;
}

/**
 * @function wsValidateRequired
 * @description 验证WebSocket事件数据中的必需字段
 * @param {WebSocket} socket - WebSocket连接
 * @param {WsEvent} event - WebSocket事件
 * @param {Record<string, any>} fields - 需要验证的字段对象
 * @returns {boolean} 如果所有字段都存在返回true，否则返回false并发送错误事件
 */
export function wsValidateRequired(
  socket: WebSocket,
  event: WsEvent,
  fields: Record<string, any>
): boolean {
  const missingFields: string[] = [];
  
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
      missingFields.push(fieldName);
    }
  }
  
  if (missingFields.length > 0) {
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.INVALID_REQUEST,
          `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required`,
          event.requestId
        )
      )
    );
    return false;
  }
  
  return true;
}

/**
 * @function wsValidateData
 * @description 验证WebSocket事件是否包含data字段
 * @param {WebSocket} socket - WebSocket连接
 * @param {WsEvent} event - WebSocket事件
 * @returns {boolean} 如果data存在返回true，否则返回false并发送错误事件
 */
export function wsValidateData(socket: WebSocket, event: WsEvent): boolean {
  if (!event.data || typeof event.data !== "object") {
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.INVALID_REQUEST,
          "Invalid or missing event data",
          event.requestId
        )
      )
    );
    return false;
  }
  return true;
}

/**
 * @interface WsErrorHandlerOptions
 * @description WebSocket错误处理选项
 */
export interface WsErrorHandlerOptions {
  /** 日志上下文信息 */
  logContext?: Record<string, any>;
  /** 是否记录错误日志 */
  logError?: boolean;
  /** 自定义错误消息 */
  errorMessage?: string;
}

/**
 * @function wsHandleError
 * @description WebSocket错误处理包装器
 * @param {WebSocket} socket - WebSocket连接
 * @param {WsEvent} event - WebSocket事件
 * @param {() => Promise<void>} handler - 处理函数
 * @param {WsErrorHandlerOptions} [options] - 选项
 * @returns {Promise<void>}
 */
export async function wsHandleError(
  socket: WebSocket,
  event: WsEvent,
  handler: () => Promise<void>,
  options: WsErrorHandlerOptions = {}
): Promise<void> {
  try {
    await handler();
  } catch (error: any) {
    const { logContext, logError = true, errorMessage } = options;
    
    if (logError) {
      logger.error("[WS] Error handling event", {
        event: event.event,
        error: error.message,
        ...logContext
      });
    }
    
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.INTERNAL_ERROR,
          errorMessage || error.message || "Internal server error",
          event.requestId
        )
      )
    );
  }
}

/**
 * @function wsValidateCustom
 * @description 执行自定义WebSocket验证规则
 * @param {WebSocket} socket - WebSocket连接
 * @param {WsEvent} event - WebSocket事件
 * @param {boolean} condition - 验证条件
 * @param {string} errorCode - 错误码
 * @param {string} errorMessage - 错误消息
 * @returns {boolean} 如果验证通过返回true，否则返回false并发送错误事件
 */
export function wsValidateCustom(
  socket: WebSocket,
  event: WsEvent,
  condition: boolean,
  errorCode: string,
  errorMessage: string
): boolean {
  if (!condition) {
    socket.send(
      JSON.stringify(
        createErrorEvent(errorCode, errorMessage, event.requestId)
      )
    );
    return false;
  }
  return true;
}

/**
 * @function wsSendError
 * @description 发送WebSocket错误事件
 * @param {WebSocket} socket - WebSocket连接
 * @param {WsEvent} event - WebSocket事件
 * @param {string} errorCode - 错误码
 * @param {string} errorMessage - 错误消息
 */
export function wsSendError(
  socket: WebSocket,
  event: WsEvent,
  errorCode: string,
  errorMessage: string
): void {
  socket.send(
    JSON.stringify(
      createErrorEvent(errorCode, errorMessage, event.requestId)
    )
  );
}
