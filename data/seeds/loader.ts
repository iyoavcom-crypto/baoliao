/**
 * @packageDocumentation
 * @module seeds/loader
 * @since 1.0.0 (2025-12-30)
 * @author Z-kali
 * @description 数据库种子数据加载器
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Role } from "../../src/models/index.js";
import { getLogger } from "../../src/tools/logging/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logger = getLogger("seeds");

/**
 * @interface SeedData
 * @description 种子数据结构
 */
interface RoleSeedData {
  id: string;
  name: string;
  group: "system" | "project" | "user";
}

/**
 * @function loadRoleSeeds
 * @description 加载角色种子数据
 * @returns {Promise<void>}
 */
export async function loadRoleSeeds(): Promise<void> {
  try {
    console.log("  → 开始加载角色种子数据...");
    
    // 读取种子数据文件
    const seedFilePath = join(__dirname, "roles.seed.json");
    console.log(`  → 读取文件: ${seedFilePath}`);
    const seedData: RoleSeedData[] = JSON.parse(
      readFileSync(seedFilePath, "utf-8")
    );
    
    console.log(`  → 读取到 ${seedData.length} 条角色数据`);
    
    // 批量插入或更新
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const roleData of seedData) {
      const [role, created] = await Role.upsert(roleData, {
        returning: true,
      });
      
      if (created) {
        createdCount++;
        console.log(`    ✓ 创建: ${roleData.id} - ${roleData.name}`);
      } else {
        updatedCount++;
        console.log(`    ↻ 更新: ${roleData.id} - ${roleData.name}`);
      }
    }
    
    console.log(`\n  ✓ 角色种子数据加载完成: 创建 ${createdCount} 条, 更新 ${updatedCount} 条\n`);
  } catch (error) {
    console.error("  ✗ 加载角色种子数据失败:", error);
    throw error;
  }
}

/**
 * @function loadAllSeeds
 * @description 加载所有种子数据
 * @returns {Promise<void>}
 */
export async function loadAllSeeds(): Promise<void> {
  console.log("\n开始加载所有种子数据...");
  
  try {
    await loadRoleSeeds();
    // 可以在这里添加更多种子数据加载
    // await loadUserSeeds();
    // await loadGroupSeeds();
    
    console.log("✓ 所有种子数据加载完成");
  } catch (error) {
    console.error("✗ 加载种子数据失败:", error);
    throw error;
  }
}

/**
 * @function clearRoleSeeds
 * @description 清空角色数据（谨慎使用）
 * @returns {Promise<void>}
 */
export async function clearRoleSeeds(): Promise<void> {
  logger.warn("清空角色数据...");
  await Role.destroy({ where: {}, truncate: true });
  logger.info("角色数据已清空");
}

// 主执行函数
async function main() {
  try {
    console.log("\n=== 开始执行种子数据脚本 ===");
    
    // 导入数据库初始化
    console.log("[1/3] 导入配置模块...");
    const { initDatabaseAsync } = await import("../../src/config/index.js");
    
    // 初始化数据库连接并同步模型
    console.log("[2/3] 初始化数据库连接并同步模型...");
    await initDatabaseAsync({ sync: true, force: false });
    console.log("✓ 数据库初始化完成");
    
    // 加载种子数据
    console.log("[3/3] 加载种子数据...");
    await loadAllSeeds();
    
    console.log("\n✓ 种子数据脚本执行成功\n");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ 种子数据脚本执行失败:", error);
    process.exit(1);
  }
}

// 如果直接运行此脚本，执行种子数据加载
if (import.meta.url.startsWith('file://')) {
  const modulePath = import.meta.url.slice(7); // 移除 'file://'
  const scriptPath = process.argv[1];
  
  // Windows路径规范化比较
  const normalize = (p: string) => p.replace(/\\/g, '/').toLowerCase();
  
  if (normalize(modulePath).includes(normalize(scriptPath).replace(/^\w:/, ''))) {
    main();
  }
}
