# WebSocket 实时通信系统架构设计

**文档版本**: v1.0.0  
**创建日期**: 2025-12-30  
**作者**: Z-kali  
**项目**: WS-Kit (IM System)

---

## 📖 目录

1. [概述](#概述)
2. [系统上下文](#系统上下文)
3. [技术架构](#技术架构)
4. [目录结构规划](#目录结构规划)
5. [核心模块设计](#核心模块设计)
6. [事件协议设计](#事件协议设计)
7. [与现有API集成](#与现有api集成)
8. [部署架构](#部署架构)
9. [开发指南](#开发指南)
10. [注意事项](#注意事项)

---

## 概述

### 1.1 背景与目标

本项目是一个即时通讯（IM）系统，当前已完成：
- ✅ **HTTP REST API** - 177个API，140条路由已注册
- ✅ **数据库模型** - 45个完整的Sequelize模型
- ✅ **核心业务** - 认证、好友、会话、消息的基础功能

**现在需要实现**：WebSocket实时通信层，支持：
- 🎯 实时消息推送（消息到达、已读回执）
- 🎯 在线状态同步（上线/离线通知）
- 🎯 正在输入指示器
- 🎯 离线消息重连同步
- 🎯 双向事件通信（42个事件类型）

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **前后端分离** | 前端只负责UI和WebSocket客户端，后端处理所有业务逻辑 |
| **事件驱动** | 采用 Req/Ack/Push 三种事件模式，清晰定义通信协议 |
| **可扩展性** | 支持水平扩展，通过 Redis Pub/Sub 实现跨节点通信 |
| **复用现有资源** | 最大化复用HTTP API的业务逻辑、Model、中间件 |
| **类型安全** | TypeScript 强类型，所有事件、DTO 完全类型化 |

### 1.3 技术栈

| 层次 | 技术 | 说明 |
|------|------|------|
| **WebSocket库** | `ws` (v8.18.3) | 高性能、轻量级WebSocket服务器 |
| **协议序列化** | JSON | 简单易读，支持嵌套对象 |
| **认证** | JWT | 复用现有HTTP认证体系 |
| **数据库** | SQLite / MySQL | 复用现有Sequelize模型 |
| **缓存/消息队列** | Redis（可选） | 用于集群环境下的跨节点通信 |
| **运行时** | Node.js 22+ / TypeScript 5.6+ | ESM模块，强类型 |

---

## 系统上下文

### 2.1 架构全局视图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
├─────────────────────────────────────────────────────────────┤
│  Web浏览器 / React / Vue                                     │
│  - HTTP请求（登录、注册、查询）                               │
│  - WebSocket客户端（实时消息、状态）                          │
└────────┬──────────────────────────────────┬─────────────────┘
         │ HTTP REST                        │ WebSocket
         ├──────────────────────────────────┤
┌────────▼──────────────────────────────────▼─────────────────┐
│                      服务端层（Node.js）                      │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────┐              ┌─────────────────────┐    │
│  │  HTTP Server   │              │  WebSocket Server   │    │
│  │  (Express)     │              │  (ws)               │    │
│  ├────────────────┤              ├─────────────────────┤    │
│  │ REST API (177) │              │ Event Router        │    │
│  │ - 认证         │              │ - 42个事件处理器     │    │
│  │ - 好友         │◄─────共享────►│ - 连接管理          │    │
│  │ - 会话         │    Model &   │ - 离线消息          │    │
│  │ - 消息         │   Business   │ - 在线状态          │    │
│  │ - 群组         │    Logic     │ - 消息推送          │    │
│  └────────┬───────┘              └──────────┬──────────┘    │
│           │                                 │               │
│           └────────────┬────────────────────┘               │
│                        ▼                                    │
│          ┌──────────────────────────────┐                   │
│          │   业务逻辑层 (Services)      │                   │
│          │   - 认证服务                 │                   │
│          │   - 消息服务                 │                   │
│          │   - 好友服务                 │                   │
│          │   - 会话服务                 │                   │
│          └──────────────┬───────────────┘                   │
│                         ▼                                   │
│          ┌──────────────────────────────┐                   │
│          │   数据访问层 (Models)        │                   │
│          │   - Sequelize ORM            │                   │
│          │   - 45个数据模型              │                   │
│          └──────────────┬───────────────┘                   │
└─────────────────────────┼───────────────────────────────────┘
                          ▼
                ┌──────────────────┐      ┌──────────────┐
                │   SQLite/MySQL   │      │    Redis     │
                │   持久化存储      │      │  (可选集群)   │
                └──────────────────┘      └──────────────┘
```

### 2.2 职责划分

#### 前端职责
- 🖥️ **WebSocket客户端连接**
  - 建立连接时携带JWT Token
  - 自动重连与心跳维持
  - 事件序列化与反序列化
  
- 🖥️ **UI交互**
  - 接收实时消息并展示
  - 发送用户操作事件
  - 状态同步与界面更新

- 🖥️ **HTTP请求**
  - 登录/注册/查询等非实时操作
  - 拉取历史消息
  - 文件上传下载

#### 后端职责
- 🔧 **WebSocket服务器**
  - 连接管理（上线/断线）
  - 事件路由与分发
  - 认证与权限验证
  
- 🔧 **业务逻辑处理**
  - 消息存储与转发
  - 在线状态维护
  - 离线消息队列
  - 群组消息广播
  
- 🔧 **数据持久化**
  - 消息、会话、好友关系
  - 连接审计日志
  - 离线消息记录

---

## 技术架构

### 3.1 整体架构图

```
src/
├── app.ts                          # Express应用主文件
├── main.ts                         # 应用入口（HTTP + WS启动）
│
├── routes/                         # HTTP路由层
│   ├── api/                        # REST API路由
│   │   └── index.ts                # API路由注册（177个）
│   └── ws/                         # ❗ WebSocket路由（新建）
│       ├── index.ts                # WS路由入口
│       ├── server.ts               # WS服务器实例
│       ├── router.ts               # 事件路由器
│       └── protocol.ts             # 协议定义与验证
│
├── controllers/                    # 控制器层
│   ├── friend.ts                   # 好友控制器（已有）
│   └── ws/                         # ❗ WebSocket控制器（新建）
│       ├── auth.controller.ts      # 认证事件处理器
│       ├── message.controller.ts   # 消息事件处理器
│       ├── friend.controller.ts    # 好友事件处理器
│       ├── group.controller.ts     # 群组事件处理器
│       └── system.controller.ts    # 系统事件处理器
│
├── services/                       # 业务逻辑层
│   ├── auth/                       # 认证服务（已有）
│   ├── dto/                        # DTO定义（已有）
│   │   └── ws/                     # WebSocket DTO（已有）
│   └── ws/                         # ❗ WebSocket服务（新建）
│       ├── connection.service.ts   # 连接管理服务
│       ├── message.service.ts      # 消息推送服务
│       ├── presence.service.ts     # 在线状态服务
│       └── offline.service.ts      # 离线消息服务
│
├── middleware/                     # 中间件层
│   ├── auth/                       # 认证中间件（已有）
│   │   ├── require.ts              # JWT验证
│   │   └── inject-user-id.ts       # 用户ID注入
│   └── ws/                         # ❗ WebSocket中间件（新建）
│       ├── auth.ts                 # WS认证中间件
│       └── rate-limit.ts           # WS频率限制
│
├── models/                         # 数据模型层（已有）
│   ├── ws/                         
│   │   └── connection.ts           # 连接模型（已有）
│   ├── message/                    # 消息模型（已有）
│   ├── conversation/               # 会话模型（已有）
│   └── admin/user/                 # 用户模型（已有）
│
├── types/                          # 类型定义
│   ├── api.ts                      # API类型（已有）
│   └── ws/                         # ❗ WebSocket类型（新建）
│       ├── events.ts               # 事件类型定义
│       ├── protocol.ts             # 协议类型定义
│       └── connection.ts           # 连接类型定义
│
└── utils/                          # 工具函数（已有）
    ├── common/                     
    └── query/                      
```

### 3.2 核心设计模式

#### 3.2.1 事件驱动模式
```typescript
// 事件类型：Req/Ack/Push
type EventType = 
  | "req"   // 客户端请求（C→S）
  | "ack"   // 服务器响应（S→C）
  | "push"; // 服务器主动推送（S→C）

// 事件命名规范：<模块>.<功能>.<类型>
// 例如：message.send.req, message.send.ack, message.push
```

#### 3.2.2 连接管理模式
```typescript
// 连接映射：userId → Set<WebSocket>
// 支持单用户多设备在线
class ConnectionManager {
  private connections: Map<string, Set<WebSocket>>;
  private socketToUser: Map<WebSocket, string>;
  
  // 添加连接
  addConnection(userId: string, socket: WebSocket): void;
  
  // 移除连接
  removeConnection(socket: WebSocket): void;
  
  // 获取用户所有连接
  getUserConnections(userId: string): Set<WebSocket>;
  
  // 推送消息给用户
  pushToUser(userId: string, event: any): void;
}
```

#### 3.2.3 事件路由模式
```typescript
// 事件路由器：注册处理器，分发事件
class EventRouter {
  private handlers: Map<string, EventHandler>;
  
  // 注册事件处理器
  register(eventName: string, handler: EventHandler): void;
  
  // 路由事件到对应处理器
  route(socket: WebSocket, event: WsEvent): Promise<void>;
}
```

---

## 目录结构规划

### 4.1 需要新建的目录和文件

```
src/
├── routes/ws/                      # ❗ WebSocket路由模块（新建）
│   ├── index.ts                    # WS路由导出入口
│   ├── server.ts                   # WebSocket服务器类
│   ├── router.ts                   # 事件路由器
│   ├── protocol.ts                 # 协议定义与验证
│   └── connection-manager.ts       # 连接管理器
│
├── controllers/ws/                 # ❗ WebSocket控制器（新建）
│   ├── auth.controller.ts          # 处理 auth.hello.req
│   ├── system.controller.ts        # 处理 system.ping.req
│   ├── message.controller.ts       # 处理 message.*.req
│   ├── conversation.controller.ts  # 处理 conversation.*.req
│   ├── friend.controller.ts        # 处理 friend.*.req
│   ├── group.controller.ts         # 处理 group.*.req
│   └── receipt.controller.ts       # 处理 receipt.*.req
│
├── services/ws/                    # ❗ WebSocket服务（新建）
│   ├── connection.service.ts       # 连接生命周期管理
│   ├── message-push.service.ts     # 消息推送服务
│   ├── presence.service.ts         # 在线状态管理
│   ├── offline-queue.service.ts    # 离线消息队列
│   └── broadcast.service.ts        # 群组消息广播
│
├── middleware/ws/                  # ❗ WebSocket中间件（新建）
│   ├── auth.ts                     # JWT认证中间件
│   ├── rate-limit.ts               # 频率限制
│   └── validator.ts                # 事件验证
│
├── types/ws/                       # ❗ WebSocket类型（新建）
│   ├── events.ts                   # 42个事件类型定义
│   ├── protocol.ts                 # 协议基础类型
│   └── connection.ts               # 连接相关类型
│
└── constants/ws/                   # ❗ WebSocket常量（新建）
    ├── events.ts                   # 事件名称常量
    └── errors.ts                   # 错误码定义
```

### 4.2 文件依赖关系

```
main.ts
  └── routes/ws/server.ts
      ├── routes/ws/router.ts
      │   ├── controllers/ws/*.controller.ts
      │   │   └── services/ws/*.service.ts
      │   │       └── models/* (复用现有)
      │   └── middleware/ws/auth.ts
      │       └── services/auth/* (复用现有)
      └── routes/ws/connection-manager.ts
          └── models/ws/connection.ts (已有)
```

---

## 核心模块设计

### 5.1 WebSocket服务器 (`routes/ws/server.ts`)

#### 职责
- 启动WebSocket服务器（与HTTP共享端口或独立端口）
- 处理连接建立与断开
- 绑定事件路由器
- 心跳检测与超时断开

#### 代码结构示例
```typescript
import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import { EventRouter } from "./router";
import { ConnectionManager } from "./connection-manager";

export class WsServer {
  private wss: WebSocketServer;
  private router: EventRouter;
  private connManager: ConnectionManager;
  
  constructor(httpServer: HttpServer) {
    // 创建WebSocket服务器，复用HTTP端口
    this.wss = new WebSocketServer({ 
      server: httpServer,
      path: "/ws" 
    });
    
    this.router = new EventRouter();
    this.connManager = new ConnectionManager();
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.wss.on("connection", (socket, req) => {
      this.handleConnection(socket, req);
    });
  }
  
  private handleConnection(socket: WebSocket, req: any) {
    console.log("[WS] New connection");
    
    // 等待客户端发送 auth.hello.req 进行认证
    socket.on("message", async (data) => {
      try {
        const event = JSON.parse(data.toString());
        await this.router.route(socket, event);
      } catch (err) {
        console.error("[WS] Message error:", err);
        socket.send(JSON.stringify({
          event: "error",
          code: "INVALID_MESSAGE",
          message: "Invalid message format"
        }));
      }
    });
    
    socket.on("close", () => {
      this.connManager.removeConnection(socket);
      console.log("[WS] Connection closed");
    });
    
    socket.on("error", (err) => {
      console.error("[WS] Socket error:", err);
    });
  }
  
  // 启动心跳检测
  startHeartbeat() {
    setInterval(() => {
      this.connManager.pingAll();
    }, 30000); // 每30秒ping一次
  }
}
```

### 5.2 事件路由器 (`routes/ws/router.ts`)

#### 职责
- 注册事件处理器
- 验证事件格式
- 路由事件到对应控制器
- 错误处理与响应

#### 代码结构示例
```typescript
import { WebSocket } from "ws";
import type { WsEvent, EventHandler } from "@/types/ws/protocol";

export class EventRouter {
  private handlers: Map<string, EventHandler>;
  
  constructor() {
    this.handlers = new Map();
    this.registerHandlers();
  }
  
  private registerHandlers() {
    // 注册所有事件处理器
    this.register("auth.hello.req", authController.handleHello);
    this.register("system.ping.req", systemController.handlePing);
    this.register("message.send.req", messageController.handleSend);
    this.register("friend.apply.req", friendController.handleApply);
    // ... 更多事件
  }
  
  register(eventName: string, handler: EventHandler) {
    this.handlers.set(eventName, handler);
  }
  
  async route(socket: WebSocket, event: WsEvent) {
    const handler = this.handlers.get(event.event);
    
    if (!handler) {
      socket.send(JSON.stringify({
        event: "error",
        code: "UNKNOWN_EVENT",
        message: `Unknown event: ${event.event}`
      }));
      return;
    }
    
    try {
      await handler(socket, event);
    } catch (err: any) {
      socket.send(JSON.stringify({
        event: "error",
        code: err.code || "INTERNAL_ERROR",
        message: err.message || "Internal server error"
      }));
    }
  }
}
```

### 5.3 连接管理器 (`routes/ws/connection-manager.ts`)

#### 职责
- 维护 userId → WebSocket 映射
- 支持单用户多设备
- 记录连接到数据库（审计）
- 推送消息给指定用户

#### 代码结构示例
```typescript
import { WebSocket } from "ws";
import { WsConnection } from "@/models/ws/connection";

export class ConnectionManager {
  // userId → Set<WebSocket>
  private connections: Map<string, Set<WebSocket>>;
  
  // WebSocket → {userId, deviceId, connId}
  private socketMeta: Map<WebSocket, SocketMeta>;
  
  constructor() {
    this.connections = new Map();
    this.socketMeta = new Map();
  }
  
  async addConnection(
    userId: string, 
    deviceId: string, 
    socket: WebSocket
  ): Promise<string> {
    // 添加到内存映射
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(socket);
    
    // 记录到数据库
    const conn = await WsConnection.create({
      userId,
      deviceId,
      socketId: generateSocketId(),
      nodeId: process.env.NODE_ID || "node-1",
    });
    
    this.socketMeta.set(socket, {
      userId,
      deviceId,
      connId: conn.id
    });
    
    return conn.id;
  }
  
  removeConnection(socket: WebSocket) {
    const meta = this.socketMeta.get(socket);
    if (!meta) return;
    
    // 从内存移除
    const userSockets = this.connections.get(meta.userId);
    if (userSockets) {
      userSockets.delete(socket);
      if (userSockets.size === 0) {
        this.connections.delete(meta.userId);
      }
    }
    
    this.socketMeta.delete(socket);
    
    // 从数据库删除（或标记断开时间）
    WsConnection.destroy({ where: { id: meta.connId } });
  }
  
  getUserConnections(userId: string): Set<WebSocket> {
    return this.connections.get(userId) || new Set();
  }
  
  pushToUser(userId: string, event: any) {
    const sockets = this.getUserConnections(userId);
    const message = JSON.stringify(event);
    
    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    }
  }
  
  isUserOnline(userId: string): boolean {
    const sockets = this.getUserConnections(userId);
    return sockets.size > 0;
  }
}
```

### 5.4 认证控制器 (`controllers/ws/auth.controller.ts`)

#### 职责
- 处理 `auth.hello.req` 事件
- 验证JWT Token
- 注册连接到ConnectionManager
- 返回 `auth.hello.ack`
- 推送离线消息

#### 代码结构示例
```typescript
import { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import { verifyJWT } from "@/services/auth/token";
import { connectionManager } from "@/routes/ws/connection-manager";
import { offlineQueueService } from "@/services/ws/offline-queue.service";

export async function handleHello(socket: WebSocket, event: WsEvent) {
  const { token, deviceId } = event.data;
  
  if (!token || !deviceId) {
    socket.send(JSON.stringify({
      event: "auth.hello.ack",
      code: "INVALID_REQUEST",
      message: "token and deviceId are required"
    }));
    socket.close();
    return;
  }
  
  // 验证JWT
  try {
    const payload = await verifyJWT(token);
    const userId = payload.sub;
    
    // 注册连接
    const connId = await connectionManager.addConnection(
      userId, 
      deviceId, 
      socket
    );
    
    // 返回成功响应
    socket.send(JSON.stringify({
      event: "auth.hello.ack",
      code: "SUCCESS",
      data: {
        userId,
        connId,
        serverTime: Date.now()
      }
    }));
    
    // 推送离线消息
    await offlineQueueService.pushOfflineMessages(userId, socket);
    
  } catch (err: any) {
    socket.send(JSON.stringify({
      event: "auth.hello.ack",
      code: "AUTH_FAILED",
      message: err.message || "Authentication failed"
    }));
    socket.close();
  }
}

export const authController = {
  handleHello
};
```

### 5.5 消息控制器 (`controllers/ws/message.controller.ts`)

#### 职责
- 处理 `message.send.req` 事件
- 验证消息内容
- 存储消息到数据库（复用HTTP的Message模型）
- 推送给会话成员
- 返回 `message.send.ack`

#### 代码结构示例
```typescript
import { WebSocket } from "ws";
import type { WsEvent } from "@/types/ws/protocol";
import { Message } from "@/models/message";
import { ConversationMember } from "@/models/conversation";
import { connectionManager } from "@/routes/ws/connection-manager";
import { generateMsgId, generateSeq } from "@/utils/common/generate";

export async function handleSend(socket: WebSocket, event: WsEvent) {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify({
      event: "message.send.ack",
      code: "UNAUTHORIZED",
      message: "Not authenticated"
    }));
    return;
  }
  
  const { conversationId, content, type } = event.data;
  
  // 验证权限（用户是否是会话成员）
  const member = await ConversationMember.findOne({
    where: { conversationId, userId }
  });
  
  if (!member) {
    socket.send(JSON.stringify({
      event: "message.send.ack",
      code: "FORBIDDEN",
      message: "You are not a member of this conversation"
    }));
    return;
  }
  
  // 生成消息ID和序列号
  const msgId = generateMsgId();
  const seq = await generateSeq(conversationId);
  
  // 存储消息
  const message = await Message.create({
    msgId,
    conversationId,
    senderId: userId,
    content,
    type: type || "text",
    seq,
    status: "sent"
  });
  
  // 返回ACK给发送者
  socket.send(JSON.stringify({
    event: "message.send.ack",
    code: "SUCCESS",
    data: {
      msgId,
      seq,
      timestamp: message.createdAt
    }
  }));
  
  // 推送给会话其他成员
  const members = await ConversationMember.findAll({
    where: { conversationId }
  });
  
  for (const m of members) {
    if (m.userId !== userId) {
      connectionManager.pushToUser(m.userId, {
        event: "message.push",
        data: {
          msgId,
          conversationId,
          senderId: userId,
          content,
          type,
          seq,
          timestamp: message.createdAt
        }
      });
    }
  }
}

export const messageController = {
  handleSend
};
```

---

## 事件协议设计

### 6.1 事件结构

所有WebSocket消息采用JSON格式，统一结构：

```typescript
// 基础事件接口
interface WsEvent {
  event: string;      // 事件名称，格式：<模块>.<功能>.<类型>
  code?: string;      // 响应码（仅ACK事件）
  message?: string;   // 错误信息（可选）
  data?: any;         // 事件数据
  requestId?: string; // 请求ID（用于匹配请求-响应）
}
```

#### 示例：发送消息

**1. 客户端请求 (C→S)**
```json
{
  "event": "message.send.req",
  "requestId": "req-123456",
  "data": {
    "conversationId": "conv-001",
    "content": "Hello!",
    "type": "text"
  }
}
```

**2. 服务器响应 (S→C)**
```json
{
  "event": "message.send.ack",
  "requestId": "req-123456",
  "code": "SUCCESS",
  "data": {
    "msgId": "msg-789",
    "seq": 42,
    "timestamp": 1735564800000
  }
}
```

**3. 服务器推送给接收方 (S→C)**
```json
{
  "event": "message.push",
  "data": {
    "msgId": "msg-789",
    "conversationId": "conv-001",
    "senderId": "user-123",
    "content": "Hello!",
    "type": "text",
    "seq": 42,
    "timestamp": 1735564800000
  }
}
```

### 6.2 完整事件清单（42个）

| 模块 | 事件名称 | 方向 | 说明 |
|------|---------|------|------|
| **认证** | `auth.hello.req` | C→S | 握手认证（携带JWT） |
| | `auth.hello.ack` | S→C | 握手响应 |
| **系统** | `system.ping.req` | C→S | 心跳请求 |
| | `system.pong.ack` | S→C | 心跳响应 |
| **消息** | `message.send.req` | C→S | 发送消息 |
| | `message.send.ack` | S→C | 发送确认 |
| | `message.push` | S→C | 消息推送 |
| | `message.typing.push` | S→C | 正在输入 |
| | `message.history.pull.req` | C→S | 拉取历史 |
| | `message.history.pull.ack` | S→C | 历史响应 |
| | `message.react.set.req` | C→S | 设置表情 |
| | `message.react.set.ack` | S→C | 表情确认 |
| | `message.react.push` | S→C | 表情推送 |
| | `message.edit.req` | C→S | 编辑消息 |
| | `message.edit.ack` | S→C | 编辑确认 |
| | `message.edited.push` | S→C | 编辑推送 |
| | `message.recall.req` | C→S | 撤回消息 |
| | `message.recall.ack` | S→C | 撤回确认 |
| | `message.recalled.push` | S→C | 撤回推送 |
| **会话** | `conversation.create.req` | C→S | 创建会话 |
| | `conversation.create.ack` | S→C | 创建响应 |
| | `conversation.badge.push` | S→C | 未读数推送 |
| **好友** | `friend.apply.req` | C→S | 发送好友申请 |
| | `friend.apply.ack` | S→C | 申请响应 |
| | `friend.apply.push` | S→C | 申请推送（给接收方） |
| | `friend.accept.req` | C→S | 接受好友 |
| | `friend.accept.ack` | S→C | 接受确认 |
| | `friend.reject.req` | C→S | 拒绝好友 |
| | `friend.reject.ack` | S→C | 拒绝确认 |
| | `friend.delete.req` | C→S | 删除好友 |
| | `friend.delete.ack` | S→C | 删除确认 |
| | `friend.block.req` | C→S | 拉黑好友 |
| | `friend.block.ack` | S→C | 拉黑确认 |
| | `friend.unblock.req` | C→S | 解除拉黑 |
| | `friend.unblock.ack` | S→C | 解除确认 |
| | `friend.list.req` | C→S | 好友列表 |
| | `friend.list.ack` | S→C | 列表响应 |
| **群组** | `group.create.req` | C→S | 创建群组 |
| | `group.create.ack` | S→C | 创建确认 |
| | `group.invite.req` | C→S | 邀请入群 |
| | `group.invite.ack` | S→C | 邀请确认 |
| | `group.quit.req` | C→S | 退出群组 |
| | `group.quit.ack` | S→C | 退出确认 |
| | `group.dissolve.req` | C→S | 解散群组 |
| | `group.dissolve.ack` | S→C | 解散确认 |
| **在线状态** | `presence.push` | S→C | 状态推送 |
| **离线消息** | `offline.messages.push` | S→C | 离线消息推送 |
| **回执** | `receipt.read.req` | C→S | 标记已读 |
| | `receipt.read.ack` | S→C | 已读响应 |
| | `receipt.read.push` | S→C | 已读推送（给发送者） |
| | `receipt.delivered.req` | C→S | 送达确认 |
| | `receipt.delivered.ack` | S→C | 送达响应 |
| | `receipt.delivered.push` | S→C | 送达推送 |

### 6.3 错误码定义

```typescript
export const WS_ERROR_CODES = {
  // 认证相关
  UNAUTHORIZED: "UNAUTHORIZED",
  AUTH_FAILED: "AUTH_FAILED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  
  // 请求相关
  INVALID_REQUEST: "INVALID_REQUEST",
  INVALID_MESSAGE: "INVALID_MESSAGE",
  UNKNOWN_EVENT: "UNKNOWN_EVENT",
  
  // 权限相关
  FORBIDDEN: "FORBIDDEN",
  NOT_MEMBER: "NOT_MEMBER",
  
  // 业务相关
  CONVERSATION_NOT_FOUND: "CONVERSATION_NOT_FOUND",
  MESSAGE_NOT_FOUND: "MESSAGE_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  
  // 系统相关
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE"
};
```

---

## 与现有API集成

### 7.1 复用现有资源

#### ✅ 直接复用
- **所有数据模型** (`models/*`) - Message, Conversation, UserFriend等45个模型
- **认证服务** (`services/auth/*`) - JWT验证、Token生成
- **DTO定义** (`services/dto/*`) - 类型定义
- **工具函数** (`utils/*`) - ID生成、时间处理

#### 🔄 部分复用
- **中间件** - HTTP认证中间件需适配WebSocket
- **业务逻辑** - 消息发送、好友管理逻辑可提取为Service供两端调用

### 7.2 HTTP API vs WebSocket 职责划分

| 功能 | HTTP API | WebSocket |
|------|---------|-----------|
| **用户注册/登录** | ✅ 主要 | ❌ 不处理 |
| **好友申请** | ✅ 支持 | ✅ 支持（实时通知） |
| **创建会话** | ✅ 支持 | ✅ 支持 |
| **发送消息** | ✅ 支持（低优先级） | ✅ 主要（实时） |
| **历史消息查询** | ✅ 主要 | ✅ 支持（快速拉取） |
| **消息撤回** | ✅ 支持 | ✅ 支持（实时通知） |
| **在线状态** | ❌ 不支持 | ✅ 主要 |
| **正在输入** | ❌ 不支持 | ✅ 主要 |
| **文件上传** | ✅ 主要 | ❌ 不支持 |

### 7.3 集成示例：消息发送

#### 提取共享业务逻辑
```typescript
// services/message.service.ts
export class MessageService {
  async createMessage(params: {
    conversationId: string;
    senderId: string;
    content: string;
    type: string;
  }): Promise<Message> {
    const msgId = generateMsgId();
    const seq = await generateSeq(params.conversationId);
    
    return await Message.create({
      msgId,
      ...params,
      seq,
      status: "sent"
    });
  }
  
  async getConversationMembers(conversationId: string): Promise<string[]> {
    const members = await ConversationMember.findAll({
      where: { conversationId },
      attributes: ["userId"]
    });
    return members.map(m => m.userId);
  }
}

export const messageService = new MessageService();
```

#### HTTP控制器调用
```typescript
// controllers/message.ts (新建)
export async function sendMessage(req: Request, res: Response) {
  const userId = (req as AuthRequest).user?.sub;
  const { conversationId, content, type } = req.body;
  
  // 调用共享服务
  const message = await messageService.createMessage({
    conversationId,
    senderId: userId,
    content,
    type
  });
  
  res.status(201).json({
    code: "SUCCESS",
    data: message
  });
}
```

#### WebSocket控制器调用
```typescript
// controllers/ws/message.controller.ts
export async function handleSend(socket: WebSocket, event: WsEvent) {
  const userId = connectionManager.getUserIdBySocket(socket);
  const { conversationId, content, type } = event.data;
  
  // 调用相同的共享服务
  const message = await messageService.createMessage({
    conversationId,
    senderId: userId,
    content,
    type
  });
  
  // 返回ACK
  socket.send(JSON.stringify({
    event: "message.send.ack",
    code: "SUCCESS",
    data: { msgId: message.msgId, seq: message.seq }
  }));
  
  // 推送给其他成员
  const members = await messageService.getConversationMembers(conversationId);
  for (const memberId of members) {
    if (memberId !== userId) {
      connectionManager.pushToUser(memberId, {
        event: "message.push",
        data: message
      });
    }
  }
}
```

### 7.4 启动时同时运行HTTP和WebSocket

修改 `src/main.ts`：

```typescript
import express from "express";
import { createServer } from "http";
import { WsServer } from "@/routes/ws/server";
import routes from "@/routes/api";

async function bootstrap() {
  const app = express();
  
  // HTTP路由
  app.use("/api", routes);
  
  // 创建HTTP服务器
  const httpServer = createServer(app);
  
  // 启动WebSocket服务器（共享端口）
  const wsServer = new WsServer(httpServer);
  wsServer.startHeartbeat();
  
  // 监听端口
  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`✅ HTTP Server: http://localhost:${port}`);
    console.log(`✅ WebSocket Server: ws://localhost:${port}/ws`);
  });
}

bootstrap();
```

---

## 部署架构

### 8.1 单机部署

```
┌─────────────────────────────────────┐
│      Node.js 进程 (单实例)           │
├─────────────────────────────────────┤
│  HTTP Server (Express)              │
│  - REST API :3000/api               │
│                                     │
│  WebSocket Server (ws)              │
│  - WS Endpoint :3000/ws             │
│                                     │
│  ConnectionManager (内存)            │
│  - 维护所有连接                      │
└────────────┬────────────────────────┘
             │
             ▼
    ┌────────────────┐
    │  SQLite/MySQL  │
    └────────────────┘
```

**特点**：
- ✅ 简单易维护
- ✅ 适合小规模（< 1万在线用户）
- ❌ 无法水平扩展

### 8.2 集群部署（使用Redis）

```
                  ┌─────────────┐
                  │  Nginx LB   │
                  │  (反向代理)  │
                  └──────┬──────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌────▼────┐     ┌────▼────┐
   │ Node-1  │      │ Node-2  │     │ Node-3  │
   │ HTTP+WS │      │ HTTP+WS │     │ HTTP+WS │
   └────┬────┘      └────┬────┘     └────┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
       ┌────▼────┐              ┌─────▼─────┐
       │  Redis  │              │   MySQL   │
       │ Pub/Sub │              │  (主从)    │
       └─────────┘              └───────────┘
```

**特点**：
- ✅ 支持水平扩展
- ✅ 高可用（节点故障自动切换）
- ⚠️ 需要Redis Pub/Sub实现跨节点消息推送

#### Redis Pub/Sub 使用示例
```typescript
// services/ws/broadcast.service.ts
import Redis from "ioredis";

class BroadcastService {
  private pub: Redis;
  private sub: Redis;
  
  constructor() {
    this.pub = new Redis(process.env.REDIS_URL);
    this.sub = new Redis(process.env.REDIS_URL);
    
    // 订阅消息推送频道
    this.sub.subscribe("ws:push", (err) => {
      if (err) console.error("Redis subscribe error:", err);
    });
    
    this.sub.on("message", (channel, message) => {
      const { userId, event } = JSON.parse(message);
      // 如果该用户连接在本节点，推送消息
      connectionManager.pushToUser(userId, event);
    });
  }
  
  // 发布消息给所有节点
  async publishToUser(userId: string, event: any) {
    await this.pub.publish("ws:push", JSON.stringify({
      userId,
      event
    }));
  }
}

export const broadcastService = new BroadcastService();
```

### 8.3 Nginx配置示例

```nginx
upstream ws_backend {
    # ip_hash确保同一用户连接到同一节点（可选）
    ip_hash;
    
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name im.example.com;
    
    # HTTP API
    location /api {
        proxy_pass http://ws_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://ws_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # 超时设置
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

---

## 开发指南

### 9.1 开发阶段划分

#### Phase 1: 基础框架搭建（1-2天）
- [ ] 创建 `routes/ws/` 目录和基础文件
- [ ] 实现 `WsServer` 类（server.ts）
- [ ] 实现 `EventRouter` 类（router.ts）
- [ ] 实现 `ConnectionManager` 类（connection-manager.ts）
- [ ] 定义基础类型（types/ws/*.ts）
- [ ] 修改 `main.ts` 启动WebSocket服务器

#### Phase 2: 核心事件实现（2-3天）
- [ ] 实现认证握手（auth.hello.req/ack）
- [ ] 实现心跳机制（system.ping.req/pong.ack）
- [ ] 实现消息发送（message.send.req/ack/push）
- [ ] 实现消息撤回（message.recall.req/ack/push）
- [ ] 实现已读回执（receipt.read.req/ack/push）

#### Phase 3: 好友与群组（1-2天）
- [ ] 实现好友申请（friend.apply.req/ack/push）
- [ ] 实现好友接受/拒绝
- [ ] 实现群组创建（group.create.req/ack）
- [ ] 实现群组消息广播

#### Phase 4: 高级功能（2-3天）
- [ ] 实现在线状态推送（presence.push）
- [ ] 实现离线消息队列（offline.messages.push）
- [ ] 实现正在输入指示（message.typing.push）
- [ ] 实现消息表情反应

#### Phase 5: 测试与优化（1-2天）
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 性能测试（压力测试、并发测试）
- [ ] 优化内存占用
- [ ] 添加监控指标

### 9.2 开发优先级

| 优先级 | 功能 | 原因 |
|--------|------|------|
| **P0（必须）** | 认证握手、心跳、消息发送/推送 | 核心功能 |
| **P1（重要）** | 已读回执、离线消息、好友申请通知 | 基础体验 |
| **P2（一般）** | 在线状态、正在输入、表情反应 | 增强体验 |
| **P3（可选）** | 消息编辑、历史拉取（WS版） | HTTP已支持 |

### 9.3 测试策略

#### 单元测试（Vitest）
```typescript
// tests/ws/connection-manager.test.ts
describe("ConnectionManager", () => {
  it("should add connection", async () => {
    const manager = new ConnectionManager();
    const socket = new MockWebSocket();
    
    await manager.addConnection("user-1", "device-1", socket);
    
    expect(manager.isUserOnline("user-1")).toBe(true);
  });
  
  it("should support multiple devices", async () => {
    const manager = new ConnectionManager();
    const socket1 = new MockWebSocket();
    const socket2 = new MockWebSocket();
    
    await manager.addConnection("user-1", "device-1", socket1);
    await manager.addConnection("user-1", "device-2", socket2);
    
    const connections = manager.getUserConnections("user-1");
    expect(connections.size).toBe(2);
  });
});
```

#### 集成测试
```typescript
// tests/ws/e2e.test.ts
describe("WebSocket E2E", () => {
  it("should send message and receive push", async () => {
    const client1 = new WsClient("ws://localhost:3000/ws");
    const client2 = new WsClient("ws://localhost:3000/ws");
    
    // 用户1和用户2登录
    await client1.send({ event: "auth.hello.req", data: { token: token1 }});
    await client2.send({ event: "auth.hello.req", data: { token: token2 }});
    
    // 用户1发送消息
    client1.send({
      event: "message.send.req",
      data: { conversationId: "conv-1", content: "Hello!" }
    });
    
    // 用户2应该收到推送
    const push = await client2.waitForEvent("message.push");
    expect(push.data.content).toBe("Hello!");
  });
});
```

### 9.4 调试技巧

#### 启用详细日志
```typescript
// routes/ws/server.ts
const DEBUG = process.env.DEBUG === "true";

function log(...args: any[]) {
  if (DEBUG) {
    console.log(`[WS ${new Date().toISOString()}]`, ...args);
  }
}
```

#### 使用WebSocket客户端工具
- **浏览器**: Chrome DevTools → Network → WS
- **Postman**: 支持WebSocket测试
- **wscat**: 命令行工具 `npm i -g wscat`

```bash
# 使用wscat测试
wscat -c ws://localhost:3000/ws

# 发送认证
> {"event":"auth.hello.req","data":{"token":"your-jwt-token","deviceId":"device-1"}}

# 发送消息
> {"event":"message.send.req","data":{"conversationId":"conv-1","content":"Test"}}
```

---

## 注意事项

### 10.1 安全注意事项

#### ✅ 必须做的
1. **强制JWT认证**
   - 连接时必须验证Token
   - Token过期自动断开连接
   
2. **权限验证**
   - 每个操作都验证用户权限
   - 不能发送消息到非成员会话
   - 不能操作他人的好友关系
   
3. **输入验证**
   - 验证所有客户端输入
   - 防止SQL注入（使用ORM）
   - 防止XSS攻击
   
4. **频率限制**
   - 限制消息发送频率（如1秒10条）
   - 限制连接频率（防止DDoS）

#### ❌ 禁止做的
1. **不要信任客户端时间戳** - 使用服务器时间
2. **不要在WebSocket传输敏感信息** - Token已足够，不传密码
3. **不要存储明文密码** - 已有bcrypt加密，保持一致

### 10.2 性能注意事项

#### 内存管理
```typescript
// ❌ 错误：无限增长的数组
const messages: Message[] = [];
socket.on("message", (data) => {
  messages.push(data); // 内存泄漏
});

// ✅ 正确：使用数据库或限制大小
const recentMessages = new LRUCache({ max: 100 });
```

#### 连接数限制
```typescript
// 设置最大连接数
const MAX_CONNECTIONS = 10000;

if (connectionManager.getTotalConnections() >= MAX_CONNECTIONS) {
  socket.send(JSON.stringify({
    event: "error",
    code: "SERVICE_UNAVAILABLE",
    message: "Server is at full capacity"
  }));
  socket.close();
}
```

#### 消息推送优化
```typescript
// ❌ 错误：逐个推送
for (const userId of userIds) {
  await connectionManager.pushToUser(userId, event);
}

// ✅ 正确：批量推送
await connectionManager.batchPush(userIds, event);
```

### 10.3 可靠性注意事项

#### 自动重连（客户端）
```javascript
// 前端WebSocket客户端示例
class ReconnectingWebSocket {
  constructor(url) {
    this.url = url;
    this.reconnectInterval = 1000;
    this.maxReconnectInterval = 30000;
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.reconnectInterval = 1000;
      this.authenticate();
    };
    
    this.ws.onclose = () => {
      console.log("Disconnected, reconnecting...");
      setTimeout(() => {
        this.reconnectInterval = Math.min(
          this.reconnectInterval * 2,
          this.maxReconnectInterval
        );
        this.connect();
      }, this.reconnectInterval);
    };
  }
}
```

#### 心跳机制
```typescript
// 服务器端：检测僵尸连接
setInterval(() => {
  connectionManager.forEachSocket((socket, meta) => {
    if (Date.now() - meta.lastPing > 60000) {
      console.log(`[WS] Closing inactive socket: ${meta.userId}`);
      socket.close();
    }
  });
}, 30000);
```

#### 消息去重
```typescript
// 使用MessageDedup模型防止重复消息
import { MessageDedup } from "@/models/message/dedup";

export async function handleSend(socket: WebSocket, event: WsEvent) {
  const { clientMsgId } = event.data;
  
  // 检查是否重复
  const [dedup, created] = await MessageDedup.findOrCreate({
    where: { clientMsgId },
    defaults: { clientMsgId, handled: true }
  });
  
  if (!created) {
    // 重复消息，返回已有的msgId
    socket.send(JSON.stringify({
      event: "message.send.ack",
      code: "SUCCESS",
      data: { msgId: dedup.serverMsgId }
    }));
    return;
  }
  
  // 继续处理...
}
```

### 10.4 兼容性注意事项

#### 协议版本管理
```typescript
// 支持多个协议版本
const PROTOCOL_VERSION = "1.0";

socket.on("message", (data) => {
  const event = JSON.parse(data.toString());
  const clientVersion = event.version || "1.0";
  
  if (clientVersion !== PROTOCOL_VERSION) {
    socket.send(JSON.stringify({
      event: "error",
      code: "VERSION_MISMATCH",
      message: `Server version: ${PROTOCOL_VERSION}, Client version: ${clientVersion}`
    }));
    return;
  }
  
  // 继续处理...
});
```

#### 浏览器兼容性
- ✅ 现代浏览器都支持WebSocket
- ⚠️ IE10及以下不支持（需要polyfill或fallback）
- ✅ React Native、Electron原生支持

### 10.5 监控与告警

#### 关键指标
```typescript
// 导出Prometheus指标（可选）
import { Counter, Gauge } from "prom-client";

const wsConnections = new Gauge({
  name: "ws_connections_total",
  help: "Total WebSocket connections"
});

const wsMessages = new Counter({
  name: "ws_messages_total",
  help: "Total WebSocket messages",
  labelNames: ["event", "status"]
});

// 在ConnectionManager中更新
connectionManager.on("connection", () => {
  wsConnections.inc();
});

connectionManager.on("disconnect", () => {
  wsConnections.dec();
});
```

#### 日志记录
```typescript
// 关键事件记录
logger.info("[WS] Connection established", {
  userId,
  deviceId,
  ip: socket.remoteAddress
});

logger.warn("[WS] Unauthorized connection attempt", {
  ip: socket.remoteAddress,
  reason: "Invalid token"
});

logger.error("[WS] Message processing error", {
  userId,
  event: event.event,
  error: err.message
});
```

---

## 附录

### A. 参考文档

- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)
- [ws NPM Package](https://github.com/websockets/ws)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### B. 常见问题

**Q1: WebSocket和HTTP共用端口会冲突吗？**  
A: 不会，WebSocket使用HTTP的Upgrade机制，可以安全共享端口。

**Q2: 需要使用Socket.IO吗？**  
A: 不需要，原生`ws`库足够轻量高效。Socket.IO会增加不必要的复杂度。

**Q3: 如何处理网络闪断？**  
A: 客户端实现自动重连，服务器维护离线消息队列，重连后推送。

**Q4: 单个Node进程能支持多少连接？**  
A: 理论上可达10万+，实际取决于内存和CPU。建议单进程5000-10000连接。

**Q5: 如何扩展到多节点？**  
A: 使用Redis Pub/Sub或消息队列（RabbitMQ、Kafka）实现跨节点通信。

---

**文档结束**  
如有疑问，请联系 Z-kali
