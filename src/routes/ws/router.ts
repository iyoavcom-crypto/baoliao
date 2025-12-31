/**
 * @packageDocumentation
 * @module routes/ws/router
 * @since 1.0.0
 * @author Z-kali
 * @description WebSocket 事件路由器
 */

import type { WebSocket } from "ws";
import type { WsEvent, EventHandlerMap } from "@/types/ws/protocol";
import { parseMessage, createErrorEvent } from "./protocol";
import { WS_ERROR_CODES } from "@/constants/ws/errors";
import { getLogger } from "@/tools/logging";
import * as WS_EVENTS from "@/constants/ws/events";

// 导入控制器
import { handleHello } from "@/controllers/ws/auth.controller";
import { handlePing } from "@/controllers/ws/system.controller";
import { handleSend, handleRecall, handleRead, handleEdit, handleHistoryPull, handleReactSet } from "@/controllers/ws/message.controller";
import { handleTyping, handleCreate, handleList } from "@/controllers/ws/conversation.controller";
import { handleApply, handleAccept, handleReject, handleDelete, handleBlock, handleList as handleFriendList, handleSearch, handleUnblock } from "@/controllers/ws/friend.controller";
import { handleCreate as handleGroupCreate, handleInvite, handleJoin, handleLeave, handleKick } from "@/controllers/ws/group.controller";

const logger = getLogger("ws:router");

/**
 * @class EventRouter
 * @description WebSocket 事件路由器，负责注册和分发事件
 */
export class EventRouter {
  private handlers: EventHandlerMap;

  constructor() {
    this.handlers = {};
    this.registerHandlers();
  }

  /**
   * @method registerHandlers
   * @description 注册所有事件处理器
   */
  private registerHandlers(): void {
    // 认证模块
    this.register(WS_EVENTS.AUTH_HELLO_REQ, handleHello);

    // 系统模块
    this.register(WS_EVENTS.SYSTEM_PING_REQ, handlePing);

    // 消息模块
    this.register(WS_EVENTS.MESSAGE_SEND_REQ, handleSend);
    this.register(WS_EVENTS.MESSAGE_RECALL_REQ, handleRecall);
    this.register(WS_EVENTS.MESSAGE_READ_REQ, handleRead);
    this.register(WS_EVENTS.MESSAGE_EDIT_REQ, handleEdit);
    this.register(WS_EVENTS.MESSAGE_HISTORY_PULL_REQ, handleHistoryPull);
    this.register(WS_EVENTS.MESSAGE_REACT_SET_REQ, handleReactSet);

    // 会话模块
    this.register(WS_EVENTS.CONVERSATION_TYPING_REQ, handleTyping);
    this.register(WS_EVENTS.CONVERSATION_CREATE_REQ, handleCreate);
    this.register(WS_EVENTS.CONVERSATION_LIST_REQ, handleList);

    // 好友模块
    this.register(WS_EVENTS.FRIEND_APPLY_REQ, handleApply);
    this.register(WS_EVENTS.FRIEND_ACCEPT_REQ, handleAccept);
    this.register(WS_EVENTS.FRIEND_REJECT_REQ, handleReject);
    this.register(WS_EVENTS.FRIEND_DELETE_REQ, handleDelete);
    this.register(WS_EVENTS.FRIEND_BLOCK_REQ, handleBlock);
    this.register(WS_EVENTS.FRIEND_LIST_REQ, handleFriendList);
    this.register(WS_EVENTS.FRIEND_SEARCH_REQ, handleSearch);
    this.register(WS_EVENTS.FRIEND_UNBLOCK_REQ, handleUnblock);

    // 群组模块
    this.register(WS_EVENTS.GROUP_CREATE_REQ, handleGroupCreate);
    this.register(WS_EVENTS.GROUP_INVITE_REQ, handleInvite);
    this.register(WS_EVENTS.GROUP_JOIN_REQ, handleJoin);
    this.register(WS_EVENTS.GROUP_LEAVE_REQ, handleLeave);
    this.register(WS_EVENTS.GROUP_KICK_REQ, handleKick);

    // TODO: 注册更多事件处理器
    // - 会话事件
    // - 好友事件
    // - 群组事件
    // - 回执事件

    logger.info("[WS] Event handlers registered", {
      count: Object.keys(this.handlers).length,
    });
  }

  /**
   * @method register
   * @description 注册单个事件处理器
   * @param eventName 事件名称
   * @param handler 处理器函数
   */
  register(eventName: string, handler: (socket: WebSocket, event: WsEvent) => Promise<void> | void): void {
    this.handlers[eventName] = handler;
  }

  /**
   * @method route
   * @description 路由消息到对应的处理器
   * @param socket WebSocket 实例
   * @param message 原始消息
   */
  async route(socket: WebSocket, message: string | Buffer): Promise<void> {
    // 解析消息
    const result = parseMessage(message);

    if (!result.valid || !result.event) {
      const errorEvent = createErrorEvent(
        result.error?.code || WS_ERROR_CODES.INVALID_MESSAGE,
        result.error?.message || "Invalid message"
      );
      socket.send(JSON.stringify(errorEvent));
      return;
    }

    const event = result.event;
    const handler = this.handlers[event.event];

    // 检查处理器是否存在
    if (!handler) {
      logger.warn("[WS] Unknown event", { event: event.event });
      const errorEvent = createErrorEvent(
        WS_ERROR_CODES.UNKNOWN_EVENT,
        `Unknown event: ${event.event}`,
        event.requestId
      );
      socket.send(JSON.stringify(errorEvent));
      return;
    }

    // 执行处理器
    try {
      await handler(socket, event);
    } catch (error: any) {
      logger.error("[WS] Handler error", {
        event: event.event,
        error: error.message,
      });
      const errorEvent = createErrorEvent(
        WS_ERROR_CODES.INTERNAL_ERROR,
        error.message || "Internal server error",
        event.requestId
      );
      socket.send(JSON.stringify(errorEvent));
    }
  }

  /**
   * @method getHandlerCount
   * @description 获取已注册的处理器数量
   * @returns 处理器数量
   */
  getHandlerCount(): number {
    return Object.keys(this.handlers).length;
  }
}
