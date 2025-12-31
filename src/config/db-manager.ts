/**
 * @packageDocumentation
 * @module config/db-manager
 * @since 1.0.0 (2025-12-31)
 * @author Z-kali
 * @description 统一的数据库管理模块，封装初始化、重置和清理逻辑
 */

import { existsSync, unlinkSync } from "node:fs";
import { getLogger } from "../tools/logging";
import { env } from "./env";
import type { Sequelize } from "sequelize";

const logger = getLogger("db-manager");

/**
 * @interface DatabaseInitOptions
 * @description 数据库初始化选项
 * @property {boolean} sync - 是否同步模型到数据库
 * @property {boolean} [force] - 是否强制重建表（会删除现有数据）
 * @property {boolean} [alter] - 是否自动修改表结构以匹配模型
 */
export interface DatabaseInitOptions {
  sync: boolean;
  force?: boolean;
  alter?: boolean;
}

/**
 * @function resetSQLiteFiles
 * @description 删除 SQLite 数据库文件及其相关文件（WAL、SHM）
 * @param {string} dbPath - 数据库文件路径
 * @returns {boolean} 是否成功删除文件
 * 
 * @example
 * ```typescript
 * resetSQLiteFiles('./data/database.sqlite');
 * ```
 */
export function resetSQLiteFiles(dbPath: string): boolean {
  try {
    if (!existsSync(dbPath)) {
      logger.info("Database file does not exist, skipping deletion", { dbPath });
      return false;
    }

    logger.warn(`Deleting database file: ${dbPath}`);
    unlinkSync(dbPath);

    // 删除 WAL 和 SHM 文件
    const walPath = `${dbPath}-wal`;
    const shmPath = `${dbPath}-shm`;

    if (existsSync(walPath)) {
      unlinkSync(walPath);
      logger.debug(`Deleted WAL file: ${walPath}`);
    }

    if (existsSync(shmPath)) {
      unlinkSync(shmPath);
      logger.debug(`Deleted SHM file: ${shmPath}`);
    }

    logger.info("Database files deleted successfully");
    return true;
  } catch (error) {
    logger.error("Failed to delete database files", {
      dbPath,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * @function resetDatabaseIfNeeded
 * @description 根据环境变量决定是否重置数据库文件
 * @returns {boolean} 是否执行了重置操作
 * 
 * @example
 * ```typescript
 * // 在启动时调用
 * if (resetDatabaseIfNeeded()) {
 *   console.log("Database reset completed");
 * }
 * ```
 */
export function resetDatabaseIfNeeded(): boolean {
  if (!env.DB_RESET) {
    return false;
  }

  if (env.DB_DIALECT !== "sqlite") {
    logger.warn("DB_RESET is only supported for SQLite, skipping", {
      dialect: env.DB_DIALECT,
    });
    return false;
  }

  return resetSQLiteFiles(env.DB_STORAGE);
}

/**
 * @function initializeDatabase
 * @description 初始化数据库连接并同步模型
 * @param {DatabaseInitOptions} options - 初始化选项
 * @returns {Promise<void>}
 * 
 * @example
 * ```typescript
 * await initializeDatabase({
 *   sync: true,
 *   force: false,
 *   alter: true,
 * });
 * ```
 */
export async function initializeDatabase(options: DatabaseInitOptions): Promise<void> {
  const { env } = await import("./env");
  
  if (env.DB_DIALECT === "mysql") {
    const { initDatabase } = await import("./sql/mysql");
    await initDatabase(options as any);
  } else {
    const { initDatabase } = await import("./sql/sqlite");
    await initDatabase(options);
  }
}

/**
 * @function closeDatabaseConnection
 * @description 关闭数据库连接
 * @param {Sequelize} sequelize - Sequelize 实例
 * @returns {Promise<void>}
 * 
 * @example
 * ```typescript
 * await closeDatabaseConnection(sequelize);
 * ```
 */
export async function closeDatabaseConnection(sequelize: Sequelize): Promise<void> {
  try {
    await sequelize.close();
    logger.info("Database connection closed successfully");
  } catch (error) {
    logger.error("Failed to close database connection", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * @function loadSeedData
 * @description 加载种子数据到数据库
 * @returns {Promise<void>}
 * 
 * @example
 * ```typescript
 * if (env.DB_SEED) {
 *   await loadSeedData();
 * }
 * ```
 */
export async function loadSeedData(): Promise<void> {
  if (!env.DB_SEED) {
    logger.debug("DB_SEED is not enabled, skipping seed data");
    return;
  }

  try {
    logger.info("Loading seed data...");
    const { loadAllSeeds } = await import("../../data/seeds/loader.js");
    await loadAllSeeds();
    logger.info("Seed data loaded successfully");
  } catch (error) {
    logger.error("Failed to load seed data", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
