/**
 * @packageDocumentation
 * @module tools/error-formatter
 * @since 1.0.0 (2025-12-31)
 * @author Z-kali
 * @description 统一的错误格式化工具，用于日志记录和错误响应
 */

/**
 * @interface FormattedError
 * @description 格式化后的错误对象结构
 * @property {string} name - 错误名称
 * @property {string} message - 错误消息
 * @property {string} [stack] - 错误堆栈（可选）
 */
export interface FormattedError {
  name: string;
  message: string;
  stack?: string;
}

/**
 * @function formatErrorForLogging
 * @description 将错误对象格式化为适合日志记录的结构
 * @param {unknown} error - 错误对象（可能是 Error 实例或其他类型）
 * @returns {FormattedError} 格式化后的错误对象
 * 
 * @example
 * ```typescript
 * const error = new Error("Something went wrong");
 * const formatted = formatErrorForLogging(error);
 * // { name: "Error", message: "Something went wrong", stack: "..." }
 * ```
 */
export function formatErrorForLogging(error: unknown): FormattedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  
  // 处理非 Error 对象
  return {
    name: typeof error,
    message: String(error),
  };
}

/**
 * @function formatErrorForResponse
 * @description 将错误对象格式化为 HTTP 响应格式
 * @param {unknown} error - 错误对象
 * @param {boolean} includeStack - 是否包含堆栈信息（开发环境建议开启）
 * @returns {object} 格式化后的错误响应对象
 * 
 * @example
 * ```typescript
 * const error = new Error("Not found");
 * const response = formatErrorForResponse(error, true);
 * // { code: "ERROR", message: "Not found", stack: "..." }
 * ```
 */
export function formatErrorForResponse(
  error: unknown,
  includeStack: boolean = false
): {
  code: string;
  message: string;
  stack?: string;
} {
  const formatted = formatErrorForLogging(error);
  
  const response: {
    code: string;
    message: string;
    stack?: string;
  } = {
    code: (error as any).code || formatted.name.toUpperCase(),
    message: formatted.message,
  };
  
  if (includeStack && formatted.stack) {
    response.stack = formatted.stack;
  }
  
  return response;
}
