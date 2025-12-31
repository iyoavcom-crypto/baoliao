/**
 * @packageDocumentation
 * @module middleware/auth/guards/device
 * @since 1.0.0 (2025-11-20)
 * @author Z-kali
 * @description 设备守卫：从请求头读取设备ID并进行设备绑定校验
 */

import type { Request, Response, NextFunction } from "express";
import { Guards, AuthError, AuthErrorCode } from "@/tools/jwt";
import type { AuthRequest } from "../require.js";

/**
 * @function requireDevice
 * @description 创建设备绑定守卫中间件
 * @param {boolean} [enabled=process.env.JWT_ENABLE_DEVICE_BINDING==="true"] - 是否启用设备绑定
 * @returns {(req:Request,res:Response,next:NextFunction)=>void} 设备守卫中间件
 */
export function requireDevice(enabled: boolean = process.env.JWT_ENABLE_DEVICE_BINDING === "true"): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const p = (req as AuthRequest).user;
      const deviceId = String((req.headers["x-device-id"] ?? "")).trim();
      Guards.assertDevice(p, deviceId, enabled);
      next();
    } catch (e: unknown) {
      if (e instanceof AuthError) {
        res.status(e.status).json({ code: e.code, message: e.message, status: e.status });
      } else {
        res.status(403).json({ code: AuthErrorCode.Forbidden, message: "Forbidden", status: 403 });
      }
    }
  };
}
