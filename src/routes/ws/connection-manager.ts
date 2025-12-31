/**
 * @packageDocumentation
 * @module routes/ws/connection-manager
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 连接管理器
 */

import { WebSocket } from "ws";
import { WsConnection } from "@/models/ws/connection";
import type { SocketMeta, AuthenticatedWebSocket } from "@/types/ws/connection";
import type { WsEvent } from "@/types/ws/protocol";
import { getLogger } from "@/tools/logging";
import { uuid4 } from "@/utils/common/generate/uuid";

const logger = getLogger("ws");

/**
 * @class ConnectionManager
 * @description 管理所有 WebSocket 连接，支持单用户多设备
 */
export class ConnectionManager {
  /** userId → Set<WebSocket> 映射 */
  private connections: Map<string, Set<AuthenticatedWebSocket>>;

  /** WebSocket → SocketMeta 映射 */
  private socketMeta: Map<AuthenticatedWebSocket, SocketMeta>;

  /** 连接总数统计 */
  private totalConnections: number;

  constructor() {
    this.connections = new Map();
    this.socketMeta = new Map();
    this.totalConnections = 0;
  }

  /**
   * @method addConnection
   * @description 添加新连接
   * @param userId 用户ID
   * @param deviceId 设备ID
   * @param socket WebSocket 实例
   * @returns 连接ID
   */
  async addConnection(
    userId: string,
    deviceId: string,
    socket: AuthenticatedWebSocket
  ): Promise<string> {
    try {
      // 添加到内存映射
      if (!this.connections.has(userId)) {
        this.connections.set(userId, new Set());
      }
      this.connections.get(userId)!.add(socket);

      // 记录到数据库
      const conn = await WsConnection.create({
        userId,
        deviceId,
        socketId: uuid4(),
        nodeId: process.env.NODE_ID || "node-1",
      });

      // 创建元数据
      const meta: SocketMeta = {
        userId,
        deviceId,
        connId: conn.id,
        lastPing: Date.now(),
        authenticated: true,
      };

      this.socketMeta.set(socket, meta);
      socket.meta = meta;

      this.totalConnections++;

      logger.info("[WS] Connection added", {
        userId,
        deviceId,
        connId: conn.id,
        total: this.totalConnections,
      });

      return conn.id;
    } catch (error: any) {
      logger.error("[WS] Failed to add connection", {
        userId,
        deviceId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * @method removeConnection
   * @description 移除连接
   * @param socket WebSocket 实例
   */
  async removeConnection(socket: AuthenticatedWebSocket): Promise<void> {
    const meta = this.socketMeta.get(socket);
    if (!meta) {
      return;
    }

    try {
      // 从内存移除
      const userSockets = this.connections.get(meta.userId);
      if (userSockets) {
        userSockets.delete(socket);
        if (userSockets.size === 0) {
          this.connections.delete(meta.userId);
          
          // 用户已完全离线，清除输入状态
          this.clearUserTypingState(meta.userId);
        }
      }

      this.socketMeta.delete(socket);
      this.totalConnections--;

      // 从数据库删除
      await WsConnection.destroy({ where: { id: meta.connId } });

      logger.info("[WS] Connection removed", {
        userId: meta.userId,
        deviceId: meta.deviceId,
        connId: meta.connId,
        total: this.totalConnections,
      });
    } catch (error: any) {
      logger.error("[WS] Failed to remove connection", {
        connId: meta.connId,
        error: error.message,
      });
    }
  }

  /**
   * @method clearUserTypingState
   * @description 清除用户输入状态（内部调用）
   * @param userId 用户ID
   */
  private clearUserTypingState(userId: string): void {
    // 动态导入，避免循环依赖
    import("@/controllers/ws/conversation.controller").then((module) => {
      module.clearUserTypingState(userId);
    }).catch((error) => {
      logger.error("[WS] Failed to clear typing state", { error: error.message });
    });
  }

  /**
   * @method getUserConnections
   * @description 获取用户的所有连接
   * @param userId 用户ID
   * @returns WebSocket 集合
   */
  getUserConnections(userId: string): Set<AuthenticatedWebSocket> {
    return this.connections.get(userId) || new Set();
  }

  /**
   * @method getUserIdBySocket
   * @description 根据 WebSocket 获取用户ID
   * @param socket WebSocket 实例
   * @returns 用户ID 或 null
   */
  getUserIdBySocket(socket: AuthenticatedWebSocket): string | null {
    const meta = this.socketMeta.get(socket);
    return meta ? meta.userId : null;
  }

  /**
   * @method getSocketMeta
   * @description 获取 Socket 元数据
   * @param socket WebSocket 实例
   * @returns 元数据或 undefined
   */
  getSocketMeta(socket: AuthenticatedWebSocket): SocketMeta | undefined {
    return this.socketMeta.get(socket);
  }

  /**
   * @method pushToUser
   * @description 推送消息给用户的所有在线设备
   * @param userId 用户ID
   * @param event 事件对象
   */
  pushToUser(userId: string, event: WsEvent): void {
    const sockets = this.getUserConnections(userId);
    if (sockets.size === 0) {
      logger.debug("[WS] User not online", { userId });
      return;
    }

    const message = JSON.stringify(event);
    let successCount = 0;

    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(message);
          successCount++;
        } catch (error: any) {
          logger.error("[WS] Failed to send message", {
            userId,
            error: error.message,
          });
        }
      }
    }

    logger.debug("[WS] Message pushed", {
      userId,
      event: event.event,
      devices: sockets.size,
      success: successCount,
    });
  }

  /**
   * @method pushToUsers
   * @description 批量推送消息给多个用户
   * @param userIds 用户ID数组
   * @param event 事件对象
   */
  pushToUsers(userIds: string[], event: WsEvent): void {
    for (const userId of userIds) {
      this.pushToUser(userId, event);
    }
  }

  /**
   * @method isUserOnline
   * @description 检查用户是否在线
   * @param userId 用户ID
   * @returns 是否在线
   */
  isUserOnline(userId: string): boolean {
    const sockets = this.getUserConnections(userId);
    return sockets.size > 0;
  }

  /**
   * @method getTotalConnections
   * @description 获取连接总数
   * @returns 连接总数
   */
  getTotalConnections(): number {
    return this.totalConnections;
  }

  /**
   * @method getOnlineUserCount
   * @description 获取在线用户数
   * @returns 在线用户数
   */
  getOnlineUserCount(): number {
    return this.connections.size;
  }

  /**
   * @method updateLastPing
   * @description 更新最后心跳时间
   * @param socket WebSocket 实例
   */
  updateLastPing(socket: AuthenticatedWebSocket): void {
    const meta = this.socketMeta.get(socket);
    if (meta) {
      meta.lastPing = Date.now();
    }
  }

  /**
   * @method forEachSocket
   * @description 遍历所有连接
   * @param callback 回调函数
   */
  forEachSocket(
    callback: (socket: AuthenticatedWebSocket, meta: SocketMeta) => void
  ): void {
    this.socketMeta.forEach((meta, socket) => {
      callback(socket, meta);
    });
  }

  /**
   * @method pingAll
   * @description 向所有连接发送心跳检测
   */
  pingAll(): void {
    this.forEachSocket((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.ping();
      }
    });
  }

  /**
   * @method closeInactiveConnections
   * @description 关闭不活跃的连接
   * @param timeout 超时时间（毫秒）
   */
  closeInactiveConnections(timeout: number): void {
    const now = Date.now();
    const closedSockets: AuthenticatedWebSocket[] = [];

    this.forEachSocket((socket, meta) => {
      if (now - meta.lastPing > timeout) {
        logger.warn("[WS] Closing inactive connection", {
          userId: meta.userId,
          deviceId: meta.deviceId,
          inactive: now - meta.lastPing,
        });
        socket.close();
        closedSockets.push(socket);
      }
    });

    // 清理关闭的连接
    for (const socket of closedSockets) {
      this.removeConnection(socket);
    }
  }
}

/**
 * @constant connectionManager
 * @description 全局连接管理器实例
 */
export const connectionManager = new ConnectionManager();
