# 🚀 API 路由自动构建器

基于 API 元数据配置自动生成 Express 路由的系统。

## ✨ 功能特性

- ✅ **自动路由生成** - 从 JSON 配置自动创建路由
- ✅ **自动认证** - 根据 `authRequired` 自动添加认证中间件
- ✅ **角色验证** - 根据 `roles` 自动添加角色检查
- ✅ **CRUD 集成** - 自动绑定通用 CRUD 控制器
- ✅ **自定义处理器** - 支持为特定 API 提供自定义处理器
- ✅ **类型安全** - 完整的 TypeScript 类型定义

## 📋 使用方法

### 1. 定义 API 配置 (JSON)

在 `data/api/` 目录下创建 JSON 文件:

```json
[
  {
    "id": "user-list",
    "method": "GET",
    "paths": ["/users"],
    "models": ["User"],
    "roles": ["admin", "user"],
    "operateEnum": "list",
    "dto": ["UserListDTO"],
    "authRequired": true,
    "description": "获取用户列表"
  },
  {
    "id": "user-detail",
    "method": "GET",
    "paths": ["/users/:id"],
    "models": ["User"],
    "roles": ["admin", "user"],
    "operateEnum": "getById",
    "dto": ["UserDetailDTO"],
    "authRequired": true,
    "description": "获取用户详情"
  },
  {
    "id": "user-create",
    "method": "POST",
    "paths": ["/users"],
    "models": ["User"],
    "roles": ["admin"],
    "operateEnum": "create",
    "dto": ["UserCreateDTO"],
    "authRequired": true,
    "description": "创建用户"
  }
]
```

### 2. 导入并使用路由构建器

```typescript
import { buildRoutesFromApis } from '@/routes/builder';
import { allApis } from '@/config/catalog';

// 自动生成所有路由
const apiRouter = buildRoutesFromApis(allApis, {
  autoAuth: true,        // 启用自动认证
  autoRoleCheck: true,   // 启用角色检查
});

// 挂载到应用
app.use('/api', apiRouter);
```

### 3. 使用自定义处理器

```typescript
import { buildRoutesFromApis } from '@/routes/builder';
import { allApis } from '@/config/catalog';

// 创建自定义处理器映射
const customHandlers = new Map();

// 为特定 API 提供自定义处理器
customHandlers.set('user-login', async (req, res) => {
  // 自定义登录逻辑
  const { email, password } = req.body;
  // ... 验证逻辑
  res.json({ token: 'xxx' });
});

const apiRouter = buildRoutesFromApis(allApis, {
  autoAuth: true,
  customHandlers,  // 传入自定义处理器
});
```

## 🎯 API 配置字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | API 唯一标识符 |
| `method` | HttpMethod | ✅ | HTTP 方法 (GET/POST/PUT/DELETE/PATCH) |
| `paths` | string[] | ✅ | 路由路径数组,支持多个路径 |
| `models` | string[] | ✅ | 关联的模型名称(第一个为主模型) |
| `roles` | string[] | ✅ | 允许访问的角色列表 |
| `operateEnum` | OperateEnum | ✅ | 操作类型 (list/getById/create/update/delete等) |
| `dto` | string[] | ✅ | 关联的 DTO 名称 |
| `authRequired` | boolean | ❌ | 是否需要认证(默认 false) |
| `fields` | string[] | ❌ | 返回字段白名单 |
| `cache` | CacheConfig | ❌ | 缓存配置 |
| `description` | string | ❌ | API 描述 |

## 🔧 配置选项

### RouteBuilderOptions

```typescript
interface RouteBuilderOptions {
  /** 是否启用自动认证中间件 */
  autoAuth?: boolean;
  
  /** 是否启用自动角色验证 */
  autoRoleCheck?: boolean;
  
  /** 自定义路由处理器映射 */
  customHandlers?: Map<string, RequestHandler>;
}
```

## 📊 路由映射规则

路由构建器会根据 API 配置自动选择合适的 CRUD 控制器方法:

| HTTP方法 | 路径模式 | 控制器方法 |
|----------|---------|-----------|
| GET | `/resource` | `list` (分页列表) |
| GET | `/resource/all` | `all` (全量列表) |
| GET | `/resource/:id` | `getById` (详情) |
| GET | `/resource/search` | `search` (搜索) |
| GET | `/resource/tree` | `tree` (树形) |
| POST | `/resource` | `create` (创建) |
| PUT/PATCH | `/resource/:id` | `update` (更新) |
| DELETE | `/resource/:id` | `remove` (删除) |

## 💡 示例项目结构

```
data/
  api/
    ├── users.json      # 用户相关 API
    ├── groups.json     # 群组相关 API
    ├── messages.json   # 消息相关 API
    └── ...

src/
  routes/
    ├── builder/
    │   ├── index.ts    # 路由构建器核心
    │   └── README.md   # 本文档
    ├── auto/
    │   └── index.ts    # 自动生成的路由入口
    └── index.ts        # 总路由入口
```

## 🚦 集成到现有项目

在 `src/routes/index.ts` 中:

```typescript
import express from 'express';
import apiRoutes from './api';           // 手动路由
import autoRoutes from './auto';         // 自动生成路由

const router = express.Router();

// 优先使用手动定义的路由
router.use('/api', apiRoutes);

// 使用自动生成的路由(作为补充)
router.use('/auto', autoRoutes);

export default router;
```

## ⚠️ 注意事项

1. **模型注册**: 确保所有模型都在 `modelRegistry` 中注册
2. **路由冲突**: 手动路由优先级高于自动生成路由
3. **认证中间件**: 确保 `requireAuth` 中间件正确配置
4. **角色字段**: 确保用户对象包含 `role` 字段

## 🎉 优势

- **声明式配置**: 通过 JSON 声明 API,而非编写代码
- **集中管理**: 所有 API 配置集中在 `data/api/` 目录
- **自动同步**: API 文档自动与实际路由保持一致
- **减少重复**: 不需要为每个模型手动创建 CRUD 路由
- **易于维护**: 修改 API 只需更新 JSON 配置
