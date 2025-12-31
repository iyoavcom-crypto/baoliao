/**
 * @packageDocumentation
 * @module services/crud-adapter
 * @since 1.0.0 (2025-12-31)
 * @author Z-kali
 * @description Sequelize Model到CrudService的适配器
 */

import type { Model, ModelStatic, FindOptions, WhereOptions } from "sequelize";
import { Op } from "sequelize";

/**
 * @interface CrudService
 * @description CRUD服务接口
 */
export interface CrudService<T> {
  list(options: any): Promise<{ data: T[]; total: number; page: number; limit: number }>;
  all(options: any): Promise<{ data: T[] }>;
  listAllFields(options: any): Promise<{ data: T[]; total: number; page: number; limit: number }>;
  getById(id: string): Promise<T | null>;
  getBySlug(slug: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
  search(keyword: string, page: number, limit: number): Promise<{ data: T[]; total: number; page: number; limit: number }>;
  tree(options: any): Promise<{ data: T[] }>;
}

export interface ListResult<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface DetailResult<T> {
  data: T | null;
}

/**
 * @function createCrudService
 * @description 将Sequelize Model包装为CrudService
 */
export function createCrudService<T extends Model>(
  model: ModelStatic<T>
): CrudService<T> {
  
  return {
    /**
     * 分页列表查询
     */
    async list(options: any = {}): Promise<{ data: T[]; total: number; page: number; limit: number }> {
      const page = Number(options.page) || 1;
      const limit = Number(options.limit) || 20;
      const offset = (page - 1) * limit;
      
      const where: any = {};
      if (options.keyword) {
        // 简单的关键字搜索，可以根据模型调整
        where[Op.or] = [
          { name: { [Op.like]: `%${options.keyword}%` } },
        ];
      }
      
      const { rows: data, count: total } = await model.findAndCountAll({
        where,
        limit,
        offset,
        order: options.order || [['createdAt', 'DESC']],
      });
      
      return { data, total, page, limit };
    },

    /**
     * 全量不分页查询
     */
    async all(options: any = {}): Promise<{ data: T[] }> {
      const data = await model.findAll({
        order: options.order || [['createdAt', 'DESC']],
      });
      return { data };
    },

    /**
     * 全量分页查询（包含所有字段）
     */
    async listAllFields(options: any = {}): Promise<{ data: T[]; total: number; page: number; limit: number }> {
      const page = Number(options.page) || 1;
      const limit = Number(options.limit) || 20;
      const offset = (page - 1) * limit;
      
      const { rows: data, count: total } = await model.findAndCountAll({
        limit,
        offset,
        order: options.order || [['createdAt', 'DESC']],
      });
      
      return { data, total, page, limit };
    },

    /**
     * 根据ID获取详情
     */
    async getById(id: string): Promise<T | null> {
      return await model.findByPk(id);
    },

    /**
     * 根据slug获取详情
     */
    async getBySlug(slug: string): Promise<T | null> {
      return await model.findOne({
        where: { slug } as any,
      });
    },

    /**
     * 创建实体
     */
    async create(data: Partial<T>): Promise<T> {
      return await model.create(data as any);
    },

    /**
     * 更新实体
     */
    async update(id: string, data: Partial<T>): Promise<T> {
      const instance = await model.findByPk(id);
      if (!instance) {
        throw Object.assign(new Error("记录不存在"), { status: 404 });
      }
      await instance.update(data as any);
      return instance;
    },

    /**
     * 删除实体
     */
    async remove(id: string): Promise<void> {
      const instance = await model.findByPk(id);
      if (!instance) {
        throw Object.assign(new Error("记录不存在"), { status: 404 });
      }
      await instance.destroy();
    },

    /**
     * 搜索
     */
    async search(keyword: string, page: number, limit: number): Promise<{ data: T[]; total: number; page: number; limit: number }> {
      const offset = (page - 1) * limit;
      
      const where: any = {};
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
        ];
      }
      
      const { rows: data, count: total } = await model.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      
      return { data, total, page, limit };
    },

    /**
     * 树形结构查询
     */
    async tree(options: any = {}): Promise<{ data: T[] }> {
      const data = await model.findAll({
        order: options.order || [['createdAt', 'DESC']],
      });
      return { data };
    },
  };
}
