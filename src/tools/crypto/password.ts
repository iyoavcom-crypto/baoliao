// src/crypto/password.ts
/**
 * @packageDocumentation
 * @module crypto-password
 * @since 1.3.2 (2025-10-19)
 * @author Z-kali
 * @description 提供口令的 scrypt 单向哈希与校验（仅导出 hashPassword/verifyPassword）
 */

import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cryptoEnv } from "./crypto-env";

/** @constant SCRYPT @description scrypt 参数（冻结） */
const SCRYPT = Object.freeze({ N: 32768, r: 8, p: 1, keylen: 32, maxmem: 64 * 1024 * 1024 });

/** @internal scrypt Promise 化 */
const scryptAsync = promisify(_scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  opt: Readonly<{ N: number; r: number; p: number; maxmem?: number }>
) => Promise<Buffer>;

/** @internal base64url 工具 */
const b64u = (buf: Buffer) => buf.toString("base64url");
const ub64u = (s: string) => Buffer.from(s, "base64url");
const constEq = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

/** @internal 获取 pepper（允许校验时为空；新哈希要求有效 pepper） */
const getPepper = (): string => cryptoEnv.PASSWORD_PEPPER ?? "";

/**
 * @function hashPassword
 * @description 生成 scrypt 哈希：`scrypt$N$r$p$salt$dk`
 * @param {string} password - 明文口令
 * @returns {Promise<string>} 哈希串
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) throw new Error("密码不能为空");
  const pepper = getPepper();
  if (pepper.length < 16) throw new Error("缺少或过短的 PASSWORD_PEPPER（至少16位）");
  const salt = randomBytes(16);
  const dk = await scryptAsync(password + pepper, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${b64u(salt)}$${b64u(dk)}`;
}

/**
 * @function verifyPassword
 * @description 校验明文是否匹配 scrypt 哈希
 * @param {string} password - 明文
 * @param {string} stored - `scrypt$N$r$p$salt$dk`
 * @returns {Promise<boolean>} 是否匹配
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const N = Number(parts[1]), r = Number(parts[2]), p = Number(parts[3]);
    if (![N, r, p].every(Number.isSafeInteger)) return false;
    const salt = ub64u(parts[4]!);
    const hash = ub64u(parts[5]!);
    const pepper = getPepper();
    const dkPepper = pepper.length >= 16 ? await scryptAsync(password + pepper, salt, hash.length, { N, r, p, maxmem: 64 * 1024 * 1024 }) : null;
    const dkNoPepper = await scryptAsync(password, salt, hash.length, { N, r, p, maxmem: 64 * 1024 * 1024 });
    return (dkPepper && constEq(dkPepper, hash)) || constEq(dkNoPepper, hash);
  } catch {
    return false;
  }
}

/**
 * @function verifyPasswordUpgrade
 * @description 校验并判断是否需要升级（pepper 或成本参数），如需要则给出新哈希
 * @returns {Promise<{ ok: boolean; needsRehash: boolean; newHash?: string }>} 校验结果与升级建议
 */
export async function verifyPasswordUpgrade(
  password: string,
  stored: string
): Promise<{ ok: boolean; needsRehash: boolean; newHash?: string }> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return { ok: false, needsRehash: false };
    const N = Number(parts[1]), r = Number(parts[2]), p = Number(parts[3]);
    if (![N, r, p].every(Number.isSafeInteger)) return { ok: false, needsRehash: false };
    const salt = ub64u(parts[4]!);
    const hash = ub64u(parts[5]!);
    const pepper = getPepper();

    const dkPepper = pepper.length >= 16 ? await scryptAsync(password + pepper, salt, hash.length, { N, r, p, maxmem: 64 * 1024 * 1024 }) : null;
    const dkNoPepper = await scryptAsync(password, salt, hash.length, { N, r, p, maxmem: 64 * 1024 * 1024 });

    const okPepper = dkPepper ? constEq(dkPepper, hash) : false;
    const okNoPepper = constEq(dkNoPepper, hash);
    const ok = okPepper || okNoPepper;

    // 是否需要升级：1) 当前参数低于基线；2) 存储未使用 pepper（且当前存在有效 pepper）
    const needsCostUpgrade = ok && (N < SCRYPT.N || r < SCRYPT.r || p < SCRYPT.p || hash.length !== SCRYPT.keylen);
    const needsPepperUpgrade = okNoPepper && pepper.length >= 16 && !okPepper;
    const needsRehash = needsCostUpgrade || needsPepperUpgrade;

    if (needsRehash) {
      const newHash = await hashPassword(password);
      return { ok, needsRehash: true, newHash };
    }
    return { ok, needsRehash: false };
  } catch {
    return { ok: false, needsRehash: false };
  }
}
