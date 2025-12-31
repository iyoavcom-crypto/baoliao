/**
 * @packageDocumentation
 * @module routes/api/auth
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 认证路由与认证中间件解析器
 */

import { Router, type RequestHandler } from "express";
import { createLoginMiddleware } from "@/middleware/auth/login";
import { createRegisterMiddleware } from "@/middleware/auth/register";
import { requireAuth } from "@/middleware/auth/auth";
import type { API } from "@/types/api";

const router = Router();

// 登录接口
router.post("/login", createLoginMiddleware());

// 注册接口  
router.post("/register", createRegisterMiddleware());

export default router;

/**
 * @function resolveAuthMiddleware
 * @description 根据 API 配置解析认证中间件
 * @param {API} api - API 配置对象
 * @returns {RequestHandler} Express 中间件处理器
 * 
 * @example
 * ```typescript
 * const api = { 
 *   id: 'user-detail',
 *   method: 'GET', 
 *   paths: ['/users/:id'], 
 *   models: ['User'], 
 *   authRequired: true 
 * };
 * const authMiddleware = resolveAuthMiddleware(api);
 * router.get('/users/:id', authMiddleware, userController);
 * ```
 */
export function resolveAuthMiddleware(api: API): RequestHandler {
  // 如果 API 配置中明确要求认证
  if (api.authRequired) {
    return requireAuth;
  }
  
  // 默认不需要认证,返回空中间件
  return (req, res, next) => next();
}
