/**
 * @packageDocumentation
 * @module database/models/ApiConfig
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description API 配置模型定义，用于动态管理路由配置
 * @path src/models/api/index.ts
 */

import type { Sequelize } from "sequelize";
import { DataTypes, Model } from "sequelize";
import type { Optional } from "sequelize";
import type { HttpMethod, OperateEnum } from "@/types/api";

/**
 * @interface ApiConfigAttributes
 * @description API 配置模型属性接口
 * @property {number} id - API 配置 ID
 * @property {string} apiId - API 唯一标识符
 * @property {HttpMethod} method - HTTP 请求方法
 * @property {string[]} models - 关联的模型名称列表
 * @property {string[]} paths - 路径模式列表
 * @property {string[]} roles - 允许访问的角色列表
 * @property {OperateEnum} operateEnum - 操作类型枚举
 * @property {string[]} dto - DTO 名称列表
 * @property {string[]} [fields] - 返回字段列表
 * @property {object} [cache] - 缓存配置
 * @property {boolean} [enabled] - 缓存是否启用
 * @property {string[]} [keyFields] - 缓存键字段
 * @property {boolean} [authRequired] - 是否需要认证
 * @property {string[]} [allowedSortFields] - 允许排序的字段
 * @property {string} [defaultSortField] - 默认排序字段
 * @property {string} [description] - API 描述
 * @property {boolean} active - 是否激活
 * @property {number} [version] - API 版本号
 * @property {string} [category] - API 分类
 * @property {string} [tags] - API 标签（JSON 数组字符串）
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */
interface ApiConfigAttributes {
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
  tags?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * @interface ApiConfigCreationAttributes
 * @description 创建 API 配置时的可选属性
 */
interface ApiConfigCreationAttributes 
  extends Optional<
    ApiConfigAttributes, 
    'id' | 'fields' | 'cache' | 'enabled' | 'keyFields' | 'authRequired' | 
    'allowedSortFields' | 'defaultSortField' | 'description' | 'version' | 
    'category' | 'tags' | 'createdAt' | 'updatedAt'
  > {}

/**
 * @class ApiConfig
 * @description API 配置模型类，映射数据库 api_configs 表
 */
export class ApiConfig extends Model<ApiConfigAttributes, ApiConfigCreationAttributes> 
  implements ApiConfigAttributes {
  public id!: number;
  public apiId!: string;
  public method!: HttpMethod;
  public models!: string[];
  public paths!: string[];
  public roles!: string[];
  public operateEnum!: OperateEnum;
  public dto!: string[];
  public fields?: string[];
  public cache?: object;
  public enabled?: boolean;
  public keyFields?: string[];
  public authRequired?: boolean;
  public allowedSortFields?: string[];
  public defaultSortField?: string;
  public description?: string;
  public active!: boolean;
  public version?: number;
  public category?: string;
  public tags?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * @function initApiConfig
 * @description 初始化 ApiConfig 模型
 * @param {Sequelize} sequelize - Sequelize 实例
 */
export function initApiConfig(sequelize: Sequelize) {
  ApiConfig.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: "主键 ID",
      },
      apiId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: "API 唯一标识符",
      },
      method: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: "HTTP 请求方法（GET/POST/PUT/DELETE/PATCH）",
      },
      models: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: "关联的模型名称列表",
      },
      paths: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: "路径模式列表",
      },
      roles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: "允许访问的角色列表",
      },
      operateEnum: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "操作类型枚举",
      },
      dto: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: "DTO 名称列表",
      },
      fields: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "返回字段列表",
      },
      cache: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "缓存配置（JSON 对象）",
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: "缓存是否启用",
      },
      keyFields: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "缓存键字段列表",
      },
      authRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        comment: "是否需要认证",
      },
      allowedSortFields: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "允许排序的字段列表",
      },
      defaultSortField: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "默认排序字段",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "API 描述",
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "是否激活此 API 配置",
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: "API 版本号",
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "API 分类",
      },
      tags: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "API 标签（JSON 数组字符串）",
      },
    },
    {
      sequelize,
      tableName: 'api_configs',
      comment: 'API 路由配置表（动态路由管理）',
      indexes: [
        {
          unique: true,
          fields: ['apiId'],
          name: 'idx_api_id',
        },
        {
          fields: ['method'],
          name: 'idx_method',
        },
        {
          fields: ['active'],
          name: 'idx_active',
        },
        {
          fields: ['category'],
          name: 'idx_category',
        },
        {
          fields: ['version'],
          name: 'idx_version',
        },
      ],
    }
  );
  return ApiConfig;
}
