/**
 * @packageDocumentation
 * @module app
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Express 应用配置与中间件设置
 */

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { useRequestLoggingMiddleware } from "./middleware/logger.ts";
import routes from "./routes";
import { getLogger } from "./tools/logging";

const logger = getLogger("app");

/**
 * @function createApp
 * @description 创建并配置 Express 应用实例
 * @returns {Express} 配置好的 Express 应用
 */
export function createApp(): Express {
  const app = express();

  // ==================== 安全中间件 ====================
  
  // Helmet - 设置安全相关的 HTTP 头
  app.use(
    helmet({
      contentSecurityPolicy: false, // 根据需要配置 CSP
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS - 跨域资源共享配置
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*", // 生产环境应指定具体域名
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "X-Trace-Id", "X-Device-Id"],
      exposedHeaders: ["X-Request-Id", "X-Trace-Id", "X-Response-Time", "Server-Timing"],
      maxAge: 86400, // 24小时
    })
  );

  // ==================== 请求处理中间件 ====================

  // 压缩响应
  app.use(compression());

  // 解析 JSON 请求体
  app.use(express.json({ limit: "10mb" }));

  // 解析 URL 编码请求体
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 请求日志中间件(含 traceId 和性能计时)
  app.use(useRequestLoggingMiddleware());

  // ==================== 健康检查 ====================

  // 健康检查端点(不需要认证)
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
    });
  });

  // Readiness 探针(检查数据库连接)
  app.get("/ready", async (req: Request, res: Response) => {
    try {
      const { checkDbHealth } = await import("./config/sql/mysql");
      const dbOk = await checkDbHealth();
      
      if (dbOk) {
        res.status(200).json({ status: "ready", database: "connected" });
      } else {
        res.status(503).json({ status: "not_ready", database: "disconnected" });
      }
    } catch (error) {
      res.status(503).json({
        status: "not_ready",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // 路由列表查询端点（开发环境）
  if (process.env.NODE_ENV === "development") {
    app.get("/debug/routes", async (req: Request, res: Response) => {
      const { getAllRoutes } = await import("./routes/api");
      const routeList = getAllRoutes();
      
      const groupByMethod = req.query.groupBy === "method";
      const filterMethod = req.query.method as string | undefined;
      const filterPath = req.query.path as string | undefined;
      
      let filtered = routeList;
      
      // 过滤方法
      if (filterMethod) {
        filtered = filtered.filter((r: any) => r.method.toLowerCase() === filterMethod.toLowerCase());
      }
      
      // 过滤路径
      if (filterPath) {
        filtered = filtered.filter((r: any) => r.path.includes(filterPath));
      }
      
      // 按方法分组
      if (groupByMethod) {
        const grouped = filtered.reduce((acc: any, route: any) => {
          const method = route.method;
          if (!acc[method]) acc[method] = [];
          acc[method].push(route);
          return acc;
        }, {});
        
        return res.json({
          total: filtered.length,
          grouped,
          query: { groupBy: "method", method: filterMethod, path: filterPath },
        });
      }
      
      res.json({
        total: filtered.length,
        routes: filtered,
        query: { method: filterMethod, path: filterPath },
      });
    });
  }

  // ==================== 业务路由 ====================

  // 挂载所有业务路由
  app.use(routes);

  // ==================== 404 处理 ====================

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
      path: req.path,
      method: req.method,
    });
  });

  // ==================== 全局错误处理 ====================

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // 记录错误
    logger.error("Unhandled error", {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      path: req.path,
      method: req.method,
    });

    // 检查是否已发送响应
    if (res.headersSent) {
      return next(err);
    }

    // 业务错误(带 status 属性)
    if ("status" in err && typeof (err as any).status === "number") {
      const status = (err as any).status;
      const code = (err as any).code || "ERROR";
      
      return res.status(status).json({
        code,
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    }

    // 未知错误
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  return app;
}
