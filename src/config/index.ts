/**
 * @packageDocumentation
 * @module config
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 数据库配置统一导出与初始化
 */

import { env } from "./env";
import * as mysql from "./sql/mysql";
import * as sqlite from "./sql/sqlite";

export { env };

/**
 * Sequelize 实例 - 根据环境变量选择 MySQL 或 SQLite
 */
export const sequelize = env.DB_DIALECT === "mysql" ? mysql.sequelize : sqlite.sequelize;

/**
 * @function initDatabase
 * @description 初始化数据库连接并同步模型
 * @param {Object} options - 初始化选项
 * @param {boolean} options.sync - 是否同步模型到数据库
 * @param {boolean} [options.force] - 是否强制重建表(会删除现有数据)
 * @param {boolean} [options.alter] - 是否自动修改表结构以匹配模型
 */
export async function initDatabase(options: { sync: boolean; force?: boolean; alter?: boolean }): Promise<void> {
  if (env.DB_DIALECT === "mysql") {
    await mysql.initDatabase(options as any);
  } else {
    await sqlite.initDatabase(options as any);
  }
}

/**
 * @function initDatabaseAsync
 * @description 异步初始化数据库连接(别名)
 * @param {Object} options - 初始化选项
 */
export async function initDatabaseAsync(options: { sync: boolean; force?: boolean; alter?: boolean }): Promise<void> {
  return initDatabase(options);
}

/**
 * @function checkDbHealth
 * @description 检查数据库连接健康状态
 * @returns {Promise<boolean>} 连接是否正常
 */
export async function checkDbHealth(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
