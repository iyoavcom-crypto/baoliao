/**
 * @packageDocumentation
 * @module @z-kali-config-crypto-env
 * @since 1.3.2 (2025-10-19)
 * @author Z-kali
 * @description 加载并校验环境变量（用于 crypto/password.ts 等安全模块）
 * @path packages/config/src/crypto-env/index.ts
 */

import { config as dotenv } from "dotenv";
import process from "node:process";
import type { CrypEnv } from "./types.js";

// 初始化 dotenv，仅加载一次
dotenv();

/**
 * @function loadCryptoEnv
 * @description 从 process.env 提取并验证配置项
 * @returns {Readonly<CrypEnv>} 冻结后的环境配置对象
 */
export function loadCryptoEnv(): Readonly<CrypEnv> {
  const { NODE_ENV = "development", PASSWORD_PEPPER, PORT = "3000" } = process.env;

  if (!["development", "production", "test"].includes(NODE_ENV)) {
    throw new Error(`Invalid NODE_ENV: ${NODE_ENV}`);
  }

  const port = Number(PORT);
  if (!Number.isSafeInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${PORT}`);
  }

  const cfg: CrypEnv = {
    NODE_ENV: NODE_ENV as CrypEnv["NODE_ENV"],
    PASSWORD_PEPPER,
    PORT: port,
  };
  return Object.freeze(cfg);
}

/** @constant cryptoEnv @description 冻结的环境配置实例 */
export const cryptoEnv = loadCryptoEnv();
