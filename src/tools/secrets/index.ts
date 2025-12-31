/**
 * @packageDocumentation
 * @module secrets
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 安全密钥生成与格式化输出工具脚本（scripts/generate-secrets.ts）
 * @see module:env
 */

import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

/**
 * @type SecretFormat
 * @description 密钥输出格式类型
 */
export type SecretFormat = "env" | "json";

/**
 * @function toB64u
 * @description 将 Buffer 转换为 base64url 字符串
 * @param {Buffer} buf - 随机字节缓冲区
 * @returns {string} base64url 编码字符串
 */
const toB64u = (buf: Buffer): string => buf.toString("base64url");

function calcBytesForB64uLen(len: number): number {
  const L = Math.floor(len);
  if (!Number.isFinite(L) || L <= 0) return 32;
  const r = L % 4;
  if (r === 0) return (L / 4) * 3;
  if (r === 2) return Math.floor(L / 4) * 3 + 1;
  if (r === 3) return Math.floor(L / 4) * 3 + 2;
  return Math.floor((L - 1) / 4) * 3;
}

/**
 * @function generatePinSecret
 * @description 生成 PIN 密钥（base64url 编码）
 * @param {number} [length=32] - 随机字节长度
 * @returns {string} PIN 密钥字符串
 */
export function generatePinSecret(length: number = 32): string {
  return toB64u(randomBytes(length));
}

/**
 * @function generatePasswordSecret
 * @description 生成密码加密密钥（base64url 编码）
 * @param {number} [length=32] - 随机字节长度
 * @returns {string} 密码密钥字符串
 */
export function generatePasswordSecret(length: number = 32): string {
  return toB64u(randomBytes(length));
}

/**
 * @function generateJwtSecret
 * @description 生成 JWT 签名密钥（base64url 编码）
 * @param {number} [length=32] - 随机字节长度
 * @returns {string} JWT 密钥字符串
 */
export function generateJwtSecret(length = 32): string {
  return toB64u(randomBytes(length));
}

/**
 * @function formatOutput
 * @description 格式化输出密钥字符串（支持 env 与 json）
 * @param {string} pin - PIN 密钥
 * @param {string} pwd - 密码密钥
 * @param {string} [jwt] - JWT 密钥（可选）
 * @param {SecretFormat} [format="env"] - 输出格式："env" 或 "json"
 * @returns {string} 按指定格式拼装后的输出文本
 */
export function formatOutput(
  pin: string,
  pwd: string,
  jwt?: string,
  format: SecretFormat = "env",
): string {
  if (format === "json") {
    const obj: Record<string, string> = {
      PIN_SECRET: pin,
      PASSWORD_SECRET: pwd,
    };
    if (jwt) obj.JWT_SECRET = jwt;
    return JSON.stringify(obj);
  }

  const lines = [`PIN_SECRET=${pin}`, `PASSWORD_SECRET=${pwd}`];
  if (jwt) lines.push(`JWT_SECRET=${jwt}`);
  return lines.join("\n");
}

/**
 * @constant isMain
 * @description 判断当前模块是否作为主入口执行
 */
const isMain: boolean = (() => {
  if (!process.argv[1]) return false;
  try {
    return fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
})();

/**
 * @description CLI 入口：从环境变量读取 LENGTH/FORMAT，输出密钥文本
 * LENGTH：随机字节长度（默认 32）
 * FORMAT："env" 或 "json"（默认 "env"）
 */
if (isMain) {
  const lenRaw = process.env.LENGTH ?? "32";
  const lenArg = Number(lenRaw);
  const target = Number.isFinite(lenArg) && lenArg > 0 ? Math.floor(lenArg) : 32;

  const modeRaw = (process.env.LENGTH_MODE ?? "encoded").toLowerCase();
  const bytesLen = modeRaw === "bytes" ? target : calcBytesForB64uLen(target);

  const pin = toB64u(randomBytes(bytesLen));
  const pwd = toB64u(randomBytes(bytesLen));
  const jwt = toB64u(randomBytes(bytesLen));

  const fmtRaw = (process.env.FORMAT ?? "env").toLowerCase();
  const fmt: SecretFormat = fmtRaw === "json" ? "json" : "env";

  // eslint-disable-next-line no-console
  console.log(formatOutput(pin, pwd, jwt, fmt));
}
