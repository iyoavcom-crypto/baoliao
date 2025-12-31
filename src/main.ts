/**
 * @packageDocumentation
 * @module main
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 应用程序启动入口
 */

import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./app";
import { initDatabaseAsync, sequelize, env } from "./config";
import { getLogger, setGlobalLogLevel } from "./tools/logging";
import type { LogLevel } from "./tools/logging";
import { existsSync, unlinkSync } from "node:fs";
import { WsServer } from "./routes/ws";

const logger = getLogger("main");

/**
 * @function main
 * @description 主函数 - 初始化并启动服务器
 */
async function main(): Promise<void> {
  try {
    // 设置日志级别
    const logLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
    setGlobalLogLevel(logLevel);

    logger.info("Starting application", {
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
      logLevel,
      dbReset: env.DB_RESET,
      dbSeed: env.DB_SEED,
    });

    // 如果启用了DB_RESET，删除数据库文件
    if (env.DB_RESET && env.DB_DIALECT === "sqlite") {
      const dbPath = env.DB_STORAGE;
      if (existsSync(dbPath)) {
        logger.warn(`Deleting database file: ${dbPath}`);
        unlinkSync(dbPath);
        const walPath = `${dbPath}-wal`;
        const shmPath = `${dbPath}-shm`;
        if (existsSync(walPath)) unlinkSync(walPath);
        if (existsSync(shmPath)) unlinkSync(shmPath);
        logger.info("Database deleted successfully");
      }
    }

    // 初始化数据库连接
    logger.info("Initializing database connection...");
    await initDatabaseAsync({
      sync: true,
      force: env.DB_RESET, // 如果DB_RESET=true，强制重建表
      alter: !env.DB_RESET && process.env.NODE_ENV === "development", // 重置时不使用alter
    });
    logger.info("Database initialized successfully");

    // 如果启用了DB_SEED，加载种子数据
    if (env.DB_SEED) {
      logger.info("Loading seed data...");
      try {
        const { loadAllSeeds } = await import("../data/seeds/loader.js");
        await loadAllSeeds();
        logger.info("Seed data loaded successfully");
      } catch (error) {
        logger.error("Failed to load seed data", { error });
        throw error;
      }
    }

    // 创建 Express 应用
    const app = createApp();

    // 获取端口号
    const port = parseInt(process.env.PORT || "3000", 10);
    const host = process.env.HOST || "0.0.0.0";

    // 创建 HTTP 服务器
    const httpServer = createServer(app);

    // 启动 WebSocket 服务器
    logger.info("Starting WebSocket server...");
    const wsServer = new WsServer(httpServer);
    wsServer.startHeartbeat();
    wsServer.startCleanup();
    logger.info("WebSocket server initialized", wsServer.getStats());

    // 启动 HTTP 服务器
    httpServer.listen(port, host, () => {
      logger.info("Server started", {
        port,
        host,
        httpUrl: `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`,
        wsUrl: `ws://${host === "0.0.0.0" ? "localhost" : host}:${port}/ws`,
        env: process.env.NODE_ENV,
      });

      // 输出健康检查端点
      logger.info("Health endpoints:", {
        health: `http://localhost:${port}/health`,
        ready: `http://localhost:${port}/ready`,
      });
    });

    // 优雅关闭处理
    const gracefulShutdown = async (signal: string) => {
      logger.warn(`Received ${signal}, starting graceful shutdown...`);

      httpServer.close(async () => {
        logger.info("HTTP server closed");

        try {
          // 关闭 WebSocket 服务器
          wsServer.close();
          logger.info("WebSocket server closed");

          // 关闭数据库连接
          await sequelize.close();
          logger.info("Database connection closed");

          logger.info("Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown", { error });
          process.exit(1);
        }
      });

      // 强制退出超时(30秒)
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 30000);
    };

    // 监听进程信号
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // 未捕获异常处理
    process.on("uncaughtException", (error: Error) => {
      logger.fatal("Uncaught exception", {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
      process.exit(1);
    });

    process.on("unhandledRejection", (reason: any) => {
      logger.fatal("Unhandled rejection", {
        reason: reason instanceof Error ? {
          name: reason.name,
          message: reason.message,
          stack: reason.stack,
        } : reason,
      });
      process.exit(1);
    });

  } catch (error) {
    logger.fatal("Failed to start application", {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
    process.exit(1);
  }
}

// 启动应用
main().catch((error) => {
  console.error("Fatal error during startup:", error);
  process.exit(1);
});
