/**
 * @packageDocumentation
 * @module database/models/ApiConfig/hook
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description API 配置模型钩子函数
 * @path src/models/api/hook.ts
 */

import type { ApiConfig } from "./index";

/**
 * @function setupApiConfigHooks
 * @description 设置 ApiConfig 模型的钩子函数
 * @param {typeof ApiConfig} ApiConfigModel - ApiConfig 模型类
 */
export function setupApiConfigHooks(ApiConfigModel: typeof ApiConfig) {
  /**
   * @hook beforeCreate
   * @description 创建前验证和预处理
   */
  ApiConfigModel.beforeCreate(async (apiConfig) => {
    // 确保 apiId 唯一性（额外验证）
    if (!apiConfig.apiId) {
      throw new Error("apiId is required");
    }

    // 验证 method 是否有效
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(apiConfig.method.toUpperCase())) {
      throw new Error(`Invalid HTTP method: ${apiConfig.method}`);
    }

    // 确保数组字段不为空
    if (!apiConfig.models || apiConfig.models.length === 0) {
      throw new Error("models array cannot be empty");
    }

    if (!apiConfig.paths || apiConfig.paths.length === 0) {
      throw new Error("paths array cannot be empty");
    }

    // 标准化 method 为大写
    apiConfig.method = apiConfig.method.toUpperCase() as any;
  });

  /**
   * @hook beforeUpdate
   * @description 更新前验证
   */
  ApiConfigModel.beforeUpdate(async (apiConfig) => {
    // 验证 method 是否有效
    if (apiConfig.changed('method')) {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      if (!validMethods.includes(apiConfig.method.toUpperCase())) {
        throw new Error(`Invalid HTTP method: ${apiConfig.method}`);
      }
      apiConfig.method = apiConfig.method.toUpperCase() as any;
    }

    // 验证关键字段
    if (apiConfig.changed('models') && (!apiConfig.models || apiConfig.models.length === 0)) {
      throw new Error("models array cannot be empty");
    }

    if (apiConfig.changed('paths') && (!apiConfig.paths || apiConfig.paths.length === 0)) {
      throw new Error("paths array cannot be empty");
    }
  });

  /**
   * @hook afterCreate
   * @description 创建后操作（可用于触发路由重载）
   */
  ApiConfigModel.afterCreate(async (apiConfig) => {
    // TODO: 触发路由重载事件
    // EventEmitter.emit('api:config:created', apiConfig.apiId);
  });

  /**
   * @hook afterUpdate
   * @description 更新后操作（可用于触发路由重载）
   */
  ApiConfigModel.afterUpdate(async (apiConfig) => {
    // TODO: 触发路由重载事件
    // EventEmitter.emit('api:config:updated', apiConfig.apiId);
  });

  /**
   * @hook afterDestroy
   * @description 删除后操作（可用于触发路由重载）
   */
  ApiConfigModel.afterDestroy(async (apiConfig) => {
    // TODO: 触发路由重载事件
    // EventEmitter.emit('api:config:deleted', apiConfig.apiId);
  });
}
