/**
 * @packageDocumentation
 * @module crypto-pin
 * @since 1.3.3 (2025-11-09)
 * @author Z-kali
 * @description 提供基于 AES-256-GCM 的 PIN 加解密工具（使用 secret 派生密钥）。
 * @see packages/src/tools/crypto/aesgcm.ts
 */

import { createHash } from "node:crypto";
import type { AesGcmPayload, SymmetricKey } from "./aesgcm";
import { encrypt as aesGcmEncrypt, decrypt as aesGcmDecrypt } from "./aesgcm";

/**
 * @function deriveKeyFromSecret
 * @description 从字符串 secret 派生 32 字节对称密钥（SHA-256）
 * @param {string} secret - 密钥字符串（长度需 ≥16）
 * @param {string} [kid="env:PIN_SECRET"] - 密钥ID（便于追踪来源）
 * @returns {SymmetricKey} 对称密钥实体
 * @throws {Error} 当 secret 为空或长度不足
 */
export function deriveKeyFromSecret(secret: string, kid: string = "env:PIN_SECRET"): SymmetricKey {
  const s = (secret ?? "").trim();
  if (s.length < 16) throw new Error("PIN secret 长度不足（≥16）");
  const key = createHash("sha256").update(s).digest();
  return { kid, key };
}

/**
 * @function encryptPin
 * @description 使用 AES-256-GCM 加密 PIN，返回序列化载荷字符串（JSON）
 * @param {string} pin - 明文 PIN
 * @param {string} secret - 密钥字符串（长度需 ≥16）
 * @returns {Promise<string>} 加密载荷字符串（JSON）
 * @example
 * const s = await encryptPin("123456", process.env.PIN_SECRET!);
 */
export async function encryptPin(pin: string, secret: string): Promise<string> {
  const key = deriveKeyFromSecret(secret);
  const payload: AesGcmPayload = aesGcmEncrypt(Buffer.from(pin, "utf8"), key);
  return JSON.stringify(payload);
}

/**
 * @function decryptPin
 * @description 使用 AES-256-GCM 解密 PIN（从序列化载荷字符串还原明文）
 * @param {string} payloadJson - 加密载荷字符串（JSON）
 * @param {string} secret - 密钥字符串（长度需 ≥16）
 * @returns {Promise<string>} 明文 PIN
 * @example
 * const plain = await decryptPin(cipherText, process.env.PIN_SECRET!);
 */
export async function decryptPin(payloadJson: string, secret: string): Promise<string> {
  const key = deriveKeyFromSecret(secret);
  const payload = JSON.parse(payloadJson) as AesGcmPayload;
  const buf = aesGcmDecrypt(payload, key);
  return buf.toString("utf8");
}