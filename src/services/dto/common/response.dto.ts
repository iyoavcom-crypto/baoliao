/**
 * @packageDocumentation
 * @module dto/common/response
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 通用API响应包装器DTO，提供类型安全的响应结构
 */

import type { ApiErrorCode } from "@/constants/api/error-code.js";

/**
 * @interface ApiResponseDto
 * @description API 标准响应结构（泛型基础接口）
 * @template T - 业务数据类型
 * @property {string} code - 业务状态码（ok 或错误码）
 * @property {string} [message] - 错误消息或提示信息
 * @property {T} [data] - 业务数据（泛型）
 * @property {boolean} [retriable] - 是否可重试
 * @property {number} serverTime - 服务器时间戳（毫秒）
 * @property {string} [requestId] - 请求追踪ID（用于日志关联）
 */
export interface ApiResponseDto<T = unknown> {
  code: string;
  message?: string;
  data?: T;
  retriable?: boolean;
  serverTime: number;
  requestId?: string;
}

/**
 * @interface ApiSuccessResponseDto
 * @description API 成功响应结构
 * @template T - 业务数据类型
 * @property {string} code - 固定为 "ok"
 * @property {T} data - 业务数据（必填）
 * @property {number} serverTime - 服务器时间戳
 */
export interface ApiSuccessResponseDto<T> {
  code: "ok";
  data: T;
  serverTime: number;
  requestId?: string;
}

/**
 * @interface ApiErrorResponseDto
 * @description API 错误响应结构
 * @property {ApiErrorCode} code - 业务错误码
 * @property {string} message - 错误消息
 * @property {boolean} [retriable] - 是否可重试
 * @property {number} serverTime - 服务器时间戳
 */
export interface ApiErrorResponseDto {
  code: ApiErrorCode;
  message: string;
  retriable?: boolean;
  serverTime: number;
  requestId?: string;
  data?: never;
}

/**
 * @interface ApiValidationErrorDto
 * @description 参数验证错误响应（带详细字段错误信息）
 * @property {string} code - 固定为 "validation_failed"
 * @property {string} message - 总体错误消息
 * @property {Record<string, string[]>} errors - 字段错误详情
 */
export interface ApiValidationErrorDto {
  code: "validation_failed";
  message: string;
  errors: Record<string, string[]>;
  serverTime: number;
  requestId?: string;
}

/**
 * @type ApiResponse
 * @description API响应联合类型（成功或错误）
 */
export type ApiResponse<T> = ApiSuccessResponseDto<T> | ApiErrorResponseDto | ApiValidationErrorDto;
