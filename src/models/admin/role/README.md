# role 模型文档

## 基本信息
- 表名: "role"
- 时间戳: false

## 字段
| 字段 | 中文名 | TypeScript 类型 | SQL 类型 | 允许空 | 默认值 | 唯一 | 引用 | 备注 |
|---|---|---|---|---|---|---|---|---|
| id | 主键 | string | DataTypes.STRING(36) | false | 无 |  |  | 主键（字符串） |
| name | 角色名称 | string | DataTypes.STRING(30) | false | 无 | true |  | 角色名称 |
| group | 角色分组 | RoleGroup | DataTypes.ENUM(...Object.values(RoleGroup)) | false | RoleGroup.USER |  |  | 角色分组（枚举：system/project/user） |

## 关系
无

## 枚举/类型
- RoleGroup: "system", "project", "user"

## DTO/白名单
无
