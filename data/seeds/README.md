# 数据库种子数据

## 目录结构

```
data/seeds/
├── roles.seed.json      # 角色种子数据
├── loader.ts            # 种子数据加载器
└── README.md            # 本文档
```

## 角色种子数据

### 包含的角色（共12个）

#### 系统角色（system）
- `admin` - 管理员（最高权限）
- `moderator` - 版主（内容管理）
- `customer_service` - 客服
- `content_reviewer` - 内容审核员

#### 项目角色（project）
- `project_owner` - 项目所有者
- `project_admin` - 项目管理员
- `project_member` - 项目成员
- `developer` - 开发者
- `tester` - 测试人员

#### 用户角色（user）
- `user` - 普通用户（默认角色）
- `vip` - VIP用户
- `guest` - 访客

## 使用方法

### 1. 加载所有种子数据

```bash
npm run seed
```

### 2. 只加载角色数据

```bash
npm run seed:roles
```

### 3. 在代码中使用

```typescript
import { loadRoleSeeds, loadAllSeeds } from "data/seeds/loader.js";

// 加载所有种子数据
await loadAllSeeds();

// 只加载角色数据
await loadRoleSeeds();
```

## 种子数据特性

- **幂等性**: 使用 `upsert` 方式插入，重复执行不会重复创建
- **自动日志**: 详细记录创建和更新的数据条数
- **错误处理**: 失败时会抛出异常并记录详细日志

## 数据格式

### roles.seed.json

```json
[
  {
    "id": "admin",           // 角色ID（唯一标识）
    "name": "管理员",         // 角色名称（中文）
    "group": "system"        // 角色分组（system/project/user）
  }
]
```

## 添加新的种子数据

### 步骤1: 创建种子数据文件

在 `data/seeds/` 目录下创建新的 `.seed.json` 文件：

```json
// users.seed.json
[
  {
    "id": "uuid-here",
    "phone": "13800138000",
    "name": "测试用户",
    "roleId": "user"
  }
]
```

### 步骤2: 在 loader.ts 中添加加载函数

```typescript
export async function loadUserSeeds(): Promise<void> {
  const seedFilePath = join(__dirname, "users.seed.json");
  const seedData = JSON.parse(readFileSync(seedFilePath, "utf-8"));
  
  for (const userData of seedData) {
    await User.upsert(userData);
  }
  
  logger.info(`用户种子数据加载完成`);
}
```

### 步骤3: 在 loadAllSeeds 中调用

```typescript
export async function loadAllSeeds(): Promise<void> {
  await loadRoleSeeds();
  await loadUserSeeds();  // 新增
  // ... 其他种子数据
}
```

## 注意事项

1. **外键约束**: 确保加载顺序符合外键依赖关系
2. **唯一性约束**: ID和唯一字段不要重复
3. **生产环境**: 谨慎使用，建议只在开发/测试环境执行
4. **备份数据**: 执行前建议备份现有数据

## 常见问题

### Q: 种子数据会覆盖现有数据吗？

A: 不会。使用 `upsert` 方式，如果 ID 已存在则更新，不存在则创建。

### Q: 如何清空数据重新加载？

A: 使用 `clearRoleSeeds()` 函数（谨慎使用）：

```typescript
import { clearRoleSeeds } from "data/seeds/loader.js";
await clearRoleSeeds();
```

### Q: 种子数据加载失败怎么办？

A: 查看日志输出，检查：
- 数据库连接是否正常
- 数据格式是否正确
- 是否有外键约束冲突

## 日志输出示例

```
[seeds] 开始加载角色种子数据...
[seeds] 读取到 12 条角色数据
[seeds] 创建角色: admin - 管理员
[seeds] 创建角色: user - 普通用户
...
[seeds] 角色种子数据加载完成: 创建 12 条, 更新 0 条
```
