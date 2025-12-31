/**
 * @packageDocumentation
 * @module middleware-auth
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 认证与授权中间件集合：基础认证、守卫、登录与注册、统一令牌签发
 */

export { requireAuth, requireAccess } from "./auth/require";
export { requireRole, requireScopes, requireVip, requireTeam, requireDevice, requireUserId } from "./auth/guards/index";
export { createLoginMiddleware } from "./auth/login";
export { createRegisterMiddleware } from "./auth/register";
export { issueTokens } from "./auth/tokens"; 
export type { AuthRequest } from "./auth/require";
export type { UserLike } from "./auth/tokens";


 
