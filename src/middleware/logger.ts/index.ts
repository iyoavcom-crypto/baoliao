/**
 * @packageDocumentation
 * @module middleware/logger
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description HTTP 请求日志中间件,集成结构化日志、traceId 上下文传递与性能计时
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { logHttpAccess, runWithRequestContext } from "@/tools/logging";

/**
 * @interface RequestLocalsWithContext
 * @description 扩展 Express Response.locals 类型定义
 * @property {string} requestId - 请求唯一标识符
 * @property {string} traceId - 分布式追踪标识符
 * @property {string} [userId] - 用户ID(如果已认证)
 */
interface RequestLocalsWithContext {
  requestId: string;
  traceId: string;
  userId?: string;
}

/**
 * @function extractUserId
 * @description 从请求中提取用户 ID(如果存在)
 * @param {Request} req - Express 请求对象
 * @returns {string | undefined} 用户 ID
 */
function extractUserId(req: Request): string | undefined {
  // 从认证中间件注入的 res.locals.user 中提取
  const user = (req.res?.locals as any)?.user;
  if (user?.id) return String(user.id);
  if (user?.userId) return String(user.userId);
  
  // 从 JWT payload 中提取(如果有)
  const jwtPayload = (req as any).user;
  if (jwtPayload?.userId) return String(jwtPayload.userId);
  if (jwtPayload?.id) return String(jwtPayload.id);
  if (jwtPayload?.sub) return String(jwtPayload.sub);
  
  return undefined;
}

/**
 * @function extractClientIp
 * @description 提取客户端真实 IP 地址(考虑代理)
 * @param {Request} req - Express 请求对象
 * @returns {string} 客户端 IP
 */
function extractClientIp(req: Request): string {
  // 优先从 X-Forwarded-For 或 X-Real-IP 获取
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return ip?.trim() ?? "unknown";
  }
  
  const realIp = req.headers["x-real-ip"];
  if (realIp && typeof realIp === "string") return realIp.trim();
  
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

/**
 * @function useRequestLoggingMiddleware
 * @description 创建 HTTP 请求日志记录中间件
 * @returns {RequestHandler} Express 中间件函数
 * 
 * @example
 * ```typescript
 * app.use(useRequestLoggingMiddleware());
 * ```
 * 
 * 功能特性:
 * - 自动生成或传递 requestId 和 traceId
 * - 记录请求开始时间,计算响应耗时
 * - 在响应头中添加 X-Request-Id、X-Response-Time、Server-Timing
 * - 使用 AsyncLocalStorage 传递 traceId 上下文
 * - 集成 logHttpAccess 进行结构化日志记录
 * - 自动提取用户 ID 和客户端 IP
 */
export function useRequestLoggingMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();
    
    // 生成或获取 requestId 和 traceId
    const requestId = (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
    const traceId = (req.headers["x-trace-id"] as string | undefined) ?? randomUUID();
    
    // 保存到 res.locals 供后续中间件使用
    const locals = res.locals as unknown as RequestLocalsWithContext;
    locals.requestId = requestId;
    locals.traceId = traceId;
    
    // 设置响应头
    try {
      if (!res.headersSent) {
        res.setHeader("X-Request-Id", requestId);
        res.setHeader("X-Trace-Id", traceId);
      }
    } catch (err) {
      // 忽略响应头设置失败(可能已发送)
    }
    
    // 包装 writeHead 以确保在发送响应前设置性能计时头
    const originalWriteHead = res.writeHead.bind(res);
    res.writeHead = function (statusCode: number, ...args: any[]): Response {
      const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      
      try {
        if (!res.getHeader("X-Request-Id")) res.setHeader("X-Request-Id", requestId);
        if (!res.getHeader("X-Trace-Id")) res.setHeader("X-Trace-Id", traceId);
        if (!res.getHeader("X-Response-Time")) res.setHeader("X-Response-Time", `${elapsedMs.toFixed(2)}ms`);
        if (!res.getHeader("Server-Timing")) res.setHeader("Server-Timing", `total;dur=${elapsedMs.toFixed(2)}`);
      } catch (err) {
        // 忽略响应头设置失败
      }
      
      return originalWriteHead(statusCode, ...args) as Response;
    } as any;
    
    // 监听响应完成事件,记录访问日志
    res.on("finish", () => {
      const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      const userId = extractUserId(req);
      const ip = extractClientIp(req);
      
      // 使用结构化日志记录
      logHttpAccess({
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        ok: res.statusCode < 400,
        durationMs: Math.round(elapsedMs * 100) / 100, // 保留两位小数
        requestId,
        traceId,
        ip,
        uid: userId,
      });
    });
    
    // 在 AsyncLocalStorage 上下文中执行后续中间件
    runWithRequestContext(
      { requestId, traceId },
      () => next()
    );
  };
}
