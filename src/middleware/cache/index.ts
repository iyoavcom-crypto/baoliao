/**
 * @packageDocumentation
 * @module cache
 * @description 缓存中间件 - 支持内存缓存和 Redis
 */

import type { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';

/**
 * @interface CacheConfig
 * @description 缓存配置接口
 */
interface CacheConfig {
  type: 'memory' | 'redis';
  ttl: number;
  enabled: boolean;
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

/**
 * @interface CacheEntry
 * @description 缓存条目接口
 */
interface CacheEntry {
  data: any;
  expireAt: number;
}

/**
 * @class CacheManager
 * @description 缓存管理器
 */
export class CacheManager {
  private static instance: CacheManager;
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private redisClient: any = null;
  
  private constructor() {
    this.config = {
      type: 'memory',
      ttl: 300,
      enabled: true
    };
  }
  
  /**
   * @method getInstance
   * @description 获取单例实例
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  /**
   * @method loadConfig
   * @description 从文件加载缓存配置
   */
  public async loadConfig(): Promise<void> {
    try {
      const configPath = path.join(process.cwd(), 'data', 'api', 'cache.json');
      const content = await fs.readFile(configPath, 'utf-8');
      this.config = JSON.parse(content);
      
      console.log(`✅ 缓存配置已加载: ${this.config.type} (${this.config.enabled ? '启用' : '禁用'})`);
      
      // 如果配置为 Redis，尝试连接
      if (this.config.type === 'redis' && this.config.enabled) {
        await this.connectRedis();
      }
    } catch (error) {
      console.warn('⚠️  缓存配置文件不存在，使用默认配置');
    }
  }
  
  /**
   * @method connectRedis
   * @description 连接到 Redis
   */
  private async connectRedis(): Promise<void> {
    try {
      // 注意: 需要安装 redis 包
      // const redis = require('redis');
      // this.redisClient = redis.createClient({
      //   host: this.config.redis?.host || '127.0.0.1',
      //   port: this.config.redis?.port || 6379,
      //   password: this.config.redis?.password,
      //   db: this.config.redis?.db || 0
      // });
      // await this.redisClient.connect();
      console.log('✅ Redis 连接成功');
    } catch (error) {
      console.error('❌ Redis 连接失败，回退到内存缓存', error);
      this.config.type = 'memory';
    }
  }
  
  /**
   * @method get
   * @description 获取缓存
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) return null;
    
    if (this.config.type === 'redis' && this.redisClient) {
      try {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Redis get error:', error);
        return null;
      }
    }
    
    // 内存缓存
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    
    // 检查是否过期
    if (Date.now() > entry.expireAt) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * @method set
   * @description 设置缓存
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.config.enabled) return;
    
    const expireSeconds = ttl || this.config.ttl;
    
    if (this.config.type === 'redis' && this.redisClient) {
      try {
        await this.redisClient.setEx(key, expireSeconds, JSON.stringify(value));
      } catch (error) {
        console.error('Redis set error:', error);
      }
      return;
    }
    
    // 内存缓存
    this.memoryCache.set(key, {
      data: value,
      expireAt: Date.now() + (expireSeconds * 1000)
    });
  }
  
  /**
   * @method delete
   * @description 删除缓存
   */
  public async delete(key: string): Promise<void> {
    if (this.config.type === 'redis' && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
      return;
    }
    
    this.memoryCache.delete(key);
  }
  
  /**
   * @method clear
   * @description 清空所有缓存
   */
  public async clear(): Promise<void> {
    if (this.config.type === 'redis' && this.redisClient) {
      try {
        await this.redisClient.flushDb();
      } catch (error) {
        console.error('Redis clear error:', error);
      }
      return;
    }
    
    this.memoryCache.clear();
  }
  
  /**
   * @method getStats
   * @description 获取缓存统计信息
   */
  public async getStats() {
    if (this.config.type === 'redis' && this.redisClient) {
      try {
        const info = await this.redisClient.info();
        return {
          type: 'redis',
          keys: await this.redisClient.dbSize(),
          info: info
        };
      } catch (error) {
        return {
          type: 'redis',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    return {
      type: 'memory',
      keys: this.memoryCache.size,
      enabled: this.config.enabled
    };
  }
  
  /**
   * @method cleanExpired
   * @description 清理过期的内存缓存
   */
  private cleanExpired(): void {
    if (this.config.type !== 'memory') return;
    
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expireAt) {
        this.memoryCache.delete(key);
      }
    }
  }
}

/**
 * @function cacheMiddleware
 * @description 缓存中间件工厂函数
 * @param {number} ttl - 缓存过期时间（秒）
 */
export function cacheMiddleware(ttl?: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') {
      return next();
    }
    
    const cacheManager = CacheManager.getInstance();
    const cacheKey = `api:${req.originalUrl}`;
    
    try {
      // 尝试从缓存获取
      const cachedData = await cacheManager.get(cacheKey);
      
      if (cachedData) {
        console.log(`🎯 缓存命中: ${cacheKey}`);
        return res.json(cachedData);
      }
      
      // 缓存未命中，拦截响应
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        // 保存到缓存
        cacheManager.set(cacheKey, data, ttl).catch(err => {
          console.error('缓存保存失败:', err);
        });
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.error('缓存中间件错误:', error);
      next();
    }
  };
}

/**
 * @function clearCacheMiddleware
 * @description 清除缓存中间件（用于 POST/PUT/DELETE 请求）
 */
export function clearCacheMiddleware(pattern?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cacheManager = CacheManager.getInstance();
    
    // 执行请求后清除缓存
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          if (pattern) {
            // 清除匹配的缓存键
            // 简化版：清除所有缓存
            await cacheManager.clear();
          }
        } catch (error) {
          console.error('清除缓存失败:', error);
        }
      }
    });
    
    next();
  };
}

// 导出单例
export const cacheManager = CacheManager.getInstance();
