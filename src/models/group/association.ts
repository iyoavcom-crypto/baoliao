/**
 * @packageDocumentation
 * @module models/group/association
 * @description Group 模型关联定义
 */

import { Group } from "./index";
import { GroupMember } from "./member";
import { GroupJoinRequest } from "./join-request";
import { GroupInvite } from "./invite";
import { GroupCapacity } from "./capacity";
import { GroupEvent } from "./event";
import { User } from "../admin/user";

/**
 * @function associateGroup
 * @description 建立 Group 与其他模型的关联
 */
export function associateGroup() {
  // Group 属于 Owner (User)
  Group.belongsTo(User, {
    as: "owner",
    foreignKey: "userId",
    constraints: false,
  });

  // 反向关联：User 拥有多个群组
  User.hasMany(Group, {
    as: "ownedGroups",
    foreignKey: "userId",
    constraints: false,
  });

  // Group -> GroupMember
  Group.hasMany(GroupMember, {
    as: "members",
    foreignKey: "groupId",
    constraints: false,
  });
  GroupMember.belongsTo(Group, {
    as: "group",
    foreignKey: "groupId",
    constraints: false,
  });

  // GroupMember -> User
  GroupMember.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
    constraints: false,
  });
  User.hasMany(GroupMember, {
    as: "groupMemberships",
    foreignKey: "userId",
    constraints: false,
  });

  // Group -> GroupJoinRequest
  Group.hasMany(GroupJoinRequest, {
    as: "joinRequests",
    foreignKey: "groupId",
    constraints: false,
  });
  GroupJoinRequest.belongsTo(Group, {
    as: "group",
    foreignKey: "groupId",
    constraints: false,
  });
  GroupJoinRequest.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
    constraints: false,
  });

  // Group -> GroupInvite
  Group.hasMany(GroupInvite, {
    as: "invites",
    foreignKey: "groupId",
    constraints: false,
  });
  GroupInvite.belongsTo(Group, {
    as: "group",
    foreignKey: "groupId",
    constraints: false,
  });
  GroupInvite.belongsTo(User, {
    as: "creator",
    foreignKey: "creatorId",
    constraints: false,
  });

  // Group -> GroupCapacity
  Group.hasMany(GroupCapacity, {
    as: "capacityLogs",
    foreignKey: "groupId",
    constraints: false,
  });
  GroupCapacity.belongsTo(Group, {
    as: "group",
    foreignKey: "groupId",
    constraints: false,
  });

  // Group -> GroupEvent
  Group.hasMany(GroupEvent, {
    as: "events",
    foreignKey: "groupId",
    constraints: false,
  });
  GroupEvent.belongsTo(Group, {
    as: "group",
    foreignKey: "groupId",
    constraints: false,
  });
  
  // GroupEvent -> User (Operator)
  GroupEvent.belongsTo(User, {
    as: "operator",
    foreignKey: "userId",
    constraints: false,
  });
}
