/**
 * @packageDocumentation
 * @module Routes/Index
 * @tag [主路由] [路由集成]
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 主路由文件：集成所有子路由模块
 * @path src/routes/index.ts
 */

import express from 'express';
import apiRoutes from './api';

const router = express.Router();

/**
 * @route /
 * @description API 路由 - 基于 data/api/*.json 配置自动生成
 * 
 * 包含:
 * - 自动认证中间件
 * - 自动角色验证
 * - 自动 CRUD 控制器绑定
 * 
 * 注意: API配置文件中的paths已经包含了完整路径(如 /api/users)，
 * 所以这里直接挂载到根路径，而不是 /api 路径
 */
router.use(apiRoutes);

export default router;
