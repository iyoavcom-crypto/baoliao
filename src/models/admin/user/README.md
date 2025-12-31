# user 模型文档

## 基本信息
- 表名: "user"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | TypeScript 类型 | SQL 类型 | 允许空 | 默认值 | 唯一 | 引用 | 备注 |
|---|---|---|---|---|---|---|---|---|
| id | 主键 | string | DataTypes.STRING(36) | false | DataTypes.UUIDV4 |  |  | 主键 |
| vip | 是否 VIP 用户 | boolean | DataTypes.BOOLEAN | false | false |  |  | 是否 VIP 用户（false：否；true：是） |
| email | 邮箱 | string | DataTypes.STRING(255) | false | 无 | true |  |  |
| password | 密码哈希 | string | DataTypes.STRING(200) | false | 无 |  |  | 密码哈希（scrypt） |
| roleId | 角色ID | string | DataTypes.STRING(36) | false | "user" |  | { model: "role", key: "id" } | 角色ID（默认 user） |
| state | 用户状态 | UserState | DataTypes.ENUM("active", "deleted") | false | "active" |  |  | 用户状态 |
| code | 编码 | string | DataTypes.STRING(64) | true | 无 | true |  |  |
| name | 用户名 | string | DataTypes.STRING(100) | true | 无 |  |  | 用户名 |
| avatar | 头像URL | string | DataTypes.STRING(255) | true | 无 |  |  | 头像URL |
| pin | 二级密码 | string | DataTypes.STRING(255) | true | 无 |  |  | 二级密码（AES-256-GCM 加密；默认不序列化返回） |
| createdAt | 创建时间 | Date | DataTypes.DATE | false | 无 |  |  | 创建时间 |
| updatedAt | 更新时间 | Date | DataTypes.DATE | false | 无 |  |  | 更新时间 |

## 关系
- User.belongsTo(Role) (as=role, foreignKey=roleId, onUpdate=CASCADE, onDelete=RESTRICT)

## 枚举/类型
- UserState: "active", "deleted"

## DTO/白名单
- 列表字段: id, code, name, email, state, roleId, vip, avatar
- 详情字段: id, code, name, email, state, roleId, vip, avatar, createdAt, updatedAt
- 可创建字段: state, email, password, roleId, name, avatar
- 可更新字段: state, roleId, name, avatar, vip, state
- 可筛选字段: state, roleId, vip
- 可关键词搜索字段: name, email
- 可排序字段: createdAt, id
- 所有字段: id, code, email, password, pin, roleId, vip, state, name, avatar, createdAt, updatedAt
