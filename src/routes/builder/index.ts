/**
 * @packageDocumentation
 * @module routes/builder
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 基于 API 元数据自动构建路由系统
 */

import { Router, type RequestHandler, type Request, type Response } from "express";
import type { API } from "@/types/api";
import { modelRegistry } from "@/models";
import { createCrudController } from "@/middleware/requests/crud";
import { createCrudService } from "@/services/crud-adapter";
import { requireAuth } from "@/middleware/auth/auth";
import type { Model, ModelStatic } from "sequelize";

// 存储已注册的路由信息供查询使用
let registeredRoutesCache: any[] | null = null;

/**
 * @interface RouteBuilderOptions
 * @description 路由构建器配置选项
 */
export interface RouteBuilderOptions {
  /** 是否启用自动认证中间件 */
  autoAuth?: boolean;
  /** 是否启用自动角色验证 */
  autoRoleCheck?: boolean;
  /** 自定义路由处理器映射 */
  customHandlers?: Map<string, RequestHandler>;
}

/**
 * @function buildRoutesFromApis
 * @description 根据 API 元数据数组自动构建 Express 路由
 * @param {API[]} apis - API 元数据数组
 * @param {RouteBuilderOptions} [options] - 构建选项
 * @returns {Router} 配置好的 Express Router
 * 
 * @example
 * ```typescript
 * import { allApis } from '@/config/catalog';
 * import { buildRoutesFromApis } from '@/routes/builder';
 * 
 * const apiRouter = buildRoutesFromApis(allApis, {
 *   autoAuth: true,
 *   autoRoleCheck: true
 * });
 * 
 * app.use('/api', apiRouter);
 * ```
 */
export function buildRoutesFromApis(
  apis: API[],
  options: RouteBuilderOptions = {}
): Router {
  const router = Router();
  const { autoAuth = true, autoRoleCheck = false, customHandlers } = options;

  console.log(`[RouteBuilder] Building routes for ${apis.length} APIs`);

  // 按模型分组 API
  const apisByModel = groupApisByModel(apis);

  console.log(`[RouteBuilder] Grouped into ${apisByModel.size} models:`, Array.from(apisByModel.keys()));

  // 为每个模型创建路由
  for (const [modelName, modelApis] of apisByModel.entries()) {
    const model = modelRegistry[modelName];
    
    if (!model) {
      console.warn(`[RouteBuilder] Model "${modelName}" not found in registry, skipping APIs:`, 
        modelApis.map(a => a.id));
      continue;
    }

    console.log(`[RouteBuilder] Registering ${modelApis.length} routes for model "${modelName}"`);

    // 为该模型的每个 API 创建路由
    for (const api of modelApis) {
      registerApi(router, api, model, { autoAuth, autoRoleCheck, customHandlers });
    }
  }

  console.log(`[RouteBuilder] Route building completed`);

  return router;
}

/**
 * @function groupApisByModel
 * @description 将 API 按主要模型分组
 * @param {API[]} apis - API 数组
 * @returns {Map<string, API[]>} 模型到 API 列表的映射
 */
function groupApisByModel(apis: API[]): Map<string, API[]> {
  const groups = new Map<string, API[]>();

  for (const api of apis) {
    // 使用第一个模型作为主模型
    const primaryModel = api.models[0];
    if (!primaryModel) continue;

    const list = groups.get(primaryModel) || [];
    list.push(api);
    groups.set(primaryModel, list);
  }

  return groups;
}

/**
 * @function registerApi
 * @description 注册单个 API 到路由器
 * @param {Router} router - Express 路由器
 * @param {API} api - API 元数据
 * @param {ModelStatic<Model>} model - Sequelize 模型
 * @param {RouteBuilderOptions} options - 构建选项
 */
function registerApi(
  router: Router,
  api: API,
  model: ModelStatic<Model>,
  options: RouteBuilderOptions
): void {
  const { autoAuth, autoRoleCheck, customHandlers } = options;

  // 检查是否有自定义处理器
  const customHandler = customHandlers?.get(api.id);
  
  if (customHandler) {
    // 使用自定义处理器
    registerWithCustomHandler(router, api, customHandler, { autoAuth, autoRoleCheck });
    return;
  }

  // 使用通用 CRUD 控制器
  registerWithCrudController(router, api, model, { autoAuth, autoRoleCheck });
}

/**
 * @function registerWithCustomHandler
 * @description 使用自定义处理器注册路由
 */
function registerWithCustomHandler(
  router: Router,
  api: API,
  handler: RequestHandler,
  options: { autoAuth?: boolean; autoRoleCheck?: boolean }
): void {
  const middlewares = buildMiddlewares(api, options);

  for (const path of api.paths) {
    switch (api.method.toUpperCase()) {
      case 'GET':
        router.get(path, ...middlewares, handler);
        break;
      case 'POST':
        router.post(path, ...middlewares, handler);
        break;
      case 'PUT':
        router.put(path, ...middlewares, handler);
        break;
      case 'DELETE':
        router.delete(path, ...middlewares, handler);
        break;
      case 'PATCH':
        router.patch(path, ...middlewares, handler);
        break;
      default:
        console.warn(`[RouteBuilder] Unsupported method "${api.method}" for API ${api.id}`);
    }
  }
}

/**
 * @function registerWithCrudController
 * @description 使用 CRUD 控制器注册路由
 */
function registerWithCrudController(
  router: Router,
  api: API,
  model: ModelStatic<Model>,
  options: { autoAuth?: boolean; autoRoleCheck?: boolean }
): void {
  // 将 Model 包装为 Service
  const service = createCrudService(model);
  const controller = createCrudController(service);
  const middlewares = buildMiddlewares(api, options);

  // 根据操作类型选择对应的控制器方法
  const handler = selectCrudHandler(controller, api);

  if (!handler) {
    console.warn(`[RouteBuilder] Cannot determine CRUD handler for API ${api.id}`);
    return;
  }

  for (const path of api.paths) {
    console.log(`[RouteBuilder] Registering route: ${api.method} ${path} -> ${api.id}`);
    
    switch (api.method.toUpperCase()) {
      case 'GET':
        router.get(path, ...middlewares, handler);
        break;
      case 'POST':
        router.post(path, ...middlewares, handler);
        break;
      case 'PUT':
        router.put(path, ...middlewares, handler);
        break;
      case 'DELETE':
        router.delete(path, ...middlewares, handler);
        break;
      case 'PATCH':
        router.patch(path, ...middlewares, handler);
        break;
    }
  }
}

/**
 * @function buildMiddlewares
 * @description 根据 API 配置构建中间件数组
 */
function buildMiddlewares(
  api: API,
  options: { autoAuth?: boolean; autoRoleCheck?: boolean }
): RequestHandler[] {
  const middlewares: RequestHandler[] = [];

  // 认证中间件
  if (options.autoAuth && api.authRequired) {
    middlewares.push(requireAuth);
  }

  // 角色检查中间件
  if (options.autoRoleCheck && api.roles && api.roles.length > 0) {
    middlewares.push(createRoleCheckMiddleware(api.roles));
  }

  return middlewares;
}

/**
 * @function createRoleCheckMiddleware
 * @description 创建角色检查中间件
 */
function createRoleCheckMiddleware(allowedRoles: string[]): RequestHandler {
  return (req: Request, res: Response, next) => {
    const user = (req as any).user;
    const userRole = user?.roleId;  // 使用 roleId 而不是 role
    
    if (!userRole) {
      res.status(403).json({ 
        code: "FORBIDDEN", 
        message: "用户角色未定义" 
      });
      return;
    }

    if (!allowedRoles.includes(userRole.toLowerCase())) {
      res.status(403).json({ 
        code: "FORBIDDEN", 
        message: `需要以下角色之一: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
}

/**
 * @function selectCrudHandler
 * @description 根据 API 的操作类型选择对应的 CRUD 处理器
 */
function selectCrudHandler(controller: any, api: API): RequestHandler | null {
  const { method, operateEnum, paths } = api;
  const path = paths[0] || '';

  // 根据 HTTP 方法和路径模式判断操作类型
  if (method === 'GET') {
    if (path.includes('/:id') || path.includes('/:slug')) {
      return controller.getById;
    }
    if (path.includes('/search')) {
      return controller.search;
    }
    if (path.includes('/tree')) {
      return controller.tree;
    }
    if (path.includes('/all')) {
      return controller.all;
    }
    return controller.list; // 默认列表查询
  }

  if (method === 'POST') {
    return controller.create;
  }

  if (method === 'PUT' || method === 'PATCH') {
    return controller.update;
  }

  if (method === 'DELETE') {
    return controller.remove;
  }

  return null;
}

/**
 * @function buildModelRoutes
 * @description 为单个模型构建所有相关路由
 * @param {string} modelName - 模型名称
 * @param {API[]} apis - 该模型的所有 API
 * @param {RouteBuilderOptions} [options] - 构建选项
 * @returns {Router} 该模型的路由器
 */
export function buildModelRoutes(
  modelName: string,
  apis: API[],
  options: RouteBuilderOptions = {}
): Router {
  const router = Router();
  const model = modelRegistry[modelName];

  if (!model) {
    console.error(`[RouteBuilder] Model "${modelName}" not found`);
    return router;
  }

  for (const api of apis) {
    registerApi(router, api, model, options);
  }

  return router;
}

/**
 * @interface RouteInfo
 * @description 路由信息结构
 */
export interface RouteInfo {
  id: string;
  method: string;
  path: string;
  authRequired: boolean;
  roles: string[];
  description?: string;
  modelName?: string;
  hasCustomHandler: boolean;
}

/**
 * @function getRegisteredRoutes
 * @description 获取所有已注册的路由信息
 * @param {API[]} apis - API元数据数组
 * @param {Map<string, RequestHandler>} [customHandlers] - 自定义处理器映射
 * @returns {RouteInfo[]} 路由信息列表
 */
export function getRegisteredRoutes(
  apis: API[],
  customHandlers?: Map<string, RequestHandler>
): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const apisByModel = groupApisByModel(apis);

  for (const [modelName, modelApis] of apisByModel.entries()) {
    const model = modelRegistry[modelName];
    
    for (const api of modelApis) {
      const hasCustomHandler = customHandlers?.has(api.id) || false;
      const hasModel = !!model;
      
      // 只包含有Model或有自定义处理器的API
      if (hasModel || hasCustomHandler) {
        for (const path of api.paths) {
          routes.push({
            id: api.id,
            method: api.method,
            path,
            authRequired: api.authRequired ?? false,
            roles: api.roles || [],
            description: api.description,
            modelName: hasModel ? modelName : undefined,
            hasCustomHandler,
          });
        }
      }
    }
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path));
}
