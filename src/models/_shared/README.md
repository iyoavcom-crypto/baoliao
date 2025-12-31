# 模型验证器 (Model Validators)

本模块提供了可复用的模型字段验证器函数，用于在Sequelize模型钩子中进行数据验证，减少重复代码并提高一致性。

## 使用场景

在Sequelize模型的 `beforeSave`、`beforeCreate`、`beforeUpdate` 等钩子中验证字段值。

---

## API 文档

### `nonEmptyString(value, fieldName?)`

验证字符串非空（去除前后空格后不为空）。

**参数:**
- `value: any` - 待验证的值
- `fieldName?: string` - 字段名（用于生成错误消息，默认"字段"）

**返回:** `ValidatorResult`

**示例:**

```typescript
import { nonEmptyString, assertValid } from "@/models/_shared/validators";

UserModel.beforeSave(async (user) => {
  if (user.changed("username")) {
    assertValid(nonEmptyString(user.username, "用户名"));
  }
});
```

---

### `positiveNumber(value, fieldName?)`

验证值是否为正数（大于0）。

**参数:**
- `value: any` - 待验证的值
- `fieldName?: string` - 字段名

**返回:** `ValidatorResult`

**示例:**

```typescript
import { positiveNumber, assertValid } from "@/models/_shared/validators";

ProductModel.beforeSave(async (product) => {
  assertValid(positiveNumber(product.price, "价格"));
  assertValid(positiveNumber(product.stock, "库存"));
});
```

---

### `numberInRange(value, min, max, fieldName?)`

验证数字是否在指定范围内（包含边界）。

**参数:**
- `value: any` - 待验证的值
- `min: number` - 最小值（包含）
- `max: number` - 最大值（包含）
- `fieldName?: string` - 字段名

**返回:** `ValidatorResult`

**示例:**

```typescript
import { numberInRange, assertValid } from "@/models/_shared/validators";

GroupModel.beforeSave(async (group) => {
  // 验证群容量在2-5000之间
  assertValid(numberInRange(group.capacity, 2, 5000, "群容量"));
  
  // 验证年龄在18-100之间
  assertValid(numberInRange(group.minAge, 18, 100, "最小年龄"));
});
```

---

### `minLength(value, min, fieldName?)`

验证字符串最小长度。

**参数:**
- `value: any` - 待验证的值
- `min: number` - 最小长度
- `fieldName?: string` - 字段名

**返回:** `ValidatorResult`

**示例:**

```typescript
import { minLength, assertValid } from "@/models/_shared/validators";

UserModel.beforeSave(async (user) => {
  assertValid(minLength(user.password, 8, "密码"));
});
```

---

### `maxLength(value, max, fieldName?)`

验证字符串最大长度。

**参数:**
- `value: any` - 待验证的值
- `max: number` - 最大长度
- `fieldName?: string` - 字段名

**返回:** `ValidatorResult`

**示例:**

```typescript
import { maxLength, assertValid } from "@/models/_shared/validators";

GroupModel.beforeSave(async (group) => {
  assertValid(maxLength(group.name, 50, "群名称"));
  assertValid(maxLength(group.description, 500, "群描述"));
});
```

---

### `isEnum(value, enumValues, fieldName?)`

验证值是否在枚举列表中。

**参数:**
- `value: any` - 待验证的值
- `enumValues: any[]` - 枚举值数组
- `fieldName?: string` - 字段名

**返回:** `ValidatorResult`

**示例:**

```typescript
import { isEnum, assertValid } from "@/models/_shared/validators";

const USER_STATUSES = ['active', 'inactive', 'suspended', 'deleted'];

UserModel.beforeSave(async (user) => {
  assertValid(isEnum(user.status, USER_STATUSES, "用户状态"));
});
```

---

### `matchPattern(value, pattern, fieldName?, patternDesc?)`

验证值是否匹配正则表达式模式。

**参数:**
- `value: any` - 待验证的值
- `pattern: RegExp` - 正则表达式
- `fieldName?: string` - 字段名
- `patternDesc?: string` - 模式描述（用于错误消息）

**返回:** `ValidatorResult`

**示例:**

```typescript
import { matchPattern, assertValid } from "@/models/_shared/validators";

UserModel.beforeSave(async (user) => {
  assertValid(matchPattern(
    user.email,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "邮箱",
    "必须是有效的邮箱格式"
  ));
  
  assertValid(matchPattern(
    user.phone,
    /^1[3-9]\d{9}$/,
    "手机号",
    "必须是11位有效手机号"
  ));
});
```

---

### `combineValidators(value, validators)`

组合多个验证器，按顺序执行，返回第一个失败的结果。

**参数:**
- `value: any` - 待验证的值
- `validators: Array<(value: any) => ValidatorResult>` - 验证器函数数组

**返回:** `ValidatorResult` - 第一个失败的结果或成功

**示例:**

```typescript
import { combineValidators, nonEmptyString, minLength, maxLength, assertValid } from "@/models/_shared/validators";

UserModel.beforeSave(async (user) => {
  // 组合多个验证器验证用户名
  const usernameValidation = combineValidators(user.username, [
    (val) => nonEmptyString(val, "用户名"),
    (val) => minLength(val, 3, "用户名"),
    (val) => maxLength(val, 20, "用户名"),
    (val) => matchPattern(val, /^[a-zA-Z0-9_]+$/, "用户名", "只能包含字母、数字和下划线")
  ]);
  
  assertValid(usernameValidation);
});
```

---

### `assertValid(result)`

断言验证结果，如果验证失败则抛出错误。

**参数:**
- `result: ValidatorResult` - 验证结果

**抛出:** `Error` - 如果验证失败

**示例:**

```typescript
import { numberInRange, assertValid } from "@/models/_shared/validators";

GroupModel.beforeSave(async (group) => {
  const result = numberInRange(group.capacity, 2, 5000, "群容量");
  assertValid(result); // 验证失败时抛出错误
});
```

---

## ValidatorResult 接口

```typescript
interface ValidatorResult {
  valid: boolean;    // 是否验证通过
  error?: string;    // 错误消息（如果验证失败）
}
```

---

## 完整示例

### 示例 1: 群组模型验证

```typescript
import { numberInRange, assertValid } from "@/models/_shared/validators";
import type { Group } from "./index.js";

export function setupGroupHooks(GroupModel: typeof Group): void {
  GroupModel.beforeSave(async (group) => {
    // 验证群容量范围 (2-5000)
    assertValid(numberInRange(group.capacity, 2, 5000, "群容量"));

    // 记录容量变更时间
    if (group.changed('capacity')) {
      group.capacityUpdatedAt = new Date();
    }
  });
}
```

**重构前对比:**
```typescript
// Before (7 lines)
if (group.capacity < 2) {
  throw new Error('群容量不能少于2人');
}
if (group.capacity > 5000) {
  throw new Error('群容量不能超过5000人');
}

// After (1 line)
assertValid(numberInRange(group.capacity, 2, 5000, "群容量"));
```

---

### 示例 2: 用户模型复合验证

```typescript
import { 
  combineValidators, 
  nonEmptyString, 
  minLength, 
  maxLength, 
  matchPattern,
  isEnum,
  assertValid 
} from "@/models/_shared/validators";

const USER_ROLES = ['admin', 'user', 'moderator'];

UserModel.beforeSave(async (user) => {
  // 用户名复合验证
  if (user.changed('username')) {
    assertValid(combineValidators(user.username, [
      (val) => nonEmptyString(val, "用户名"),
      (val) => minLength(val, 3, "用户名"),
      (val) => maxLength(val, 20, "用户名"),
      (val) => matchPattern(val, /^[a-zA-Z0-9_]+$/, "用户名")
    ]));
  }

  // 邮箱验证
  if (user.changed('email')) {
    assertValid(matchPattern(
      user.email,
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "邮箱"
    ));
  }

  // 角色验证
  if (user.changed('role')) {
    assertValid(isEnum(user.role, USER_ROLES, "用户角色"));
  }
});
```

---

### 示例 3: 产品模型验证

```typescript
import { 
  positiveNumber, 
  numberInRange, 
  nonEmptyString,
  maxLength,
  assertValid 
} from "@/models/_shared/validators";

ProductModel.beforeSave(async (product) => {
  // 名称验证
  assertValid(nonEmptyString(product.name, "产品名称"));
  assertValid(maxLength(product.name, 100, "产品名称"));

  // 价格验证
  assertValid(positiveNumber(product.price, "价格"));
  
  // 库存验证
  assertValid(numberInRange(product.stock, 0, 999999, "库存"));
  
  // 折扣验证 (0-100%)
  if (product.discount !== null) {
    assertValid(numberInRange(product.discount, 0, 100, "折扣"));
  }
});
```

---

## 高级用法

### 自定义验证器

可以创建自定义验证器函数：

```typescript
import type { ValidatorResult } from "@/models/_shared/validators";

function isValidUrl(value: any, fieldName: string = "URL"): ValidatorResult {
  try {
    new URL(value);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: `${fieldName}格式不正确`
    };
  }
}

// 使用自定义验证器
GroupModel.beforeSave(async (group) => {
  if (group.websiteUrl) {
    assertValid(isValidUrl(group.websiteUrl, "网站地址"));
  }
});
```

---

### 条件验证

```typescript
UserModel.beforeSave(async (user) => {
  // 只有VIP用户需要验证会员等级
  if (user.isVip) {
    assertValid(numberInRange(user.vipLevel, 1, 10, "VIP等级"));
  }
  
  // 只在创建时验证密码
  if (user.isNewRecord) {
    assertValid(minLength(user.password, 8, "密码"));
  }
});
```

---

### 手动处理验证结果

如果不想使用 `assertValid` 抛出错误，可以手动处理：

```typescript
import { numberInRange } from "@/models/_shared/validators";

GroupModel.beforeSave(async (group) => {
  const result = numberInRange(group.capacity, 2, 5000, "群容量");
  
  if (!result.valid) {
    // 自定义错误处理
    logger.warn(`Validation failed: ${result.error}`);
    group.capacity = 200; // 使用默认值
  }
});
```

---

## 最佳实践

### 1. 始终使用 assertValid

```typescript
// ✅ 推荐
assertValid(numberInRange(value, min, max, "字段名"));

// ❌ 不推荐
const result = numberInRange(value, min, max, "字段名");
if (!result.valid) {
  throw new Error(result.error);
}
```

### 2. 使用有意义的字段名

```typescript
// ✅ 推荐
assertValid(minLength(user.password, 8, "密码"));

// ❌ 不推荐
assertValid(minLength(user.password, 8)); // 错误消息: "字段长度不能少于8个字符"
```

### 3. 组合相关验证

```typescript
// ✅ 推荐 - 使用 combineValidators
assertValid(combineValidators(username, [
  (val) => nonEmptyString(val, "用户名"),
  (val) => minLength(val, 3, "用户名"),
  (val) => maxLength(val, 20, "用户名")
]));

// ❌ 不推荐 - 分散的验证
assertValid(nonEmptyString(username, "用户名"));
assertValid(minLength(username, 3, "用户名"));
assertValid(maxLength(username, 20, "用户名"));
```

### 4. 只验证变更的字段

```typescript
// ✅ 推荐
if (user.changed('email')) {
  assertValid(matchPattern(user.email, emailRegex, "邮箱"));
}

// ❌ 不推荐 - 每次保存都验证
assertValid(matchPattern(user.email, emailRegex, "邮箱"));
```

---

## 错误消息自定义

所有验证器都支持自定义字段名，生成的错误消息格式为：

- `nonEmptyString`: "{字段名}不能为空"
- `positiveNumber`: "{字段名}必须是正数"
- `numberInRange`: "{字段名}必须在{min}到{max}之间"
- `minLength`: "{字段名}长度不能少于{min}个字符"
- `maxLength`: "{字段名}长度不能超过{max}个字符"
- `isEnum`: "{字段名}必须是以下值之一: {values}"
- `matchPattern`: "{字段名}格式不正确{, description}"

---

## 迁移指南

### 现有模型钩子迁移:

**Before:**
```typescript
GroupModel.beforeSave(async (group) => {
  if (group.capacity < 2) {
    throw new Error('群容量不能少于2人');
  }
  if (group.capacity > 5000) {
    throw new Error('群容量不能超过5000人');
  }
});
```

**After:**
```typescript
import { numberInRange, assertValid } from "@/models/_shared/validators";

GroupModel.beforeSave(async (group) => {
  assertValid(numberInRange(group.capacity, 2, 5000, "群容量"));
});
```

**代码减少: ~70%**

---

## 相关模块

- **HTTP验证**: `src/utils/validation/http-validation.ts`
- **WebSocket验证**: `src/utils/validation/ws-validation.ts`
- **模型定义**: `src/models/`
