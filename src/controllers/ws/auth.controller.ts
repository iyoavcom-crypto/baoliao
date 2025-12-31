/**
 * @packageDocumentation
 * @module controllers/ws/auth.controller
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 认证控制器
 */

import type { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import type { AuthHelloReqData, AuthHelloAckData } from "@/types/ws/events";
import { connectionManager } from "@/routes/ws/connection-manager";
import { createAckEvent, createErrorEvent } from "@/routes/ws/protocol";
import { WS_ERROR_CODES } from "@/constants/ws/errors";
import { AUTH_HELLO_ACK } from "@/constants/ws/events";
import { getLogger } from "@/tools/logging";
import { verifyAccessToken } from "@/services/auth/token";

const logger = getLogger("ws:auth");

/**
 * @function handleHello
 * @description 处理握手认证请求
 */
export async function handleHello(socket: WebSocket, event: WsEvent): Promise<void> {
  const data = event.data as AuthHelloReqData;

  if (!data || !data.token || !data.deviceId) {
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.INVALID_REQUEST,
          "token and deviceId are required",
          event.requestId
        )
      )
    );
    socket.close();
    return;
  }

  try {
    // 验证 JWT Token
    const payload = await verifyAccessToken(data.token);
    const userId = payload.sub;

    if (!userId) {
      throw new Error("Invalid token: missing user ID");
    }

    // 注册连接
    const connId = await connectionManager.addConnection(userId, data.deviceId, socket);

    // 返回成功响应
    const ackData: AuthHelloAckData = {
      userId,
      connId,
      serverTime: Date.now(),
    };

    socket.send(
      JSON.stringify(
        createAckEvent(AUTH_HELLO_ACK, WS_ERROR_CODES.SUCCESS, ackData, event.requestId)
      )
    );

    logger.info("[WS] Authentication successful", { userId, deviceId: data.deviceId });

    // TODO: 推送离线消息
  } catch (error: any) {
    logger.error("[WS] Authentication failed", { error: error.message });
    socket.send(
      JSON.stringify(
        createErrorEvent(
          WS_ERROR_CODES.AUTH_FAILED,
          error.message || "Authentication failed",
          event.requestId
        )
      )
    );
    socket.close();
  }
}
