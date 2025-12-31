/**
 * @packageDocumentation
 * @module routes/api/pipeline
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description CRUD 管道构建器 - 基于通用 CRUD 控制器
 */

import type { Model, ModelStatic } from "sequelize";
import { createCrudController } from "@/middleware/requests/crud";

/**
 * @function buildCrudPipeline
 * @description 为指定模型构建完整的 CRUD 管道
 * @param {ModelStatic<Model>} model - Sequelize 模型
 * @returns {Object} CRUD 控制器对象
 * 
 * @example
 * ```typescript
 * import { User } from '@/models';
 * const userCrud = buildCrudPipeline(User);
 * 
 * router.get('/users', userCrud.list);
 * router.get('/users/:id', userCrud.getById);
 * router.post('/users', userCrud.create);
 * router.put('/users/:id', userCrud.update);
 * router.delete('/users/:id', userCrud.delete);
 * ```
 */
export function buildCrudPipeline(model: ModelStatic<Model>) {
  return createCrudController(model);
}

/**
 * @function buildCrudRoutes
 * @description 为指定模型构建并返回 CRUD 路由处理器数组
 * @param {ModelStatic<Model>} model - Sequelize 模型
 * @returns {Object} 包含所有 CRUD 操作的对象
 */
export function buildCrudRoutes(model: ModelStatic<Model>) {
  const controller = createCrudController(model);
  
  return {
    // 标准 CRUD 操作
    list: controller.list,           // GET / - 分页列表
    all: controller.all,             // GET /all - 全量列表
    getById: controller.getById,     // GET /:id - 详情
    create: controller.create,       // POST / - 创建
    update: controller.update,       // PUT /:id - 更新
    delete: controller.delete,       // DELETE /:id - 删除
    
    // 扩展操作
    search: controller.search,       // GET /search - 搜索
    tree: controller.tree,           // GET /tree - 树形查询
    getBySlug: controller.getBySlug, // GET /slug/:slug - 根据 slug 查询
  };
}
