/**
 * @packageDocumentation
 * @module dto/api-config
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description API 配置相关的数据传输对象（DTO）定义
 * @path src/services/dto/api-config/index.ts
 */

import type { HttpMethod, OperateEnum } from "@/types/api";

/**
 * @interface CreateApiConfigDTO
 * @description 创建 API 配置的 DTO
 */
export interface CreateApiConfigDTO {
  apiId: string;
  method: HttpMethod;
  models: string[];
  paths: string[];
  roles?: string[];
  operateEnum: OperateEnum;
  dto?: string[];
  fields?: string[];
  cache?: {
    enabled?: boolean;
    ttl?: number;
    keyFields?: string[];
  };
  enabled?: boolean;
  keyFields?: string[];
  authRequired?: boolean;
  allowedSortFields?: string[];
  defaultSortField?: string;
  description?: string;
  category?: string;
  version?: number;
  tags?: string[];
}

/**
 * @interface UpdateApiConfigDTO
 * @description 更新 API 配置的 DTO（所有字段可选）
 */
export interface UpdateApiConfigDTO {
  apiId?: string;
  method?: HttpMethod;
  models?: string[];
  paths?: string[];
  roles?: string[];
  operateEnum?: OperateEnum;
  dto?: string[];
  fields?: string[];
  cache?: {
    enabled?: boolean;
    ttl?: number;
    keyFields?: string[];
  };
  enabled?: boolean;
  keyFields?: string[];
  authRequired?: boolean;
  allowedSortFields?: string[];
  defaultSortField?: string;
  description?: string;
  active?: boolean;
  category?: string;
  version?: number;
  tags?: string[];
}

/**
 * @interface ApiConfigQueryDTO
 * @description 查询 API 配置的 DTO
 */
export interface ApiConfigQueryDTO {
  active?: boolean;
  method?: string;
  category?: string;
  version?: number;
  page?: number;
  pageSize?: number;
  keyword?: string;
}

/**
 * @interface ApiConfigResponseDTO
 * @description API 配置响应 DTO
 */
export interface ApiConfigResponseDTO {
  id: number;
  apiId: string;
  method: HttpMethod;
  models: string[];
  paths: string[];
  roles: string[];
  operateEnum: OperateEnum;
  dto: string[];
  fields?: string[];
  cache?: object;
  enabled?: boolean;
  keyFields?: string[];
  authRequired?: boolean;
  allowedSortFields?: string[];
  defaultSortField?: string;
  description?: string;
  active: boolean;
  version?: number;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface ApiConfigListResponseDTO
 * @description API 配置列表响应 DTO
 */
export interface ApiConfigListResponseDTO {
  total: number;
  page: number;
  pageSize: number;
  data: ApiConfigResponseDTO[];
}

/**
 * @interface BulkImportDTO
 * @description 批量导入 API 配置的 DTO
 */
export interface BulkImportDTO {
  configs: CreateApiConfigDTO[];
  overwrite?: boolean;
}

/**
 * @interface BulkImportResultDTO
 * @description 批量导入结果 DTO
 */
export interface BulkImportResultDTO {
  success: number;
  failed: number;
  errors: Array<{
    apiId: string;
    error: string;
  }>;
}
