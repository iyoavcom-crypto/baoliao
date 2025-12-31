/**
 * @packageDocumentation
 * @module controllers/health
 * @tag [健康检查] [控制器] [系统状态]
 * @since 1.1.0 (2025-11-25)
 * @author
 *  Z-kali
 * @description
 *  健康检查控制器：提供 liveness / readiness / system 信息接口
 * @path src/controllers/health.ts
 * @see src/services/health.ts
 * @see src/middleware/error.ts
 */

import type { Request, Response } from "express";
import { ok, fail } from "../crud";

// TODO: 实现健康检查服务
const HealthService = {
  getLivenessStatus: () => ({ data: { status: 'alive' } }),
  checkHealth: async () => ({ status: 'healthy', data: {} }),
  getSystemInfo: () => ({ uptime: process.uptime(), memory: process.memoryUsage() }),
  getModelSchemas: () => ({}),
  getModelNames: () => [],
  getModelDetail: (name: string) => null,
  listRoutes: (app: any) => [],
};

/**
 * @interface HealthController
 * @description 健康检查控制器接口
 */
interface HealthController {
  /**
   * @function checkLiveness
   * @description GET /api/health/liveness - 进程存活检查
   */
  checkLiveness: (req: Request, res: Response) => Promise<void>;

  /**
   * @function checkReadiness
   * @description GET /api/health/readiness - 依赖就绪检查（数据库等）
   */
  checkReadiness: (req: Request, res: Response) => Promise<void>;

  /**
   * @function getSystemInfo
   * @description GET /api/health/system - 系统信息查询
   */
  getSystemInfo: (req: Request, res: Response) => void;

  getModels: (req: Request, res: Response) => void;
  getModelNames: (req: Request, res: Response) => void;
  getModelDetail: (req: Request, res: Response) => void;

  checkHealth: (req: Request, res: Response) => Promise<void>;

  getRoutes: (req: Request, res: Response) => void;
}

/**
 * @constant HealthController
 * @description 健康检查控制器实例
 */
const HealthController: HealthController = {
  /**
   * @function checkLiveness
   * @description GET /api/health/liveness - 进程存活检查（不阻塞、不访问数据库）
   * @param {Request} _req - 请求对象（未使用）
   * @param {Response} res - 响应对象
   * @returns {Promise<void>} 无返回，直接写入响应
   */
  checkLiveness: async (_req: Request, res: Response): Promise<void> => {
    const status = HealthService.getLivenessStatus();
    // 存活检查：只要进程在运行，即视为 healthy，返回 200
    ok(res, status.data, "服务存活正常");
  },

  /**
   * @function checkReadiness
   * @description GET /api/health/readiness - 依赖就绪检查（数据库等）
   * @param {Request} _req - 请求对象（未使用）
   * @param {Response} res - 响应对象
   * @returns {Promise<void>} 无返回，直接写入响应
   */
  checkReadiness: async (_req: Request, res: Response): Promise<void> => {
    const result = await HealthService.checkHealth();

    if (result.status === "healthy") {
      // 依赖全部正常，返回 200
      ok(res, result.data, "健康检查成功");
      return;
    }

    // 依赖异常，返回 503，用于负载均衡摘流 / 警报
    res.status(503).json({
      code: "SERVICE_UNAVAILABLE",
      message: "服务不健康",
      ...result,
    });
  },

  /**
   * @function getSystemInfo
   * @description GET /api/health/system - 系统信息（适合内部监控）
   * @param {Request} _req - 请求对象（未使用）
   * @param {Response} res - 响应对象
   * @returns {void} 无返回，直接写入响应
   */
  getSystemInfo: (_req: Request, res: Response): void => {
    const system = HealthService.getSystemInfo();
    ok(res, system, "系统信息获取成功");
  },

  getModels: (_req: Request, res: Response): void => {
    const schemas = HealthService.getModelSchemas();
    ok(res, schemas, "模型字段列表");
  },

  getModelNames: (_req: Request, res: Response): void => {
    const names = HealthService.getModelNames();
    ok(res, names, "模型名称列表");
  },

  getModelDetail: (req: Request, res: Response): void => {
    const { name } = req.params;
    const detail = HealthService.getModelDetail(name);
    if (!detail) {
      const err = new Error("模型不存在");
      (err as any).status = 404;
      fail(res, err);
      return;
    }
    ok(res, detail, "模型详情");
  },

  checkHealth: async (_req: Request, res: Response): Promise<void> => {
    const result = await HealthService.checkHealth();
    if (result.status === "healthy") {
      ok(res, result.data, "健康检查成功");
      return;
    }
    res.status(503).json({
      code: "SERVICE_UNAVAILABLE",
      message: "服务不健康",
      ...result,
    });
  },

  getRoutes: (req: Request, res: Response): void => {
    const routes = HealthService.listRoutes(req.app);
    ok(res, routes, "路由列表");
  },
};

export default HealthController;
