/**
 * @packageDocumentation
 * @module query
 * @since 1.0.0 (2025-01-07)
 * @author Z-kali
 * @description Logic for building order/sorting parameters
 */

import type { Order } from "sequelize";

/**
 * @function buildOrder
 * @description
 *  构建 Sequelize 排序参数，支持多种输入形式：
 *  - 字符串："sort:ASC,name:DESC"
 *  - 字符串数组：["sort:ASC", "name:DESC"]
 *  - Sequelize 标准 Order 格式：[["sort","ASC"],["name","DESC"]]
 * @param {string | string[] | Order} [order] - 排序定义；为空时使用 fallback
 * @param {Order} [fallback=[['createdAt', 'DESC']]] - 默认排序设置
 * @returns {Order} 规范化后的 Sequelize 排序数组，可直接用于 Model.findAll 等方法
 * @throws {Error}
 *  - 当 fallback 不是数组时抛出错误
 *  - 当二维数组格式的 order 项不合法（长度 < 2 或字段/方向非法）时抛出错误
 *  - 当字符串/字符串数组中的格式不满足 "field:direction" 时抛出错误
 *  - 当排序方向不是 "ASC" 或 "DESC" 时抛出错误
 */
export function buildOrder(
  order?: string | string[] | Order,
  fallback: Order = [["createdAt", "DESC"]],
): Order {
  if (!order) return fallback;

  if (!Array.isArray(fallback)) {
    throw new Error("Fallback order must be an array");
  }

  // 若已是 Sequelize 的二维数组格式，验证并返回
  if (Array.isArray(order) && order.length > 0 && Array.isArray(order[0])) {
    for (const orderItem of order) {
      if (!Array.isArray(orderItem) || orderItem.length < 2) {
        throw new Error(
          "Invalid order format: each order item must be an array with at least 2 elements",
        );
      }
      const [field, direction] = orderItem;
      if (typeof field !== "string" || field.trim() === "") {
        throw new Error(`Invalid field name in order: ${field}`);
      }
      if (
        typeof direction !== "string" ||
        !["ASC", "DESC"].includes(direction.toUpperCase())
      ) {
        throw new Error(
          `Invalid sort direction: ${direction}. Must be 'ASC' or 'DESC'`,
        );
      }
    }
    return order as Order;
  }

  // 处理字符串或字符串数组
  const list = Array.isArray(order) ? order : String(order).split(",");

  if (Array.isArray(order)) {
    for (const item of order) {
      if (typeof item !== "string") {
        throw new Error(
          `Invalid order item: ${item}. All items must be strings`,
        );
      }
    }
  }

  const parsed = list
    .map((x) => String(x).trim())
    .filter(Boolean)
    .map((x) => {
      const parts = x.split(":");
      if (parts.length > 2) {
        throw new Error(
          `Invalid order format: ${x}. Expected format: 'field:direction'`,
        );
      }

      const [field, dir = "ASC"] = parts;
      const fieldName = field.trim();
      const direction = String(dir || "ASC").toUpperCase();

      if (fieldName === "") {
        throw new Error(`Empty field name in order: ${x}`);
      }

      if (!["ASC", "DESC"].includes(direction)) {
        throw new Error(
          `Invalid sort direction: ${dir}. Must be 'ASC' or 'DESC'`,
        );
      }

      return [fieldName, direction] as [string, string];
    });

  return parsed.length ? (parsed as unknown as Order) : fallback;
}
