/**
 * @packageDocumentation
 * @module http/router/json/jsonStore
 * @since 1.0.0 (2025-11-22)
 * @description 提供通用 JSON 文件读写与 CRUD 抽象
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, isAbsolute, resolve as pathResolve } from "node:path";
import { randomUUID } from "node:crypto";

/**
 * @function resolvePath
 * @description 解析相对路径为绝对路径（相对于当前工作目录）
 * @param {string} relative - 相对路径或绝对路径
 * @returns {string} 解析后的绝对路径
 * @internal
 */
function resolvePath(relative: string): string {
  return isAbsolute(relative) ? relative : pathResolve(process.cwd(), relative);
}

/**
 * @interface JsonStoreOptions
 * @description JsonStore 初始化配置
 * @property {string} filePath - JSON 文件物理路径（相对路径将基于 process.cwd() 解析）
 * @property {string} idField - 实体主键字段名，如 "id"
 */
export interface JsonStoreOptions {
  filePath: string;
  idField: string;
}

/**
 * @interface JsonStoreFindAndCountOptions
 * @description findAndCountAll 查询参数
 * @property {number | undefined} limit - 返回记录数上限
 * @property {number | undefined} offset - 偏移量
 * @property {Array<[string, "DESC" | "ASC"]> | undefined} order - 排序定义，当前仅支持单字段排序
 */
export interface JsonStoreFindAndCountOptions {
  limit?: number;
  offset?: number;
  order?: Array<[string, "DESC" | "ASC"]>;
  where?: Record<string, unknown>;
}

/**
 * @class JsonStore
 * @description 基于本地 JSON 文件的简单持久化存储，提供通用 CRUD 与分页、排序能力
 * @template T - 实体类型，要求为键值对对象
 */
export class JsonStore<T extends Record<string, unknown>> {
  /**
   * @description JSON 文件绝对路径
   * @private
   */
  private readonly filePath: string;

  /**
   * @description 主键字段名称
   * @private
   */
  private readonly idField: keyof T;

  /**
   * @constructor
   * @description 创建 JsonStore 实例
   * @param {JsonStoreOptions} options - 初始化配置
   */
  constructor(options: JsonStoreOptions) {
    this.filePath = resolvePath(options.filePath);
    this.idField = options.idField as keyof T;
  }

  /**
   * @function readAll
   * @description 读取 JSON 文件中的全部记录；文件不存在或内容为空时返回空数组
   * @returns {Promise<T[]>} 实体列表
   */
  async readAll(): Promise<T[]> {
    try {
      const buf = await readFile(this.filePath, "utf-8");
      if (!buf.trim()) return [];
      const data = JSON.parse(buf) as unknown;
      if (Array.isArray(data)) {
        return data as T[];
      }
      return [];
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException;
      if (e.code === "ENOENT") {
        return [];
      }
      throw err;
    }
  }

  /**
   * @function writeAll
   * @description 将全部记录写入 JSON 文件（覆盖原内容）
   * @param {T[]} items - 要持久化的实体列表
   * @returns {Promise<void>} 无返回值
   */
  async writeAll(items: T[]): Promise<void> {
    const dir = dirname(this.filePath);
    await mkdir(dir, { recursive: true });
    const json = JSON.stringify(items, null, 2);
    await writeFile(this.filePath, json, "utf-8");
  }

  /**
   * @function findById
   * @description 根据主键值查询单条记录（使用字符串对比）
   * @param {string} id - 主键值
   * @returns {Promise<T | undefined>} 匹配的实体；未找到则为 undefined
   */
  async findById(id: string): Promise<T | undefined> {
    const items = await this.readAll();
    return items.find((item) => String(item[this.idField]) === id);
  }

  /**
   * @function insert
   * @description 插入一条记录并持久化到 JSON 文件
   * @param {T} entity - 要插入的实体
   * @returns {Promise<T>} 插入后的实体
   */
  async insert(entity: T): Promise<T> {
    const items = await this.readAll();
    items.push(entity);
    await this.writeAll(items);
    return entity;
  }

  /**
   * @function update
   * @description 按主键更新指定记录的部分字段
   * @param {string} id - 主键值
   * @param {Partial<T>} patch - 要更新的字段补丁
   * @returns {Promise<T | undefined>} 更新后的实体，未找到返回 undefined
   */
  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const items = await this.readAll();
    const index = items.findIndex((item) => String(item[this.idField]) === id);
    if (index === -1) return undefined;
    const updated = { ...items[index], ...patch } as T;
    items[index] = updated;
    await this.writeAll(items);
    return updated;
  }

  /**
   * @function remove
   * @description 按主键删除记录
   * @param {string} id - 主键值
   * @returns {Promise<boolean>} 是否成功删除（删除了至少一条为 true）
   */
  async remove(id: string): Promise<boolean> {
    const items = await this.readAll();
    const next = items.filter((item) => String(item[this.idField]) !== id);
    const removed = next.length !== items.length;
    if (removed) {
      await this.writeAll(next);
    }
    return removed;
  }

  /**
   * @function findAndCountAll
   * @description 分页 + 排序查询全部记录，并返回总数
   * @param {JsonStoreFindAndCountOptions} options - 查询参数（limit/offset/order）
   * @returns {Promise<{ rows: T[]; count: number }>} rows 为当前页数据，count 为总记录数
   */
  async findAndCountAll(
    options: JsonStoreFindAndCountOptions,
  ): Promise<{ rows: T[]; count: number }> {
    const items = await this.readAll();
    const where = options.where ?? {};
    const hasWhere = Object.keys(where).length > 0;
    const filtered = hasWhere
      ? items.filter((it) => {
          for (const [k, v] of Object.entries(where)) {
            const val = (it as Record<string, unknown>)[k];
            if (v === undefined) continue;
            if (Array.isArray(v)) {
              const s = String(val ?? "");
              if (!v.map(String).includes(s)) return false;
            } else {
              if (String(val ?? "") !== String(v)) return false;
            }
          }
          return true;
        })
      : items;
    const count = filtered.length;

    let sorted = filtered.slice();
    const order = Array.isArray(options.order) ? options.order : [];
    if (order.length > 0) {
      const [field, dir] = order[0];
      sorted.sort((a, b) => {
        const av = a[field as keyof T] as unknown;
        const bv = b[field as keyof T] as unknown;
        if (typeof av === "number" && typeof bv === "number") {
          return dir === "DESC"
            ? (bv as number) - (av as number)
            : (av as number) - (bv as number);
        }
        const as = String(av ?? "");
        const bs = String(bv ?? "");
        return dir === "DESC" ? bs.localeCompare(as) : as.localeCompare(bs);
      });
    }

    const offset = typeof options.offset === "number" ? options.offset : 0;
    const limit =
      typeof options.limit === "number" && options.limit > 0
        ? options.limit
        : count;
    const rows = sorted.slice(offset, offset + limit);
    return { rows, count };
  }

  /**
   * @function findByPk
   * @description 按主键查询一条记录，并返回带有 update/destroy 方法的“活动记录”风格对象
   * @param {string} id - 主键值
   * @returns {Promise<(T & { update: (patch: Partial<T>) => Promise<void>; destroy: () => Promise<void> }) | undefined>}
   * 返回扩展了 update/destroy 的实体；未找到返回 undefined
   */
  async findByPk(
    id: string,
  ): Promise<
    (T & {
      update: (patch: Partial<T>) => Promise<void>;
      destroy: () => Promise<void>;
    }) | undefined
  > {
    const items = await this.readAll();
    const index = items.findIndex((item) => String(item[this.idField]) === id);
    if (index === -1) return undefined;
    const self = this;
    const base = { ...items[index] } as T;
    const row = Object.assign({}, base, {
      async update(patch: Partial<T>): Promise<void> {
        const updated = { ...(row as T), ...patch } as T;
        items[index] = updated;
        Object.assign(row, updated);
        await self.writeAll(items);
      },
      async destroy(): Promise<void> {
        const next = items.filter(
          (item) => String(item[self.idField]) !== id,
        );
        await self.writeAll(next);
      },
    });
    return row as T & {
      update: (patch: Partial<T>) => Promise<void>;
      destroy: () => Promise<void>;
    };
  }

  /**
   * @function create
   * @description 基于原始载荷创建实体；若主键字段为空则自动生成 UUID
   * @param {Record<string, unknown>} payload - 原始载荷
   * @returns {Promise<T>} 创建并持久化后的实体
   */
  async create(payload: Record<string, unknown>): Promise<T> {
    const entity = { ...payload } as T;
    const key = this.idField as keyof T & string;
    const hasId =
      entity[key] !== undefined &&
      entity[key] !== null &&
      String(entity[key]).length > 0;
    if (!hasId) {
      (entity as Record<string, unknown>)[key] = randomUUID();
    }
    const created = await this.insert(entity);
    return created;
  }
}
