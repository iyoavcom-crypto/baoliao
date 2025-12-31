/**
 * @packageDocumentation
 * @module models/admin/role
 * @since 1.0.0 (2025-10-23)
 * @author Z-kali
 * @description Role 模型定义（用于 User.roleId 外键关联）
 * @path api/src/models/admin/role.ts
 * @see api/src/models/admin/role/types.ts
 */

import { DataTypes, Model, Sequelize } from "sequelize";
import type { RoleAttributes } from "@/types/models/role";
import { RoleGroup } from "@/types/models/role"; // 导入枚举
import { Op } from "sequelize";

/**
 * @type RoleCreationAttributes
 * @description 创建入参类型（id 可选）
 */
export type RoleCreationAttributes = RoleAttributes;

/**
 * @class Role
 * @description 角色模型类
 */
export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes {
  declare id: string;
  declare name: string;
  declare group: RoleGroup;
}

/**
 * @function initRoleModel
 * @description 初始化 Role 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof Role} 模型类
 */
export function initRoleModel(sequelize: Sequelize): typeof Role {
  Role.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        comment: "主键（字符串）",
      },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        comment: "角色名称",
      },
      group: {
        type: DataTypes.ENUM(...Object.values(RoleGroup)),
        allowNull: false,
        defaultValue: RoleGroup.USER, // 默认 user
        comment: "角色分组（枚举：system/project/user）",
      },
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "role",
      timestamps: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      comment: "角色表",
      indexes: [{ name: "idx_role_group", fields: ["group"] }],
    }
  );

  return Role;
}

export async function ensureDefaultRoles(): Promise<void> {
  const existing = await Role.findAll({
    where: { id: { [Op.in]: ["user"] } },
    attributes: ["id"],
  });
  const have = new Set(existing.map((r) => r.id));
  if (!have.has("user")) {
    await Role.create({ id: "user", name: "user", group: RoleGroup.USER });
  }
}
