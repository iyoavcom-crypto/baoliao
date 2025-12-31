import { User } from "./index.js";
import { Role } from "../role/index.js";
import { UserDevice } from "./device.js";
import { UserSession } from "./session";
import { UserFriend } from "./friend.js";
import { FriendRequestEvent } from "./friend-request-event.js";
import { MessageRequest } from "../../message/request.js";

/**
 * @function associateUser
 * @description 建立 User 与 Role 的关联
 */
export function associateUser(): void {
  User.belongsTo(Role, {
    foreignKey: { name: "roleId", allowNull: false },
    as: "role",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  Role.hasMany(User, {
    foreignKey: { name: "roleId", allowNull: false },
    as: "users",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  User.hasMany(UserDevice, {
    foreignKey: { name: "userId", allowNull: false },
    as: "devices",
    onDelete: "CASCADE",
  });

  UserDevice.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
    as: "user",
  });

  User.hasMany(UserSession, {
    foreignKey: { name: "userId", allowNull: false },
    as: "sessions",
    onDelete: "CASCADE",
  });

  UserSession.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
    as: "user",
  });

  // UserFriend Associations
  User.hasMany(UserFriend, {
    foreignKey: "userId",
    as: "friends", // 我添加的好友
  });
  UserFriend.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });
  UserFriend.belongsTo(User, {
    foreignKey: "friendId",
    as: "friend",
  });
  
  // FriendRequestEvent
  FriendRequestEvent.belongsTo(User, { foreignKey: "userId", as: "requester" });
  FriendRequestEvent.belongsTo(User, { foreignKey: "friendId", as: "target" });

  // MessageRequest
  MessageRequest.belongsTo(User, { foreignKey: "fromUserId", as: "sender" });
  MessageRequest.belongsTo(User, { foreignKey: "toUserId", as: "receiver" });
}
