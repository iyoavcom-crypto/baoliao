/**
 * @packageDocumentation
 * @module dto/admin/role
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 角色相关数据传输对象
 */

/**
 * @interface RoleListDto
 * @description 角色列表项
 * @property {string} id - 角色ID
 * @property {string} name - 角色名称
 * @property {string} group - 角色分组
 */
export interface RoleListDto {
  id: string;
  name: string;
  group: string;
}

/**
 * @interface RoleDetailDto
 * @description 角色详情
 * @property {string} id - 角色ID
 * @property {string} name - 角色名称
 * @property {string} group - 角色分组
 */
export interface RoleDetailDto {
  id: string;
  name: string;
  group: string;
}

/**
 * @interface RoleCreatableDto
 * @description 角色可创建字段
 * @property {string} id - 角色ID
 * @property {string} name - 角色名称
 * @property {string} group - 角色分组
 */
export interface RoleCreatableDto {
  id: string;
  name: string;
  group: string;
}

/**
 * @interface RoleUpdatableDto
 * @description 角色可更新字段
 * @property {string} name - 角色名称
 * @property {string} group - 角色分组
 */
export interface RoleUpdatableDto {
  name?: string;
  group?: string;
}
