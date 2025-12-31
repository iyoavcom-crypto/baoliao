/**
 * @packageDocumentation
 * @module database/models/ApiConfig/association
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description API 配置模型关联关系定义
 * @path src/models/api/association.ts
 */

/**
 * @function associateApiConfig
 * @description 定义 ApiConfig 模型与其他模型的关联关系
 */
export function associateApiConfig() {
  // 目前 API 配置是独立表，暂无关联关系
  // 未来可以添加：
  // - ApiConfig belongsTo Role (创建者角色)
  // - ApiConfig hasMany ApiLog (API 调用日志)
  // - ApiConfig belongsToMany User (通过 UserApiPermission 中间表)
}
