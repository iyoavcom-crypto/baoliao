/**
 * @packageDocumentation
 * @module dto/common/examples
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 通用DTO使用示例
 */

import type { 
  ApiSuccessResponseDto, 
  ApiErrorResponseDto,
  PageDto,
  CursorDto,
  UserListDto,
  UserListQueryDto,
  MessageListDto,
  MessageCursorQueryDto,
} from "@/services/dto";
import { API_RESPONSE_FIELD, HTTP_STATUS } from "@/constants/api/index.js";

/**
 * ========================================
 * 示例1: 页码分页用户列表
 * ========================================
 */

// 请求参数（查询DTO）
const userQuery: UserListQueryDto = {
  page: 1,
  size: 20,
  orderBy: "createdAt",
  order: "DESC",
  keyword: "张三",
  state: "active",
  roleId: "user-role-001",
  vip: true,
};

// 成功响应（使用响应DTO + 分页DTO）
const userListResponse: ApiSuccessResponseDto<PageDto<UserListDto>> = {
  code: "ok",
  data: {
    items: [
      {
        id: "12345678901",
        pid: null,
        type: "user",
        name: "张三",
        phone: "13800138000",
        state: "active",
        roleId: "user-role-001",
        vip: true,
        avatar: "https://cdn.example.com/avatar/001.jpg",
        longSession: false,
        lastOnlineAt: new Date("2025-12-30T12:00:00Z"),
        createdAt: new Date("2025-01-01T00:00:00Z"),
      },
      // ... 更多用户
    ],
    page: 1,
    size: 20,
    total: 100,
    totalPages: 5,
    orderBy: "createdAt",
    order: "DESC",
  },
  serverTime: Date.now(),
  requestId: "req-uuid-001",
};

/**
 * ========================================
 * 示例2: 游标分页消息历史
 * ========================================
 */

// 请求参数
const messageQuery: MessageCursorQueryDto = {
  conversationId: 12345,
  cursor: "cursor-msg-1000",
  limit: 50,
  deleted: false,
};

// 成功响应
const messageHistoryResponse: ApiSuccessResponseDto<CursorDto<MessageListDto>> = {
  code: "ok",
  data: {
    items: [
      {
        id: "msg-uuid-001",
        conversationId: 12345,
        seq: 1000,
        kind: "text",
        senderId: "12345678901",
        createdAt: new Date("2025-12-30T12:00:00Z"),
      },
      // ... 更多消息
    ],
    limit: 50,
    cursor: "cursor-msg-1000",
    nextCursor: "cursor-msg-950",
    hasMore: true,
  },
  serverTime: Date.now(),
};

/**
 * ========================================
 * 示例3: 错误响应
 * ========================================
 */

// 参数验证失败
const validationErrorResponse: ApiErrorResponseDto = {
  code: "validation_failed",
  message: "参数验证失败",
  serverTime: Date.now(),
  requestId: "req-uuid-002",
};

// 资源未找到
const notFoundResponse: ApiErrorResponseDto = {
  code: "not_found",
  message: "用户不存在",
  serverTime: Date.now(),
};

// 权限不足
const forbiddenResponse: ApiErrorResponseDto = {
  code: "forbidden",
  message: "无权访问此资源",
  retriable: false,
  serverTime: Date.now(),
};

/**
 * ========================================
 * 示例4: HTTP处理函数中使用
 * ========================================
 */

import type { IncomingMessage, ServerResponse } from "node:http";
// import { respondJson } from "@/api/http/utils/respond.js";

async function handleUserList(req: IncomingMessage, res: ServerResponse) {
  try {
    // 解析查询参数
    const query: UserListQueryDto = {
      page: 1,
      size: 20,
      // ... 从req.url解析
    };
    
    // 查询数据库
    const users: UserListDto[] = []; // 从数据库获取
    const total = 100;
    
    // 构建响应
    const response: ApiSuccessResponseDto<PageDto<UserListDto>> = {
      code: "ok",
      data: {
        items: users,
        page: query.page!,
        size: query.size!,
        total,
        totalPages: Math.ceil(total / query.size!),
        orderBy: query.orderBy,
        order: query.order,
      },
      serverTime: Date.now(),
    };
    
    // 发送响应（类型安全）
    // return respondJson(res, HTTP_STATUS.OK, response);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    
  } catch (error: any) {
    // 错误响应
    const errorResponse: ApiErrorResponseDto = {
      code: "internal_error",
      message: error.message || "服务器内部错误",
      retriable: true,
      serverTime: Date.now(),
    };
    
    // return respondJson(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, errorResponse);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorResponse));
  }
}

/**
 * ========================================
 * 示例5: 类型安全使用
 * ========================================
 */

// 判断是否为成功响应
function isSuccessResponse(response: any): response is ApiSuccessResponseDto<any> {
  return response.code === "ok" && "data" in response;
}

// 在实际使用中，直接检查 code 字段
if (userListResponse.code === "ok") {
  console.log("用户数量:", userListResponse.data.items.length);
} else if (notFoundResponse.code === "not_found") {
  console.error("错误:", notFoundResponse.message);
}
