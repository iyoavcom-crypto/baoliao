/**
 * @packageDocumentation
 * @module routes/ws/server
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 服务器
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import { EventRouter } from "./router";
import { connectionManager } from "./connection-manager";
import { WS_CONFIG } from "@/constants/ws/config";
import { getLogger } from "@/tools/logging";

const logger = getLogger("ws:server");

/**
 * @class WsServer
 * @description WebSocket 服务器类
 */
export class WsServer {
  private wss: WebSocketServer;
  private router: EventRouter;
  private heartbeatInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(httpServer: HttpServer) {
    // 创建 WebSocket 服务器，复用 HTTP 端口
    this.wss = new WebSocketServer({
      server: httpServer,
      path: WS_CONFIG.PATH,
    });

    this.router = new EventRouter();

    logger.info("[WS] Server initialized", {
      path: WS_CONFIG.PATH,
      handlers: this.router.getHandlerCount(),
    });

    this.setupEventHandlers();
  }

  /**
   * @method setupEventHandlers
   * @description 设置 WebSocket 服务器事件处理器
   */
  private setupEventHandlers(): void {
    this.wss.on("connection", (socket: WebSocket, req) => {
      this.handleConnection(socket, req);
    });

    this.wss.on("error", (error) => {
      logger.error("[WS] Server error", { error: error.message });
    });
  }

  /**
   * @method handleConnection
   * @description 处理新的 WebSocket 连接
   * @param socket WebSocket 实例
   * @param req HTTP 请求对象
   */
  private handleConnection(socket: WebSocket, req: any): void {
    const ip = req.socket.remoteAddress;
    logger.info("[WS] New connection", { ip });

    // 设置认证超时
    const authTimeout = setTimeout(() => {
      if (!connectionManager.getSocketMeta(socket)?.authenticated) {
        logger.warn("[WS] Authentication timeout", { ip });
        socket.close();
      }
    }, WS_CONFIG.AUTH_TIMEOUT);

    // 消息事件
    socket.on("message", async (data) => {
      try {
        // 转换 RawData 为 Buffer 或 string
        const message = Buffer.isBuffer(data) ? data : data.toString();
        await this.router.route(socket, message);
      } catch (error: any) {
        logger.error("[WS] Message handling error", {
          error: error.message,
        });
      }
    });

    // Pong 事件（心跳响应）
    socket.on("pong", () => {
      connectionManager.updateLastPing(socket);
    });

    // 关闭事件
    socket.on("close", () => {
      clearTimeout(authTimeout);
      connectionManager.removeConnection(socket);
      logger.info("[WS] Connection closed", { ip });
    });

    // 错误事件
    socket.on("error", (error) => {
      logger.error("[WS] Socket error", {
        ip,
        error: error.message,
      });
    });
  }

  /**
   * @method startHeartbeat
   * @description 启动心跳检测
   */
  startHeartbeat(): void {
    if (this.heartbeatInterval) {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      connectionManager.pingAll();
      logger.debug("[WS] Heartbeat sent", {
        connections: connectionManager.getTotalConnections(),
      });
    }, WS_CONFIG.HEARTBEAT_INTERVAL);

    logger.info("[WS] Heartbeat started", {
      interval: WS_CONFIG.HEARTBEAT_INTERVAL,
    });
  }

  /**
   * @method startCleanup
   * @description 启动不活跃连接清理
   */
  startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      connectionManager.closeInactiveConnections(WS_CONFIG.CONNECTION_TIMEOUT);
      logger.debug("[WS] Cleanup completed", {
        connections: connectionManager.getTotalConnections(),
        users: connectionManager.getOnlineUserCount(),
      });
    }, WS_CONFIG.HEARTBEAT_INTERVAL);

    logger.info("[WS] Cleanup started", {
      timeout: WS_CONFIG.CONNECTION_TIMEOUT,
    });
  }

  /**
   * @method getStats
   * @description 获取服务器统计信息
   * @returns 统计信息
   */
  getStats(): {
    totalConnections: number;
    onlineUsers: number;
    handlers: number;
  } {
    return {
      totalConnections: connectionManager.getTotalConnections(),
      onlineUsers: connectionManager.getOnlineUserCount(),
      handlers: this.router.getHandlerCount(),
    };
  }

  /**
   * @method close
   * @description 关闭 WebSocket 服务器
   */
  close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.wss.close();
    logger.info("[WS] Server closed");
  }
}
