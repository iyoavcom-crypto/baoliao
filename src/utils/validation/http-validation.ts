/**
 * @packageDocumentation
 * @module utils/validation/http-validation
 * @since 1.0.0
 * @author Z-kali
 * @description HTTP请求验证工具函数，用于减少控制器中的重复验证代码
 */

import type { Response } from "express";
import type { AuthRequest } from "@/middleware/auth/require";
import { fail } from "@/middleware/requests/crud/fail";
import { CrudValidationError } from "@/middleware/requests/crud/fail";

/**
 * @function validateAuthRequired
 * @description 验证用户是否已认证
 * @param {AuthRequest} req - 认证请求对象
 * @param {Response} res - Express响应对象
 * @returns {string | null} 返回userId如果已认证，否则返回null并发送401响应
 */
export function validateAuthRequired(req: AuthRequest, res: Response): string | null {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
      status: 401
    });
    return null;
  }
  return userId;
}

/**
 * @function validateRequired
 * @description 验证必需字段是否存在
 * @param {Response} res - Express响应对象
 * @param {Record<string, any>} fields - 需要验证的字段对象，key为字段名，value为字段值
 * @returns {boolean} 如果所有字段都存在返回true，否则返回false并发送400响应
 */
export function validateRequired(res: Response, fields: Record<string, any>): boolean {
  const errors: Array<{ field: string; message: string }> = [];
  
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`
      });
    }
  }
  
  if (errors.length > 0) {
    fail(res, new CrudValidationError(errors));
    return false;
  }
  
  return true;
}

/**
 * @function validateNotSelf
 * @description 验证目标用户不是当前用户自己
 * @param {Response} res - Express响应对象
 * @param {string} userId - 当前用户ID
 * @param {string} targetId - 目标用户ID
 * @param {string} [message] - 自定义错误消息
 * @returns {boolean} 如果不是自己返回true，否则返回false并发送400响应
 */
export function validateNotSelf(
  res: Response, 
  userId: string, 
  targetId: string,
  message: string = "Cannot perform this action on yourself"
): boolean {
  if (userId === targetId) {
    res.status(400).json({
      code: "BAD_REQUEST",
      message,
      status: 400
    });
    return false;
  }
  return true;
}

/**
 * @interface ValidationRule
 * @description 自定义验证规则接口
 */
export interface ValidationRule {
  /** 验证函数，返回true表示验证通过 */
  validate: (value: any) => boolean;
  /** 错误消息 */
  message: string;
}

/**
 * @function validateCustom
 * @description 执行自定义验证规则
 * @param {Response} res - Express响应对象
 * @param {string} fieldName - 字段名
 * @param {any} fieldValue - 字段值
 * @param {ValidationRule[]} rules - 验证规则数组
 * @returns {boolean} 如果所有规则都通过返回true，否则返回false并发送400响应
 */
export function validateCustom(
  res: Response,
  fieldName: string,
  fieldValue: any,
  rules: ValidationRule[]
): boolean {
  for (const rule of rules) {
    if (!rule.validate(fieldValue)) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: rule.message,
        status: 400
      });
      return false;
    }
  }
  return true;
}
