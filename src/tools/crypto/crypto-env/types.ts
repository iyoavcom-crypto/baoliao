/**
 * @packageDocumentation
 * @module @z-kali-config-crypto-env-types
 * @since 1.3.2 (2025-10-19)
 * @author Z-kali
 * @description 环境变量定义（用于 crypto/password.ts 等安全模块）
 * @path packages/config/src/crypto-env/types.ts
 */

/**
 * @interface CrypEnv
 * @description 环境变量定义
 * @property {string} NODE_ENV - 运行环境（development|production|test）
 * @property {string|undefined} PASSWORD_PEPPER - 口令 pepper，用于增强 scrypt 安全性
 * @property {number} PORT - 服务监听端口
 */
export interface CrypEnv {
  NODE_ENV: "development" | "production" | "test";
  PASSWORD_PEPPER?: string | undefined;
  PORT: number;
}

