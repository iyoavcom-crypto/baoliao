import type { Response } from "express";
import type { ApiSuccessResponse } from "./types.js";

/**
 * @function ok
 * @description 发送统一成功响应。针对分页结果（包含 list/total 字段的对象），自动展开为平铺结构。
 * @param {Response} res - Express 响应对象
 * @param {T} data - 业务数据
 * @param {string} [message="OK"] - 提示消息
 * @param {number} [status=200] - HTTP 状态码
 * @returns {void}
 */
export function ok<T>(
  res: Response,
  data: T,
  message: string = "OK",
  status: number = 200
): void {
  let body: ApiSuccessResponse<T> | any = {
    code: 0,
    message,
  };

  // 自动展开分页结果：若 data 包含 list 数组与 total，则提取 list 为 data，其余字段平铺
  if (
    data &&
    typeof data === "object" &&
    "list" in data &&
    "total" in data &&
    Array.isArray((data as any).list)
  ) {
    const { list, total, page, limit, ...rest } = data as any;
    
    // 计算扩展分页信息
    const totalNum = Number(total);
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    let totalPages: number | undefined;
    let hasPrevPage: boolean | undefined;
    let hasNextPage: boolean | undefined;

    if (Number.isFinite(totalNum) && Number.isFinite(limitNum) && limitNum > 0) {
      totalPages = Math.ceil(totalNum / limitNum);
      if (Number.isFinite(pageNum)) {
         hasPrevPage = pageNum > 1;
         hasNextPage = pageNum < totalPages;
      }
    }

    body.data = list;
    
    // 只有当计算出有效的分页信息时才添加 pagination 字段
    if (totalPages !== undefined && hasPrevPage !== undefined && hasNextPage !== undefined) {
       body.pagination = {
         total: totalNum,
         page: pageNum,
         limit: limitNum,
         totalPages,
         hasPrevPage,
         hasNextPage
       };
    } else {
        // 降级处理：如果无法计算完整分页信息，保留原始字段（兼容性考虑，或者根据需求决定是否还要保留）
        // 这里选择仅在无法构建完整 pagination 对象时，不输出 pagination 字段
        // 但为了兼容旧代码，如果 list/total 存在但无法计算完整分页，是否需要 fallback？
        // 暂时假设输入数据总是合法的，若必须输出 pagination 结构，则赋默认值
       body.pagination = {
         total: totalNum,
         page: pageNum || 1,
         limit: limitNum || 20,
         totalPages: totalPages || 0,
         hasPrevPage: hasPrevPage || false,
         hasNextPage: hasNextPage || false
       };
    }
    
    Object.assign(body, rest);
  } else {
    body.data = data;
  }

  res.status(status).json(body);
}
