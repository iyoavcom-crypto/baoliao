/**
 * @packageDocumentation
 * @module models/admin/user/hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description User 模型钩子函数
 */

import { hashPassword as hashPasswordScrypt } from "@/tools/crypto/password";
import { encryptPin as encryptPinGcm } from "@/tools/crypto/pin";
import type { User } from "./index.js";

/**
 * @function getPinSecret
 * @description 获取 PIN 加密密钥（长度需 ≥16），若未配置则返回 null
 * @returns {string|null} 合法密钥或 null
 */
function getPinSecret(): string | null {
  const v = process.env.PIN_SECRET;
  if (typeof v !== "string") return null;
  return v.length >= 16 ? v : null;
}

/**
 * @function setupUserHooks
 * @description 设置 User 模型的钩子函数
 * @param {typeof User} UserModel - User 模型类
 */
export function setupUserHooks(UserModel: typeof User): void {
  UserModel.beforeSave(async (user) => {
    if (user.changed("password")) {
      const val = user.get("password") as string | null;
      if (val && !val.startsWith("scrypt$")) {
        user.set("password", await hashPasswordAsync(val));
      }
    }
    if (user.changed("pin")) {
      const p = user.get("pin") as string | null;
      if (p) {
        const secret = getPinSecret();
        if (!secret) {
          throw new Error("PIN_SECRET 未配置或长度不足（≥16）");
        }
        user.set("pin", await encryptPinAsync(p, secret));
      }
    }
  });
}

async function hashPasswordAsync(val: string): Promise<string> {
  return hashPasswordScrypt(val);
}

async function encryptPinAsync(p: string, secret: string): Promise<string> {
  return encryptPinGcm(p, secret);
}
