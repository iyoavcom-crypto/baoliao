/**
 * @packageDocumentation
 * @module routes
 * @since 1.0.0 (2025-11-22)
 * @description 汇总并导出所有业务路由
 */

import { Router } from "express";
export { JsonStore } from "./jsonStore";

/**
 * @constant routes
 * @description 汇总全部业务路由的 Router
 */
export const routes = Router();
