/**
 * @packageDocumentation
 * @module env
 * @since 1.0.0 (2025-09-12)
 * @author
 *  Z-kali
 * @description 环境变量加载与类型安全转换（src/env.ts）
 */

import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

/**
 * @function required
 * @description 校验必填环境变量
 * @param {string} key - 环境变量名
 * @returns {string} 返回非空字符串
 */
function required(key: string): string {
  const v = process.env[key];
  if (!v || v.trim() === "") {
    throw new Error(`Environment variable "${key}" is required.`);
  }
  return v;
}

/**
 * @function toNumber
 * @description 将环境变量转换为 number
 * @param {string} key - 环境变量名
 * @param {number} def - 默认值
 * @returns {number} 数字
 */
function toNumber(key: string, def?: number): number {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    if (def === undefined) throw new Error(`Environment variable "${key}" is required.`);
    return def;
  }
  const n = Number(raw);
  if (Number.isNaN(n)) throw new Error(`Environment variable "${key}" must be a number.`);
  return n;
}

/**
 * @function toBoolean
 * @description 将环境变量转换为 boolean
 * @param {string} key - 环境变量名
 * @param {boolean} def - 默认值
 * @returns {boolean} 布尔值
 */
function toBoolean(key: string, def?: boolean): boolean {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") {
    if (def === undefined) throw new Error(`Environment variable "${key}" is required.`);
    return def;
  }
  return raw === "true" || raw === "1";
}

/**
 * @interface EnvConfig
 * @description 统一环境变量类型
 *
 * @property {string} NODE_ENV - 当前运行环境，如 development / production
 * @property {number} PORT - HTTP 服务运行端口
 *
 * @property {string} DB_DIALECT - 数据库方言
 * @property {string} DB_STORAGE - SQLite 文件路径
 *
 * @property {string} JWT_SECRET - JWT 密钥
 * @property {string} PIN_SECRET - PIN 加密密钥
 *
 * @property {number} DB_CONNECT_TIMEOUT - 数据库连接超时（ms）
 * @property {number} DB_RETRY_MAX - 数据库最大重试次数
 * @property {number} DB_RETRY_TIMEOUT - 重试间隔（ms）
 *
 * @property {number} DB_POOL_MAX - 连接池最大连接数
 * @property {number} DB_POOL_MIN - 连接池最小连接数
 * @property {number} DB_POOL_IDLE - 空闲连接回收时间（ms）
 * @property {number} DB_POOL_ACQUIRE - 获取连接最大等待时间（ms）
 * @property {number} DB_POOL_EVICT - 回收间隔时间（ms）
 *
 * @property {boolean} DB_SSL_ENABLED - 是否启用 SSL
 * @property {boolean} DB_SSL_REJECT_UNAUTHORIZED - 是否校验证书
 * @property {string | ""} DB_SSL_CA_FILE - CA 证书路径
 * @property {string | ""} DB_SSL_CERT_FILE - 证书路径
 * @property {string | ""} DB_SSL_KEY_FILE - SSL 私钥路径
 *
 * @property {string} DB_SESSION_TIME_ZONE - 会话时区
 * @property {string} DB_SESSION_TX_ISOLATION - 事务隔离级别
 * @property {string} DB_SESSION_CHARSET - 字符集
 * @property {string} DB_SESSION_COLLATION - 排序规则
 * @property {string} DB_SESSION_SQL_MODE - SQL 模式
 *
 * @property {boolean} DB_FORCE_SYNC - 是否强制同步模型
 * @property {boolean} DB_RESET - 是否删除数据库并重新同步（force=true）
 * @property {boolean} DB_SEED - 是否在启动时加载种子数据
 *
 * @property {string} MYSQL_HOST - MySQL 主机
 * @property {number} MYSQL_PORT - MySQL 端口
 * @property {string} MYSQL_DB - MySQL 数据库名
 * @property {string} MYSQL_USER - MySQL 用户名
 * @property {string} MYSQL_PASSWORD - MySQL 密码
 */
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;

  DB_DIALECT: string;
  DB_STORAGE: string;

  JWT_SECRET: string;
  PIN_SECRET: string;
  PASSWORD_PEPPER: string;
  ADMIN_REQUIRE_LOGIN: boolean;

  DB_CONNECT_TIMEOUT: number;
  DB_RETRY_MAX: number;
  DB_RETRY_TIMEOUT: number;

  DB_POOL_MAX: number;
  DB_POOL_MIN: number;
  DB_POOL_IDLE: number;
  DB_POOL_ACQUIRE: number;
  DB_POOL_EVICT: number;

  DB_SSL_ENABLED: boolean;
  DB_SSL_REJECT_UNAUTHORIZED: boolean;
  DB_SSL_CA_FILE: string | "";
  DB_SSL_CERT_FILE: string | "";
  DB_SSL_KEY_FILE: string | "";

  DB_SESSION_TIME_ZONE: string;
  DB_SESSION_TX_ISOLATION: string;
  DB_SESSION_CHARSET: string;
  DB_SESSION_COLLATION: string;
  DB_SESSION_SQL_MODE: string;

  DB_FORCE_SYNC: boolean;
  DB_RESET: boolean;
  DB_SEED: boolean;

  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_DB: string;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;

  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  WS_ENABLED: boolean;
  WS_PING_INTERVAL_MS: number;
  WS_IDLE_TIMEOUT_MS: number;
}

/**
 * @constant env
 * @description 解析后的环境变量对象（类型安全）
 */
export const env: EnvConfig = {
  NODE_ENV: required("NODE_ENV"),
  PORT: toNumber("PORT", 3000),

  DB_DIALECT: required("DB_DIALECT"),
  DB_STORAGE: required("DB_STORAGE"),

  JWT_SECRET: required("JWT_SECRET"),
  PIN_SECRET: required("PIN_SECRET"),
  PASSWORD_PEPPER: required("PASSWORD_PEPPER"),
  ADMIN_REQUIRE_LOGIN: toBoolean("ADMIN_REQUIRE_LOGIN", false),

  DB_CONNECT_TIMEOUT: toNumber("DB_CONNECT_TIMEOUT"),
  DB_RETRY_MAX: toNumber("DB_RETRY_MAX"),
  DB_RETRY_TIMEOUT: toNumber("DB_RETRY_TIMEOUT"),

  DB_POOL_MAX: toNumber("DB_POOL_MAX"),
  DB_POOL_MIN: toNumber("DB_POOL_MIN"),
  DB_POOL_IDLE: toNumber("DB_POOL_IDLE"),
  DB_POOL_ACQUIRE: toNumber("DB_POOL_ACQUIRE"),
  DB_POOL_EVICT: toNumber("DB_POOL_EVICT"),

  DB_SSL_ENABLED: toBoolean("DB_SSL_ENABLED"),
  DB_SSL_REJECT_UNAUTHORIZED: toBoolean("DB_SSL_REJECT_UNAUTHORIZED"),
  DB_SSL_CA_FILE: process.env.DB_SSL_CA_FILE || "",
  DB_SSL_CERT_FILE: process.env.DB_SSL_CERT_FILE || "",
  DB_SSL_KEY_FILE: process.env.DB_SSL_KEY_FILE || "",

  DB_SESSION_TIME_ZONE: required("DB_SESSION_TIME_ZONE"),
  DB_SESSION_TX_ISOLATION: required("DB_SESSION_TX_ISOLATION"),
  DB_SESSION_CHARSET: required("DB_SESSION_CHARSET"),
  DB_SESSION_COLLATION: required("DB_SESSION_COLLATION"),
  DB_SESSION_SQL_MODE: process.env.DB_SESSION_SQL_MODE || "",

  DB_FORCE_SYNC: toBoolean("DB_FORCE_SYNC"),
  DB_RESET: toBoolean("DB_RESET", false),
  DB_SEED: toBoolean("DB_SEED", false),

  MYSQL_HOST: required("MYSQL_HOST"),
  MYSQL_PORT: toNumber("MYSQL_PORT"),
  MYSQL_DB: required("MYSQL_DB"),
  MYSQL_USER: required("MYSQL_USER"),
  MYSQL_PASSWORD: required("MYSQL_PASSWORD"),

  RATE_LIMIT_WINDOW_MS: toNumber("RATE_LIMIT_WINDOW_MS", 60_000),
  RATE_LIMIT_MAX_REQUESTS: toNumber("RATE_LIMIT_MAX_REQUESTS", 120),

  WS_ENABLED: toBoolean("WS_ENABLED", false),
  WS_PING_INTERVAL_MS: toNumber("WS_PING_INTERVAL_MS", 15_000),
  WS_IDLE_TIMEOUT_MS: toNumber("WS_IDLE_TIMEOUT_MS", 45_000),
};

export default env;
