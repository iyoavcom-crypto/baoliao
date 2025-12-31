/**
 * @packageDocumentation
 * @module controllers/ws/system.controller
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 系统控制器
 */

import type { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import type { SystemPongAckData } from "@/types/ws/events";
import { connectionManager } from "@/routes/ws/connection-manager";
import { createAckEvent } from "@/routes/ws/protocol";
import { WS_ERROR_CODES } from "@/constants/ws/errors";
import { SYSTEM_PONG_ACK } from "@/constants/ws/events";

/**
 * @function handlePing
 * @description 处理心跳请求
 */
export async function handlePing(socket: WebSocket, event: WsEvent): Promise<void> {
  // 更新最后心跳时间
  connectionManager.updateLastPing(socket);

  // 返回 PONG 响应
  const ackData: SystemPongAckData = {
    serverTime: Date.now(),
  };

  socket.send(
    JSON.stringify(
      createAckEvent(SYSTEM_PONG_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)
    )
  );
}
