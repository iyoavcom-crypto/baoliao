/**
 * @packageDocumentation
 * @module controllers/crud/crud-controller
 * @tag [CRUD控制器] [HTTP接口] [通用控制器]
 * @since 1.0.0 (2025-01-15)
 * @author Z-kali
 * @description 通用 CRUD 控制器实现，基于通用 CRUD 服务封装 HTTP 响应与错误处理
 * @path src/controllers/crud/crud-controller.ts
 * @see src/services/crud/crud.ts
 * @see src/services/crud/types.ts
 * @see src/services/crud/validation.ts
 */

export type {
  ApiSuccessResponse,
  ApiErrorDetail,
  ApiErrorResponse,
  AsyncHandler,
  CrudHttpController,
} from "./types";
export { ok } from "./ok";
export { fail } from "./fail";
export { wrap } from "./wrap";
export { parseQueryOptions } from "./page";
export { parseListQueryOptions } from "./parseList";
export { createCrudController, mountCrudRoutes } from "./create";
