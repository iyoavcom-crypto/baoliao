/**
 * @packageDocumentation
 * @module types/models/role
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description Role 模型类型定义
 */

/**
 * @enum RoleGroup
 * @description 角色分组枚举
 */
export enum RoleGroup {
  SYSTEM = "system",
  PROJECT = "project",
  USER = "user",
}

/**
 * @interface RoleAttributes
 * @description 角色模型属性接口
 */
export interface RoleAttributes {
  id: string;
  name: string;
  group: RoleGroup;
}
