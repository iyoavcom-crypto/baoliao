/**
 * @packageDocumentation
 * @module models/system/association
 * @description System/Feature/Safety 模型关联定义
 */

import { FeatureDefinition } from "./feature/definition";
import { FeaturePolicy } from "./feature/policy";
import { FeatureAuditLog } from "./feature/audit";
import { Report } from "../admin/safety/report";
import { Penalty } from "../admin/safety/penalty";
import { IpBlock } from "../admin/safety/ip-block";
import { RateLimitLog } from "../admin/safety/rate-limit-log";
import { User } from "../admin/user";
import { WsConnection } from "../ws/connection";

/**
 * @function associateSystem
 * @description 建立系统级表与其他模型的关联
 */
export function associateSystem() {
  // FeatureDefinition -> FeaturePolicy
  FeatureDefinition.hasMany(FeaturePolicy, {
    as: "policies",
    foreignKey: "featureKey",
    sourceKey: "key",
    constraints: false,
  });
  FeaturePolicy.belongsTo(FeatureDefinition, {
    as: "definition",
    foreignKey: "featureKey",
    targetKey: "key",
    constraints: false,
  });

  // FeatureDefinition -> FeatureAuditLog
  FeatureDefinition.hasMany(FeatureAuditLog, {
    as: "auditLogs",
    foreignKey: "featureKey",
    sourceKey: "key",
    constraints: false,
  });
  FeatureAuditLog.belongsTo(FeatureDefinition, {
    as: "definition",
    foreignKey: "featureKey",
    targetKey: "key",
    constraints: false,
  });

  // Report Associations
  Report.belongsTo(User, {
    as: "reporter",
    foreignKey: "reporterId",
    constraints: false,
  });
  Report.belongsTo(User, {
    as: "handler",
    foreignKey: "handlerId",
    constraints: false,
  });
  // Report target polymorphic association is usually handled manually or via hooks, 
  // but we can define standard ones if keys are distinct or we use specific accessors.
  // Here we just define reporter/handler.

  // Penalty -> User
  Penalty.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
    constraints: false,
  });
  Penalty.belongsTo(User, {
    as: "operator",
    foreignKey: "operatorId",
    constraints: false,
  });

  // IpBlock -> User (Operator)
  IpBlock.belongsTo(User, {
    as: "operator",
    foreignKey: "operatorId",
    constraints: false,
  });
  
  // RateLimitLog -> User
  RateLimitLog.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
    constraints: false,
  });
  
  // WsConnection -> User
  WsConnection.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
    constraints: false,
  });
}
