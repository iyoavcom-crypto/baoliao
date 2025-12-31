/**
 * @packageDocumentation
 * @module：mysql
 * @since 1.0.1 (2025-10-31)
 * @author：
 *   Z-kali
 * @description
 *   提供 Sequelize/MySQL 初始化、健康检查与基础工具函数（src/config/mysql.ts）
 * @see：
 *   Sequelize 官方文档 / mysql2 官方文档
 */

import {
  Sequelize,
  Transaction,
  type Options,
  type FindOptions,
  type Model,
  type ModelStatic,
} from "sequelize";

/**
 * @interface SequelizeConfig
 * @description Sequelize 连接配置
 * @property {string} database - 数据库名称
 * @property {string} username - 数据库用户名
 * @property {string} password - 数据库密码
 * @property {string} host - 数据库主机地址
 * @property {number} port - 数据库端口
 */
export interface SequelizeConfig {
  database: string;
  username: string;
  password: string;
  host: string;
  port: number;
}

/**
 * @interface InitDatabaseOptions
 * @description 数据库初始化选项
 * @property {boolean} [sync=false] - 是否在初始化时调用 sequelize.sync（默认关闭）
 * @property {boolean} [force=false] - sync 模式下是否强制重建表（谨慎使用）
 * @property {boolean} [alter=false] - sync 模式下是否自动对比/调整表结构
 */
export interface InitDatabaseOptions {
  sync?: boolean;
  force?: boolean;
  alter?: boolean;
}

/**
 * @constant defaultSequelizeConfig
 * @description 默认 Sequelize 连接配置（可根据环境变量覆盖）
 */
export const defaultSequelizeConfig: SequelizeConfig = {
  database: process.env.MYSQL_DB ?? "kali",
  username: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "123456",
  host: process.env.MYSQL_HOST ?? "192.168.1.4",
  port: Number(process.env.MYSQL_PORT ?? 3306),
};

/**
 * @function createSequelizeInstance
 * @description 创建 Sequelize 实例（支持自定义配置）
 * @param {SequelizeConfig} [config=defaultSequelizeConfig] - 连接配置
 * @returns {Sequelize} Sequelize 实例
 */
export function createSequelizeInstance(
  config: SequelizeConfig = defaultSequelizeConfig,
): Sequelize {
  const options: Options = {
    database: config.database,
    username: config.username,
    password: config.password,
    host: config.host,
    port: config.port,
    dialect: "mysql",

    // 连接池配置：根据业务并发和 MySQL max_connections 调整
    pool: {
      max: 10,
      min: 2,
      idle: 10_000,
      acquire: 30_000,
      evict: 10_000,
    },

    // 标准化字符集与时间处理
    dialectOptions: {
      charset: "utf8mb4",
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
      /**
       * @description
       *   统一将 DATETIME/TIMESTAMP 按字符串返回，减少 Date 实例创建开销
       *   具体解析逻辑交由业务层处理
       * @param {Field} field - 字段元信息
       * @param {() => any} next - 默认转换逻辑
       * @returns {any} 字段值
       */
      typeCast(field: any, next: () => any): any {
        if (field.type === "DATETIME" || field.type === "TIMESTAMP") {
          return field.string();
        }
        return next();
      },
    },

    // 与业务时区保持一致
    timezone: "+08:00",

    // 日志与耗时
    logging: false,
    benchmark: true,

    // 模型全局默认配置
    define: {
      freezeTableName: true, // 表名与模型名保持一致
      underscored: true, // 字段使用下划线命名
      timestamps: true, // 统一启用 created_at / updated_at
      paranoid: false, // 默认不启用软删除
    },

    // 短暂网络抖动或连接中断时的重试策略
    retry: {
      max: 3,
    },

    // 全局事务隔离级别（如无特殊要求使用 READ_COMMITTED）
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  };

  return new Sequelize(options);
}

/**
 * @constant sequelize
 * @description 默认 Sequelize 单例实例
 */
export const sequelize: Sequelize = createSequelizeInstance();

/**
 * @function initDatabaseAsync
 * @description
 *   初始化数据库连接，可选控制是否调用 sequelize.sync。
 *   在你的 server.ts 中使用：await initDatabaseAsync({ sync: false });
 * @param {InitDatabaseOptions} [options] - 初始化选项
 * @returns {Promise<void>} 无返回值
 */
export async function initDatabaseAsync(
  options: InitDatabaseOptions = {},
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { sync = false, force = false, alter = false } = options;

  // 仅做连接与简单探活，失败直接抛异常终止启动
  await sequelize.authenticate();
  await sequelize.query("SELECT 1");

  // 默认不 sync，保留给测试环境或特殊场景使用
  if (sync) {
    await sequelize.sync({ force, alter });
  }
}

/**
 * @function initDatabase
 * @description 简化版初始化函数，不进行 sync，用于大多数生产场景
 * @returns {Promise<void>} 无返回值
 */
export async function initDatabase(_p0: { sync: boolean; }): Promise<void> {
  await initDatabaseAsync({ sync: false });
}

/**
 * @function checkDbHealth
 * @description 数据库健康检查（可用于 HTTP / K8s 探针）
 * @returns {Promise<boolean>} 数据库是否可用
 */
export async function checkDbHealth(): Promise<boolean> {
  try {
    await sequelize.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

/**
 * @function withTransaction
 * @description 事务包装工具函数（自动提交或回滚）
 * @template T
 * @param {(tx: Transaction) => Promise<T>} handler - 业务处理函数
 * @returns {Promise<T>} 业务返回值
 */
export async function withTransaction<T>(
  handler: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return sequelize.transaction(async (tx) => handler(tx));
}

/**
 * @function findAllRaw
 * @description 以 raw 模式执行 findAll 查询，返回普通对象数组
 * @template M
 * @param {ModelStatic<M>} model - Sequelize 模型类
 * @param {FindOptions<M["_attributes"]>} options - 查询参数
 * @returns {Promise<M["_attributes"][]>} 结果数组（plain object）
 */
export async function findAllRaw<M extends Model>(
  model: ModelStatic<M>,
  options: FindOptions<M["_attributes"]>,
): Promise<M["_attributes"][]> {
  const rows = await model.findAll({
    ...options,
    raw: true,
  });

  return rows as unknown as M["_attributes"][];
}

/**
 * @function findOneRaw
 * @description 以 raw 模式执行 findOne 查询，返回普通对象或 null
 * @template M
 * @param {ModelStatic<M>} model - Sequelize 模型类
 * @param {FindOptions<M["_attributes"]>} options - 查询参数
 * @returns {Promise<M["_attributes"] | null>} 查询结果
 */
export async function findOneRaw<M extends Model>(
  model: ModelStatic<M>,
  options: FindOptions<M["_attributes"]>,
): Promise<M["_attributes"] | null> {
  const row = await model.findOne({
    ...options,
    raw: true,
  });

  return (row as unknown as M["_attributes"]) ?? null;
}
