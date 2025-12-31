/**
 * @packageDocumentation
 * @module @z-kali-config-jwt-env
 * @since 1.0.1 (2025-11-09)
 * @author Z-kali
 * @description 从环境变量加载并验证 JWT 配置（支持 HS/RS 两种算法）
 * @path packages/config/src/jwt-env/index.ts
 */

import { config } from "dotenv";
import type { JwtEnv } from "./types.js";
config();

/**
 * @function loadJwtEnv
 * @description 加载并验证 JWT 环境变量
 * @returns {JwtEnv} 已验证的 JWT 环境配置对象
 */
export function loadJwtEnv(): JwtEnv {
  const {
    JWT_ALGORITHM,
    JWT_ACCESS_TTL,
    JWT_REFRESH_TTL,
    JWT_SECRET,
    JWT_PRIVATE_KEY_PATH,
    JWT_PUBLIC_KEY_PATH,
  } = process.env;

  const algorithm = (JWT_ALGORITHM ?? "HS256") as "HS256" | "RS256";
  const accessTtl = JWT_ACCESS_TTL ?? "15m";
  const refreshTtl = JWT_REFRESH_TTL ?? "7d";
  const secret = JWT_SECRET ?? "dev-secret";

  if (algorithm === "RS256" && (!JWT_PRIVATE_KEY_PATH || !JWT_PUBLIC_KEY_PATH))
    throw new Error("RS256 requires JWT_PRIVATE_KEY_PATH and JWT_PUBLIC_KEY_PATH");

  return {
    JWT_ALGORITHM: algorithm,
    JWT_ACCESS_TTL: accessTtl,
    JWT_REFRESH_TTL: refreshTtl,
    JWT_SECRET: secret,
    JWT_PRIVATE_KEY_PATH,
    JWT_PUBLIC_KEY_PATH,
  };
}

/**
 * @constant jwtEnv
 * @description 已加载并通过验证的 JWT 环境配置
 */
export const jwtEnv: JwtEnv = loadJwtEnv();
