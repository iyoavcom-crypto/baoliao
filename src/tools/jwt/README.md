# JWT 工具模块（web/jwt）

面向 Node 22（ESM，TypeScript）的 JWT 模块集合：服务类、密钥提供器工厂、守卫与错误模型，以及常用工具函数。模块已统一采用“异步函数以 Async 结尾”的命名规范。

## 安装与导入

```ts
// 路径：src/tools/jwt（TS 别名：@/tools/jwt）
import {
  JwtService,
  createHSKeyProvider,
  createRSKeyProvider,
  createKeyProvider,
  TokenKind,
  UserStatus,
  createJwtServiceFromEnv,
  Guards,
  AuthError,
  AuthErrorCode,
  ttlToSeconds,
  nowSec,
  nanoid,
  shortId,
} from "@/tools/jwt";

// 若使用编译后相对导入，请使用 .js 扩展名
// import { JwtService } from "./index.js";
```

## 快速上手（HS256）

```ts
import { createJwtServiceFromEnv, TokenKind, UserStatus } from "@/tools/jwt";

// 推荐：根据环境变量快速创建服务实例
const jwt = createJwtServiceFromEnv();

const payload = { sub: "u_1", code: "user_1", roleId: "user", status: UserStatus.Active, tokenType: TokenKind.Access } as const;
const token = await jwt.signAsync(TokenKind.Access, payload);
const decoded = await jwt.verifyAsync(token);
```

> 说明：当前策略默认不设置 `exp`（长期有效）。如需过期控制，可在自定义实现中按 `ttlToSeconds(cfg.accessTokenTTL)` 计算过期秒并在签发时设置 `.setExpirationTime(now + ttl)`。

## 刷新令牌轮转（Refresh → Access+Refresh）

```ts
import { JwtService, createHSKeyProvider } from "@/tools/jwt";

const keys = createHSKeyProvider({ secret: process.env.JWT_SECRET!, kid: "hs:k1" });
const jwt = new JwtService(keys, { algorithm: "HS256", accessTokenTTL: "15m", refreshTokenTTL: "7d", enableDeviceBinding: false, enableRedisBlacklist: false });

const { access, refresh, payload } = await jwt.rotateRefreshAsync(
  oldRefreshToken,
  (p) => ({ ...p, scope: ["user"] })
);
```

## RSA 示例（RS256）

```ts
import { JwtService, createRSKeyProvider, TokenKind } from "@/tools/jwt";

const keys = createRSKeyProvider({
  privateKeyPath: "./data/pem/private.pem",
  publicKeyPath: "./data/pem/public.pem",
  kid: "rs:k1"
});
const jwt = new JwtService(keys, { algorithm: "RS256", accessTokenTTL: "15m", refreshTokenTTL: "7d", enableDeviceBinding: false, enableRedisBlacklist: false });

const token = await jwt.signAsync(TokenKind.Access, { sub: "u_2", code: "user_2", roleId: "admin", status: UserStatus.Active, tokenType: TokenKind.Access });
```

## 守卫与错误

```ts
import { Guards, AuthError, AuthErrorCode } from "@/tools/jwt";

try {
  Guards.assertRole({ roleId: "user" } as any, ["admin"]);
} catch (e) {
  if (e instanceof AuthError && e.code === AuthErrorCode.Forbidden) {
    // 角色不匹配
  }
}
```

## 命名规范迁移说明（必读）

- 服务类方法：
  - `sign` → `signAsync`
  - `verify` → `verifyAsync`
  - `rotateRefresh` → `rotateRefreshAsync`
- 密钥提供器接口方法：
  - `getActiveKey` → `getActiveKeyAsync`
  - `getVerifyKey` → `getVerifyKeyAsync`
  - `getKeyId` → `getKeyIdAsync`

## 目录结构

```
jwt/
├── index.ts          # 模块统一导出（barrel）
├── service.ts        # JWT核心服务（JwtService类）
├── utils.ts          # 工具函数（时间处理、ID生成）
├── errors/           # 错误处理
│   └── index.ts      # AuthError类与错误码
├── guards/           # 守卫函数
│   ├── index.ts      # 守卫函数导出
│   ├── code.ts       # 用户代码验证守卫
│   ├── device.ts     # 设备绑定验证守卫
│   ├── id.ts         # 用户ID验证守卫
│   ├── role.ts       # 角色验证守卫
│   ├── scopes.ts     # 作用域验证守卫
│   └── team.ts       # 团队验证守卫
├── jwt-env/          # 环境变量读取与校验（HS/RS 支持）
│   ├── index.ts      # `jwtEnv` 加载并冻结配置
│   └── types.ts      # `JwtEnv` 类型定义
└── keys/             # 密钥管理
    └── index.ts      # 密钥工厂（createHSKeyProvider/createRSKeyProvider/createKeyProvider）
```

## 主要功能

### JWT服务 (service.ts)

**JwtService 类**
- `signAsync(kind: TokenKind, payload: JwtUserPayload): Promise<string>` — JWT 签发
- `verifyAsync(token: string): Promise<JwtUserPayload>` — JWT 验证
- `rotateRefreshAsync(refreshToken: string, mutate?: (p: JwtUserPayload) => JwtUserPayload): Promise<{ access: string; refresh: string; payload: JwtUserPayload }>` — 刷新令牌轮转

### 密钥工厂与接口 (keys/)

- `createHSKeyProvider(options: HSKeyOptions): KeyProvider` — HS256 对称密钥
- `createRSKeyProvider(options: RSKeyOptions): KeyProvider` — RS256 非对称密钥
- `createKeyProvider(options: KeyFactoryOptions): KeyProvider` — 统一工厂（HS/RS）

> HS 选项：`secret? | secretEnv? | secretPath? | kid?`
>
> RS 选项：`privateKeyPath? | publicKeyPath? | privateKeyEnv? | publicKeyEnv? | kid?`

### TokenKind

```ts
enum TokenKind {
  Access = "access",
  Refresh = "refresh"
}
```

### SecurityConfig

```ts
interface SecurityConfig {
  algorithm: "HS256" | "RS256";     // JWT签名算法
  accessTokenTTL: string;             // 访问令牌TTL
  refreshTokenTTL: string;            // 刷新令牌TTL
  enableDeviceBinding: boolean;       // 是否启用设备绑定
  enableRedisBlacklist: boolean;      // 是否启用Redis黑名单
}
```

### TTL 格式支持

- `s`: 秒 (例: `30s`)
- `m`: 分钟 (例: `15m`)
- `h`: 小时 (例: `2h`)
- `d`: 天 (例: `7d`)

### 环境变量（createJwtServiceFromEnv）

```bash
# 算法与 TTL
JWT_ALGORITHM=HS256|RS256
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# HS256（二选一：secret 或文件路径）
JWT_SECRET=your-secret-key

# RS256（提供 PEM 文件路径）
JWT_PRIVATE_KEY_PATH=/path/to/private.pem
JWT_PUBLIC_KEY_PATH=/path/to/public.pem
```

## API 参考

### 导出符号

```ts
// 主要类与工厂
export { JwtService } from "./service.js";
export { createHSKeyProvider, createRSKeyProvider, createKeyProvider } from "./keys/index.js";
export { AuthError, AuthErrorCode } from "./errors/index.js";
export { createJwtServiceFromEnv } from "./index.js";

// 类型定义（来自 @/types/jwt）
export type { JwtUserPayload, JwtAppPayload, TokenKind, UserStatus } from "@/types/jwt";
export type { KeyProvider } from "@/types/jwt";
export type { KeySecurityConfig as SecurityConfig } from "@/types/jwt";

// 工具函数
export { ttlToSeconds, nowSec, nanoid, shortId } from "./utils.js";

// 守卫函数（命名空间）
export * as Guards from "./guards/index.js";
```

## 注意事项

- 模块系统：基于 Node.js 22 ESM
- 算法支持：HS256/RS256；`JwtService` 与 `KeyProvider` 解耦，便于扩展
- 安全：示例不设置 `exp`（长期有效）；如需过期，请按 TTL 自行设置