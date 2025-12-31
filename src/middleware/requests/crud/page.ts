import type { Request } from "express";
import initials from "@/routes/initials.json" assert { type: "json" };

/**
 * @interface QueryOptions
 * @description 查询选项接口
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, unknown>;
  order?: string | string[];
}

/**
 * @function parseQueryOptions
 * @description 从 HTTP 查询参数中解析分页/搜索/过滤/排序选项
 * @param {Request} req - Express 请求对象
 * @returns {QueryOptions} 标准化查询选项
 */
export function parseQueryOptions(req: Request): QueryOptions {
  const query = req.query as {
    page?: string;
    limit?: string;
    search?: string;
    filters?: string;
    order?: string | string[];
  };

  const pageNum = query.page ? Number(query.page) : 1;
  const limitNum = query.limit ? Number(query.limit) : 20;

  const q: QueryOptions = {
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    limit: Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 20,
  };

  if (typeof query.search === "string" && query.search.trim() !== "") {
    q.search = query.search.trim();
  }

  if (typeof query.filters === "string") {
    try {
      const parsed = JSON.parse(query.filters) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") {
        delete (parsed as any).__proto__;
      }
      const letters = new Set((initials as { letters: string[] }).letters.map((x) => String(x).toLowerCase()));
      const digits = (initials as { digits: string[] }).digits.map((x) => String(x));
      const f = parsed as Record<string, unknown>;
      if (typeof f.initial === "string") {
        const v = String(f.initial).toLowerCase();
        delete f.initial;
        if (letters.has(v)) {
          f.title = { prefix: v } as unknown;
        } else if (v === "digit" || v === "digits" || v === "0-9") {
          f.title = { prefixList: digits } as unknown;
        }
      }
      q.filters = f;
    } catch {}
  }

  if (typeof query.order === "string" || Array.isArray(query.order)) {
    q.order = query.order;
  }

  return q;
}
