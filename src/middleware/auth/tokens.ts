/**
 * @packageDocumentation
 * @module middleware/auth/tokens
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 令牌签发助手：根据用户信息统一签发 access 与 refresh 并返回载荷
 */

import { createJwtServiceFromEnv } from "@/tools/jwt";
import type { JwtService, JwtUserPayload } from "@/tools/jwt";
import { User } from "@/models";

/**
 * @type UserLike
 * @description 令牌签发所需的用户关键字段
 * @property {string} id - 用户ID
 * @property {string} roleId - 角色ID
 * @property {string|null} [code] - 业务编码
 * @property {string|null} [teamId] - 团队ID
 * @property {string[]} [scope] - 作用域集合
 * @property {boolean} vip - 是否为 VIP 用户
 */
export type UserLike = {
  id: string;
  name?: string | null;
  avatar?: string | null;
  roleId: string;
  code?: string | null;
  teamId?: string | null;
  scope?: string[];
  vip: boolean;
};

/**
 * @function toUserLike
 * @description 将模型实例转换为签发所需的用户结构
 * @param {User} u - 用户模型实例
 * @returns {UserLike} 用户关键字段
 */
export const toUserLike = (u: User): UserLike => ({
  id: u.id,
  name: u.name,
  avatar: u.avatar,
  roleId: u.roleId,
  vip: Boolean(u.vip),
});

/**
 * @function toPayloadBase
 * @description 构造不含 `tokenType` 的载荷基础字段
 * @param {UserLike} u - 用户关键字段
 * @param {string} [deviceId] - 设备ID（可选）
 * @returns {Omit<JwtUserPayload,"tokenType">} 载荷基础对象
 */
const toPayloadBase = (u: UserLike, deviceId?: string): Omit<JwtUserPayload, "tokenType"> => ({
  sub: u.id,
  name: u.name,
  avatar: u.avatar,
  roleId: u.roleId,
  vip: u.vip,
  ...(u.code !== undefined ? { code: u.code } : {}),
  ...(u.teamId !== undefined ? { teamId: u.teamId } : {}),
  ...(u.scope !== undefined ? { scope: u.scope } : {}),
  ...(deviceId ? { deviceId } : {}),
});

/**
 * @function issueTokens
 * @description 统一签发 access 与 refresh 令牌并返回载荷（不包含 tokenType）
 * @param {User|UserLike} user - 用户对象或关键字段对象
 * @param {string} [deviceId] - 设备ID（可选）
 * @param {JwtService} [jwt] - 可选外部 JwtService 实例
 * @returns {Promise<{access:string;refresh:string;payload:Omit<JwtUserPayload,"tokenType">}>} 新令牌与载荷
 * @example
 * const { access, refresh } = await issueTokens(user, deviceId);
 */
export async function issueTokens(user: User | UserLike, deviceId?: string, jwt?: JwtService): Promise<{ access: string; refresh: string; payload: Omit<JwtUserPayload, "tokenType"> }> {
  const svc = jwt ?? createJwtServiceFromEnv();
  const u = (user instanceof User) ? toUserLike(user) : user;
  console.log("DEBUG: issueTokens u:", u);
  const base = toPayloadBase(u, deviceId);
  const accessPayload: JwtUserPayload = { ...base, tokenType: "access" };
  const refreshPayload: JwtUserPayload = { ...base, tokenType: "refresh" };
  const access = await svc.signAsync("access", accessPayload);
  const refresh = await svc.signAsync("refresh", refreshPayload);
  return { access, refresh, payload: base };
}
