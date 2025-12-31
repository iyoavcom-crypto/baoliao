/**
 * @packageDocumentation
 * @module api-routes
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description API 路由入口 - 基于 API 配置自动生成路由
 */

import { buildRoutesFromApis, getRegisteredRoutes, type RouteInfo } from "../builder";
import { allApis } from "@/config/catalog";
import { createLoginMiddleware } from "@/middleware/auth/login";
import { createRegisterMiddleware } from "@/middleware/auth/register";
import { addFriend, acceptFriend } from "@/controllers/friend";

// 导出工具函数和类型
export { buildCrudPipeline } from "./pipeline";
export { resolveAuthMiddleware } from "./auth";
export { toContext } from "./context";
export type { RequestContext as ApiRouterContext } from "./context";

// 导出完整的 API 类型定义
export type { API, APICollectionConfig, HttpMethod, OperateEnum, CacheConfig, FieldSelectConfig } from "@/types/api";

export { JsonStore } from "./json/jsonStore";

/**
 * @constant customHandlers
 * @description 自定义路由处理器映射（覆盖默认CRUD控制器）
 */
const customHandlers = new Map();
customHandlers.set("auth.login", createLoginMiddleware());
customHandlers.set("auth.register", createRegisterMiddleware());
customHandlers.set("friend.add", addFriend);
customHandlers.set("friend.accept", acceptFriend);

/**
 * @constant routes
 * @description 自动生成的 API 路由
 * 
 * 基于 data/api/*.json 配置自动生成所有路由，包括:
 * - 自动认证检查
 * - 自动角色验证
 * - 自动绑定 CRUD 控制器
 * - 为特定路由使用自定义处理器（如 auth.login, auth.register）
 */
export const routes = buildRoutesFromApis(allApis, {
  autoAuth: true,        // 启用自动认证
  autoRoleCheck: true,   // 启用自动角色检查
  customHandlers,        // 自定义处理器映射
});

/**
 * @function getAllRoutes
 * @description 获取所有已注册的路由信息列表
 * @returns {RouteInfo[]} 路由信息数组
 */
export function getAllRoutes(): RouteInfo[] {
  return getRegisteredRoutes(allApis, customHandlers);
}

export default routes;
