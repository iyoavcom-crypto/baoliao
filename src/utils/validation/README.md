# 验证工具函数库 (Validation Utilities)

本模块提供了统一的验证工具函数，用于减少HTTP和WebSocket控制器中的重复代码，提高代码可维护性和一致性。

## 目录结构

```
src/utils/validation/
├── http-validation.ts      # HTTP请求验证工具
├── ws-validation.ts         # WebSocket验证工具
└── index.ts                 # 统一导出
```

---

## HTTP 验证工具 (`http-validation.ts`)

### `validateAuthRequired(req, res)`

验证用户是否已认证。

**参数:**
- `req: AuthRequest` - 认证请求对象
- `res: Response` - Express响应对象

**返回:**
- `string | null` - 如果已认证返回userId，否则返回null并发送401响应

**示例:**

```typescript
import { validateAuthRequired } from "@/utils/validation";

export const myController = wrap(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = validateAuthRequired(authReq, res);
  if (!userId) return; // 已自动发送401响应
  
  // 继续处理业务逻辑...
});
```

---

### `validateRequired(res, fields)`

验证必需字段是否存在。

**参数:**
- `res: Response` - Express响应对象
- `fields: Record<string, any>` - 字段对象，key为字段名，value为字段值

**返回:**
- `boolean` - 所有字段都存在返回true，否则返回false并发送400响应

**示例:**

```typescript
import { validateRequired } from "@/utils/validation";

export const addFriend = wrap(async (req: Request, res: Response) => {
  const { friendId, message } = req.body;
  
  // 验证必需字段
  if (!validateRequired(res, { friendId })) return;
  
  // 继续处理...
});
```

---

### `validateNotSelf(res, userId, targetId, message?)`

验证目标用户不是当前用户自己。

**参数:**
- `res: Response` - Express响应对象
- `userId: string` - 当前用户ID
- `targetId: string` - 目标用户ID
- `message?: string` - 自定义错误消息（可选）

**返回:**
- `boolean` - 不是自己返回true，否则返回false并发送400响应

**示例:**

```typescript
import { validateNotSelf } from "@/utils/validation";

export const addFriend = wrap(async (req: Request, res: Response) => {
  const { friendId } = req.body;
  const userId = validateAuthRequired(req as AuthRequest, res);
  if (!userId) return;
  
  // 验证不能添加自己为好友
  if (!validateNotSelf(res, userId, friendId, "Cannot add yourself as friend")) return;
  
  // 继续处理...
});
```

---

### `validateCustom(res, fieldName, fieldValue, rules)`

执行自定义验证规则。

**参数:**
- `res: Response` - Express响应对象
- `fieldName: string` - 字段名
- `fieldValue: any` - 字段值
- `rules: ValidationRule[]` - 验证规则数组

**ValidationRule接口:**
```typescript
interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}
```

**示例:**

```typescript
import { validateCustom } from "@/utils/validation";

const rules = [
  {
    validate: (value) => value.length >= 3,
    message: "Name must be at least 3 characters"
  },
  {
    validate: (value) => /^[a-zA-Z\s]+$/.test(value),
    message: "Name can only contain letters and spaces"
  }
];

if (!validateCustom(res, "name", req.body.name, rules)) return;
```

---

## WebSocket 验证工具 (`ws-validation.ts`)

### `wsRequireAuth(socket, event)`

验证WebSocket连接是否已认证。

**参数:**
- `socket: WebSocket` - WebSocket连接
- `event: WsEvent` - WebSocket事件

**返回:**
- `string | null` - 如果已认证返回userId，否则返回null并发送错误事件

**示例:**

```typescript
import { wsRequireAuth } from "@/utils/validation";

export async function handleSend(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = wsRequireAuth(socket, event);
  if (!userId) return; // 已自动发送UNAUTHORIZED错误
  
  // 继续处理...
}
```

---

### `wsValidateRequired(socket, event, fields)`

验证WebSocket事件数据中的必需字段。

**参数:**
- `socket: WebSocket` - WebSocket连接
- `event: WsEvent` - WebSocket事件
- `fields: Record<string, any>` - 字段对象

**返回:**
- `boolean` - 所有字段都存在返回true，否则返回false并发送错误事件

**示例:**

```typescript
import { wsValidateRequired } from "@/utils/validation";

export async function handleSend(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = wsRequireAuth(socket, event);
  if (!userId) return;
  
  const data = event.data as MessageSendReqData;
  if (!wsValidateRequired(socket, event, {
    conversationId: data?.conversationId,
    content: data?.content
  })) return;
  
  // 继续处理...
}
```

---

### `wsValidateData(socket, event)`

验证WebSocket事件是否包含data字段。

**返回:**
- `boolean` - data存在且为对象返回true，否则返回false并发送错误

---

### `wsHandleError(socket, event, handler, options?)`

WebSocket错误处理包装器，自动捕获异常并发送错误事件。

**参数:**
- `socket: WebSocket` - WebSocket连接
- `event: WsEvent` - WebSocket事件
- `handler: () => Promise<void>` - 处理函数
- `options?: WsErrorHandlerOptions` - 选项（可选）

**WsErrorHandlerOptions:**
```typescript
interface WsErrorHandlerOptions {
  logContext?: Record<string, any>;  // 日志上下文
  logError?: boolean;                // 是否记录错误（默认true）
  errorMessage?: string;             // 自定义错误消息
}
```

**示例:**

```typescript
import { wsHandleError } from "@/utils/validation";

export async function handleSend(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = wsRequireAuth(socket, event);
  if (!userId) return;
  
  await wsHandleError(socket, event, async () => {
    // 业务逻辑...
    const message = await Message.create({ /* ... */ });
    // 更多操作...
  });
}
```

---

### `wsValidateCustom(socket, event, condition, errorCode, errorMessage)`

执行自定义WebSocket验证规则。

**参数:**
- `socket: WebSocket` - WebSocket连接
- `event: WsEvent` - WebSocket事件
- `condition: boolean` - 验证条件
- `errorCode: string` - 错误码（来自WS_ERROR_CODES）
- `errorMessage: string` - 错误消息

**返回:**
- `boolean` - 验证通过返回true，否则返回false并发送错误事件

**示例:**

```typescript
import { wsValidateCustom } from "@/utils/validation";

export async function handleRecall(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = wsRequireAuth(socket, event);
  if (!userId) return;
  
  const message = await Message.findOne({ /* ... */ });
  
  // 验证权限
  if (!wsValidateCustom(
    socket,
    event,
    message?.senderId === userId,
    WS_ERROR_CODES.FORBIDDEN,
    "You can only recall your own messages"
  )) return;
  
  // 继续处理...
}
```

---

### `wsSendError(socket, event, errorCode, errorMessage)`

直接发送WebSocket错误事件。

**示例:**

```typescript
import { wsSendError } from "@/utils/validation";

wsSendError(socket, event, WS_ERROR_CODES.NOT_FOUND, "Resource not found");
```

---

## 重构前后对比

### HTTP Controller 重构前:

```typescript
export async function addFriend(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.sub;
    
    if (!userId) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
        status: 401
      });
      return;
    }

    const { friendId } = req.body;
    
    if (!friendId) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "friendId is required",
        status: 400
      });
      return;
    }

    if (userId === friendId) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "Cannot add yourself as friend",
        status: 400
      });
      return;
    }

    // ... 业务逻辑 ...

    res.status(201).json({
      code: "SUCCESS",
      message: "Friend request sent",
      data: result,
      status: 201
    });
  } catch (error: any) {
    console.error("[addFriend] Error:", error);
    res.status(500).json({
      code: error.name || "INTERNAL_ERROR",
      message: error.message || "Failed to send friend request",
      status: 500
    });
  }
}
```

### HTTP Controller 重构后:

```typescript
export const addFriend = wrap(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const userId = validateAuthRequired(authReq, res);
  if (!userId) return;

  const { friendId } = req.body;
  if (!validateRequired(res, { friendId })) return;
  if (!validateNotSelf(res, userId, friendId, "Cannot add yourself as friend")) return;

  // ... 业务逻辑 ...

  ok(res, result, "Friend request sent", 201);
});
```

**代码减少: ~70% (从 ~50 行减少到 ~15 行)**

---

### WebSocket Controller 重构前:

```typescript
export async function handleSend(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = connectionManager.getUserIdBySocket(socket);
  if (!userId) {
    socket.send(JSON.stringify(
      createErrorEvent(WS_ERROR_CODES.UNAUTHORIZED, "Not authenticated", event.requestId)
    ));
    return;
  }

  const data = event.data as MessageSendReqData;
  if (!data || !data.conversationId || !data.content) {
    socket.send(JSON.stringify(
      createErrorEvent(WS_ERROR_CODES.INVALID_REQUEST, "required fields missing", event.requestId)
    ));
    return;
  }

  try {
    // ... 业务逻辑 ...
  } catch (error: any) {
    logger.error("[WS] Failed", { error: error.message });
    socket.send(JSON.stringify(
      createErrorEvent(WS_ERROR_CODES.INTERNAL_ERROR, error.message, event.requestId)
    ));
  }
}
```

### WebSocket Controller 重构后:

```typescript
export async function handleSend(socket: WebSocket, event: WsEvent): Promise<void> {
  const userId = wsRequireAuth(socket, event);
  if (!userId) return;

  const data = event.data as MessageSendReqData;
  if (!wsValidateRequired(socket, event, {
    conversationId: data?.conversationId,
    content: data?.content
  })) return;

  await wsHandleError(socket, event, async () => {
    // ... 业务逻辑 ...
  });
}
```

**代码减少: ~65% (从 ~35 行减少到 ~12 行)**

---

## 优势总结

### 1. 代码重复减少 30-70%
- 消除了重复的认证检查代码
- 统一了字段验证逻辑
- 集中了错误处理模式

### 2. 提高代码可维护性
- 验证逻辑集中管理，易于更新
- 错误响应格式统一
- 减少了手写错误响应的机会

### 3. 提升开发效率
- 新控制器开发更快
- 更少的样板代码
- 更清晰的业务逻辑

### 4. 增强代码一致性
- 所有控制器使用相同的验证模式
- 错误消息格式统一
- 减少了人为错误

### 5. 更好的类型安全
- 完整的TypeScript类型定义
- 编译时类型检查
- 更好的IDE支持

---

## 最佳实践

### 1. HTTP控制器始终使用 `wrap()`

```typescript
// ✅ 推荐
export const myController = wrap(async (req, res) => {
  // 自动错误处理
});

// ❌ 不推荐
export async function myController(req, res) {
  try {
    // 手动try-catch
  } catch (error) {
    // ...
  }
}
```

### 2. 使用 `ok()` 和 `fail()` 发送响应

```typescript
// ✅ 推荐
ok(res, data, "Success message", 200);

// ❌ 不推荐
res.status(200).json({
  code: "SUCCESS",
  message: "Success message",
  data: data,
  status: 200
});
```

### 3. WebSocket使用 `wsHandleError()` 包装业务逻辑

```typescript
// ✅ 推荐
await wsHandleError(socket, event, async () => {
  // 业务逻辑
});

// ❌ 不推荐
try {
  // 业务逻辑
} catch (error) {
  socket.send(JSON.stringify(createErrorEvent(...)));
}
```

### 4. 优先使用验证工具函数

```typescript
// ✅ 推荐
if (!wsValidateRequired(socket, event, { field: data?.field })) return;

// ❌ 不推荐
if (!data || !data.field) {
  socket.send(JSON.stringify(createErrorEvent(...)));
  return;
}
```

---

## 迁移指南

### 现有代码迁移步骤:

1. **导入验证工具**
   ```typescript
   import { validateAuthRequired, validateRequired } from "@/utils/validation";
   import { ok, fail, wrap } from "@/middleware/requests/crud";
   ```

2. **替换认证检查**
   ```typescript
   // Before
   const userId = authReq.user?.sub;
   if (!userId) {
     res.status(401).json({ ... });
     return;
   }
   
   // After
   const userId = validateAuthRequired(authReq, res);
   if (!userId) return;
   ```

3. **替换字段验证**
   ```typescript
   // Before
   if (!friendId) {
     res.status(400).json({ ... });
     return;
   }
   
   // After
   if (!validateRequired(res, { friendId })) return;
   ```

4. **使用 wrap() 包装异步处理器**
   ```typescript
   // Before
   export async function myController(req, res) { ... }
   
   // After
   export const myController = wrap(async (req, res) => { ... });
   ```

5. **使用 ok() 发送成功响应**
   ```typescript
   // Before
   res.status(200).json({ code: "SUCCESS", data, message });
   
   // After
   ok(res, data, message);
   ```

---

## 相关模块

- **模型验证**: `src/models/_shared/validators.ts`
- **CRUD工具**: `src/middleware/requests/crud/`
- **WebSocket协议**: `src/routes/ws/protocol.ts`
- **错误码定义**: `src/constants/ws/errors.ts`
