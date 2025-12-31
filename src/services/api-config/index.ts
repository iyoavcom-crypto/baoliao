/**
 * @packageDocumentation
 * @module services/api-config
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description API 配置服务层，提供 API 配置的 CRUD 和管理功能
 * @path src/services/api-config/index.ts
 */

import { ApiConfig } from "@/models";
import type { API } from "@/types/api";
import type { FindOptions, WhereOptions } from "sequelize";

/**
 * @interface ApiConfigQueryOptions
 * @description API 配置查询选项
 */
export interface ApiConfigQueryOptions {
  active?: boolean;
  method?: string;
  category?: string;
  version?: number;
  limit?: number;
  offset?: number;
}

/**
 * @class ApiConfigService
 * @description API 配置服务类
 */
export class ApiConfigService {
  /**
   * @method getAllConfigs
   * @description 获取所有 API 配置
   * @param {ApiConfigQueryOptions} options - 查询选项
   * @returns {Promise<ApiConfig[]>} API 配置列表
   */
  static async getAllConfigs(options: ApiConfigQueryOptions = {}): Promise<ApiConfig[]> {
    const where: WhereOptions = {};

    if (options.active !== undefined) {
      where.active = options.active;
    }

    if (options.method) {
      where.method = options.method.toUpperCase();
    }

    if (options.category) {
      where.category = options.category;
    }

    if (options.version !== undefined) {
      where.version = options.version;
    }

    const queryOptions: FindOptions = {
      where,
      order: [['category', 'ASC'], ['apiId', 'ASC']],
    };

    if (options.limit) {
      queryOptions.limit = options.limit;
    }

    if (options.offset) {
      queryOptions.offset = options.offset;
    }

    return await ApiConfig.findAll(queryOptions);
  }

  /**
   * @method getActiveConfigs
   * @description 获取所有激活的 API 配置
   * @returns {Promise<ApiConfig[]>} 激活的 API 配置列表
   */
  static async getActiveConfigs(): Promise<ApiConfig[]> {
    return await this.getAllConfigs({ active: true });
  }

  /**
   * @method getConfigById
   * @description 根据 ID 获取 API 配置
   * @param {number} id - API 配置 ID
   * @returns {Promise<ApiConfig | null>} API 配置或 null
   */
  static async getConfigById(id: number): Promise<ApiConfig | null> {
    return await ApiConfig.findByPk(id);
  }

  /**
   * @method getConfigByApiId
   * @description 根据 apiId 获取 API 配置
   * @param {string} apiId - API 唯一标识
   * @returns {Promise<ApiConfig | null>} API 配置或 null
   */
  static async getConfigByApiId(apiId: string): Promise<ApiConfig | null> {
    return await ApiConfig.findOne({ where: { apiId } });
  }

  /**
   * @method createConfig
   * @description 创建新的 API 配置
   * @param {Partial<ApiConfig>} data - API 配置数据
   * @returns {Promise<ApiConfig>} 创建的 API 配置
   */
  static async createConfig(data: Partial<ApiConfig>): Promise<ApiConfig> {
    return await ApiConfig.create(data as any);
  }

  /**
   * @method updateConfig
   * @description 更新 API 配置
   * @param {number} id - API 配置 ID
   * @param {Partial<ApiConfig>} data - 更新数据
   * @returns {Promise<ApiConfig | null>} 更新后的 API 配置或 null
   */
  static async updateConfig(id: number, data: Partial<ApiConfig>): Promise<ApiConfig | null> {
    const config = await ApiConfig.findByPk(id);
    if (!config) {
      return null;
    }
    await config.update(data);
    return config;
  }

  /**
   * @method deleteConfig
   * @description 删除 API 配置
   * @param {number} id - API 配置 ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  static async deleteConfig(id: number): Promise<boolean> {
    const config = await ApiConfig.findByPk(id);
    if (!config) {
      return false;
    }
    await config.destroy();
    return true;
  }

  /**
   * @method toggleActive
   * @description 切换 API 配置的激活状态
   * @param {number} id - API 配置 ID
   * @returns {Promise<ApiConfig | null>} 更新后的 API 配置或 null
   */
  static async toggleActive(id: number): Promise<ApiConfig | null> {
    const config = await ApiConfig.findByPk(id);
    if (!config) {
      return null;
    }
    await config.update({ active: !config.active });
    return config;
  }

  /**
   * @method convertToAPI
   * @description 将数据库 ApiConfig 转换为 API 类型
   * @param {ApiConfig} config - API 配置实例
   * @returns {API} API 对象
   */
  static convertToAPI(config: ApiConfig): API {
    return {
      id: config.apiId,
      method: config.method,
      models: config.models,
      paths: config.paths,
      roles: config.roles,
      operateEnum: config.operateEnum,
      dto: config.dto,
      fields: config.fields,
      cache: config.cache as any,
      enabled: config.enabled,
      keyFields: config.keyFields,
      authRequired: config.authRequired,
      allowedSortFields: config.allowedSortFields,
      defaultSortField: config.defaultSortField,
      description: config.description,
    };
  }

  /**
   * @method loadActiveAPIs
   * @description 加载所有激活的 API 配置并转换为 API 类型
   * @returns {Promise<API[]>} API 列表
   */
  static async loadActiveAPIs(): Promise<API[]> {
    const configs = await this.getActiveConfigs();
    return configs.map(config => this.convertToAPI(config));
  }

  /**
   * @method bulkCreateFromJSON
   * @description 从 JSON 数据批量创建 API 配置
   * @param {any[]} jsonData - JSON 数据数组
   * @returns {Promise<ApiConfig[]>} 创建的 API 配置列表
   */
  static async bulkCreateFromJSON(jsonData: any[]): Promise<ApiConfig[]> {
    const configs = jsonData.map((item) => ({
      apiId: item.id,
      method: item.method,
      models: item.models,
      paths: item.paths,
      roles: item.roles || [],
      operateEnum: item.operateEnum,
      dto: item.dto || [],
      fields: item.fields,
      cache: item.cache,
      enabled: item.enabled,
      keyFields: item.keyFields,
      authRequired: item.authRequired !== undefined ? item.authRequired : true,
      allowedSortFields: item.allowedSortFields,
      defaultSortField: item.defaultSortField,
      description: item.description,
      active: true,
      category: item.category,
      version: item.version || 1,
      tags: item.tags ? JSON.stringify(item.tags) : undefined,
    }));

    return await ApiConfig.bulkCreate(configs);
  }

  /**
   * @method syncFromFileSystem
   * @description 从文件系统同步 API 配置到数据库
   * @param {API[]} apis - 从文件加载的 API 列表
   * @returns {Promise<void>}
   */
  static async syncFromFileSystem(apis: API[]): Promise<void> {
    for (const api of apis) {
      const existing = await this.getConfigByApiId(api.id);
      
      const data = {
        apiId: api.id,
        method: api.method,
        models: api.models,
        paths: api.paths,
        roles: api.roles,
        operateEnum: api.operateEnum,
        dto: api.dto,
        fields: api.fields,
        cache: api.cache as any,
        enabled: api.enabled,
        keyFields: api.keyFields,
        authRequired: api.authRequired,
        allowedSortFields: api.allowedSortFields,
        defaultSortField: api.defaultSortField,
        description: api.description,
      };

      if (existing) {
        await existing.update(data);
      } else {
        await ApiConfig.create({ ...data, active: true } as any);
      }
    }
  }
}

export default ApiConfigService;
