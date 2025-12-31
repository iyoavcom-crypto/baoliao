/**
 * @packageDocumentation
 * @module crud:controller
 * @since 1.0.0 (2025-11-23)
 * @description
 * 标准 REST CRUD 控制器工厂，默认生成全部 CRUD 方法与全量数据方法。  
 * 支持：
 * - 分页列表：list
 * - 全量不分页：all
 * - 全量分页：listAllFields
 * - 详情：getById / getBySlug
 * - 树结构：tree
 * - 搜索：search
 * - 新增/更新/删除：create/update/remove
 */

import type { Router } from "express";
import type { CrudService, DetailResult, ListResult } from "@/services";
import { ok } from "./ok";
import { wrap } from "./wrap";
import { parseQueryOptions } from "./page";
import { parseListQueryOptions } from "./parseList";
import type { AsyncHandler, CrudHttpController } from "./types";

/**
 * @function createCrudController
 * @description 创建完整 CRUD 控制器，所有 REST 方法均固定提供。
 */
export function createCrudController<Entity>(
  service: CrudService<Entity>,
): CrudHttpController {

  /**
   * @function list
   * @description 分页查询（默认字段），适用于普通列表页
   */
  const list: AsyncHandler = wrap(async (req, res) => {
    const q = parseQueryOptions(req);
    ok(res, await service.list(q), "分页查询成功");
  });

  /**
   * @function all
   * @description
   * **全量不分页查询。**  
   * 返回所有数据，不做分页，不做 limit/offset。  
   * 适用于下拉框、筛选器、字典项、配置缓存等场景。
   */
  const all: AsyncHandler = wrap(async (req, res) => {
    const q = parseListQueryOptions(req);
    const result: ListResult<Entity> = await service.all(q);
    ok(res, result, "全量列表成功");
  });

  /**
   * @function listAllFields
   * @description
   * 全量分页（包含全部字段），适用于导出、复杂表格。  
   * 与 list 区别：字段更多，与分页结合使用。
   */
  const listAllFields: AsyncHandler = wrap(async (req, res) => {
    const q = parseQueryOptions(req);
    ok(res, await service.listAllFields(q), "全量分页成功");
  });

  /**
   * @function getById
   * @description 根据 ID 获取实体详情
   */
  const getById: AsyncHandler = wrap(async (req, res) => {
    ok(res, await service.getById(String(req.params.id)), "详情成功");
  });

  /**
   * @function getBySlug
   * @description 根据 slug 获取实体详情
   */
  const getBySlug: AsyncHandler = wrap(async (req, res) => {
    ok(res, await service.getBySlug(String(req.params.slug)), "详情成功");
  });

  /**
   * @function create
   * @description 创建实体
   */
  const create: AsyncHandler = wrap(async (req, res) => {
    ok(res, await service.create(req.body as Partial<Entity>), "创建成功", 201);
  });

  /**
   * @function update
   * @description 根据 ID 更新实体
   */
  const update: AsyncHandler = wrap(async (req, res) => {
    ok(res, await service.update(String(req.params.id), req.body as Partial<Entity>), "更新成功");
  });

  /**
   * @function remove
   * @description 根据 ID 删除实体
   */
  const remove: AsyncHandler = wrap(async (req, res) => {
    ok(res, await service.remove(String(req.params.id)), "删除成功");
  });

  /**
   * @function search
   * @description 关键字搜索 + 分页
   */
  const search: AsyncHandler = wrap(async (req, res) => {
    const {
      keyword = "",
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    ok(
      res,
      await service.search(keyword, Number(page) || 1, Number(limit) || 20),
      "搜索成功"
    );
  });

  /**
   * @function tree
   * @description 树形结构查询（父子层级）
   */
  const tree: AsyncHandler = wrap(async (req, res) => {
    ok(res, await service.tree(parseListQueryOptions(req)), "树查询成功");
  });

  return {
    list,
    all,
    listAllFields,
    getById,
    getBySlug,
    create,
    update,
    remove,
    search,
    tree,

    // 兼容旧命名
    getList: list,
    getDetail: getById,
    delete: remove,
    getDetailBySlug: getBySlug,
  };
}

/**
 * @function mountCrudRoutes
 * @description
 * 固定挂载所有 CRUD 路由，无任何可选配置。  
 * 
 * 路由结构：
 * - GET    /             → list（分页）
 * - GET    /all          → all（全量不分页）
 * - GET    /all-fields   → listAllFields（全量分页）
 * - GET    /all/paged    → listAllFields（全量分页别名）
 * - GET    /:id          → getById
 * - GET    /slug/:slug   → getBySlug
 * - GET    /search       → search
 * - GET    /tree         → tree
 * - POST   /             → create
 * - PUT    /:id          → update
 * - DELETE /:id          → remove
 *
 * @param {Router} router - Express Router 实例
 * @param {CrudHttpController} ctrl - CRUD 控制器集合
 * @returns {Router} router
 */
export function mountCrudRoutes(
  router: Router,
  ctrl: CrudHttpController,
): Router {

  router.get("/", ctrl.list);

  // ⭐ 全量不分页
  router.get("/all", ctrl.all);

  // ⭐ 全量分页（两个路径）
  router.get("/all-fields", ctrl.listAllFields);
  router.get("/all/paged", ctrl.listAllFields);

  router.get("/:id", ctrl.getById);
  router.get("/slug/:slug", ctrl.getBySlug);

  router.get("/search", ctrl.search);
  router.get("/tree", ctrl.tree);

  router.post("/", ctrl.create);
  router.put("/:id", ctrl.update);
  router.delete("/:id", ctrl.remove);

  return router;
}
