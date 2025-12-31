/**
 * @packageDocumentation
 * @module controllers-crud-fail
 * @since 1.0.0 (2025-11-23)
 * @author Z-kali
 * @description 提供统一错误响应处理工具方法，将服务层异常映射为标准化 HTTP 错误响应负载
 * @see CrudValidationError 服务层校验异常定义 "@/services/base"
 */

import type { Response } from "express";
import type { ApiErrorResponse } from "./types";

/**
 * @class CrudValidationError
 * @description CRUD 验证错误类
 */
export class CrudValidationError extends Error {
  constructor(
    public errors?: Array<{
      field: string;
      message: string;
      value?: unknown;
    }>
  ) {
    super("Validation failed");
    this.name = "CrudValidationError";
  }
}



/**
 * @function fail
 * @description 统一错误响应处理，将服务层抛出的异常转换为标准 HTTP 错误响应（支持参数校验错误、自定义业务错误及未知错误）
 * @param {Response} res - Express 响应对象，用于写入 HTTP 状态码与错误 JSON
 * @param {unknown} error - 捕获的异常对象，可为 CrudValidationError、携带 status 的 Error 或其他未知错误
 * @returns {void} 无返回值，通过响应对象直接输出错误信息
 */
export function fail(res: Response, error: unknown): void {
  // 参数校验错误
  if (error instanceof CrudValidationError) {
    const payload: ApiErrorResponse = {
      code: 1001,
      message: "请求参数校验失败",
      errors: error.errors?.map((e) => ({
        field: e.field,
        message: e.message,
        value: e.value,
      })),
    };
    res.status(400).json(payload);
    return;
  }

  // 唯一约束冲突（如 email 唯一）
  if (error instanceof Error && (error as any).name === "SequelizeUniqueConstraintError") {
    const payload: ApiErrorResponse = {
      code: 1409,
      message: "资源已存在",
    };
    res.status(409).json(payload);
    return;
  }

  // 外键约束错误（关联不存在）
  if (error instanceof Error && (error as any).name === "SequelizeForeignKeyConstraintError") {
    const payload: ApiErrorResponse = {
      code: 1400,
      message: "关联数据不存在",
    };
    res.status(400).json(payload);
    return;
  }

  // 自定义携带 status 的业务错误（如 404）
  if (error instanceof Error && typeof (error as any).status === "number") {
    const status = (error as any).status as number;
    const payload: ApiErrorResponse = {
      code: status === 404 ? 1404 : 1500,
      message: error.message || "业务处理失败",
    };
    res.status(status).json(payload);
    return;
  }

  // 未知错误
  const payload: ApiErrorResponse = {
    code: 1500,
    message: error instanceof Error ? error.message : "服务器内部错误",
  };
  res.status(500).json(payload);
}
