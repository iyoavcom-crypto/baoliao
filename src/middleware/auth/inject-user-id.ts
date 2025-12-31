/**
 * @packageDocumentation
 * @module middleware/auth/inject-user-id
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 自动注入当前认证用户ID到请求体
 */

import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "./require";

/**
 * @function injectUserId
 * @description 将认证用户的ID注入到 req.body.userId
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件
 * @example
 * router.post('/friends', requireAuth, injectUserId, controller.create);
 */
export function injectUserId(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthRequest;
  
  if (!authReq.user || !authReq.user.sub) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
      status: 401
    });
    return;
  }

  // 注入用户ID到请求体
  if (!req.body) {
    req.body = {};
  }
  
  req.body.userId = authReq.user.sub;
  next();
}

/**
 * @function injectFromId
 * @description 将认证用户的ID注入到 req.body.fromId
 */
export function injectFromId(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthRequest;
  
  if (!authReq.user || !authReq.user.sub) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
      status: 401
    });
    return;
  }

  if (!req.body) {
    req.body = {};
  }
  
  req.body.fromId = authReq.user.sub;
  next();
}

/**
 * @function injectSenderId
 * @description 将认证用户的ID注入到 req.body.senderId
 */
export function injectSenderId(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthRequest;
  
  if (!authReq.user || !authReq.user.sub) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
      status: 401
    });
    return;
  }

  if (!req.body) {
    req.body = {};
  }
  
  req.body.senderId = authReq.user.sub;
  next();
}
