/**
 * @packageDocumentation
 * @module Tree
 * @tag [树结构] [菜单树] [扁平转树] [排序]
 * @since 1.0.0 (2025-01-07)
 * @author Z-kali
 * @description 扁平菜单导航转树结构工具：将扁平数组转换为树形结构
 * @path api/src/utils/tree.ts
 * @see api/src/services/menu.js
 */

/**
 * @interface TreeNode
 * @description 树节点基础接口
 * @property {string} id - 节点ID
 * @property {string|null} pid - 父节点ID
 * @property {number} [sort] - 排序值
 * @property {string} [title] - 节点名称
 */
interface TreeNode {
  id: string;
  pid: string | null;
  sort: number;
  title: string;
  [key: string]: any;
}

/**
 * @interface TreeNodeWithChildren
 * @description 带子节点的树节点接口
 */
interface TreeNodeWithChildren extends TreeNode {
  children: TreeNodeWithChildren[];
}

/**
 * @interface BuildTreeOptions
 * @description 构建树的选项
 * @property {string|null} [rootPid] - 作为根的父ID值（通常为 null）
 * @property {boolean} [orphanToRoot] - 无父节点或父缺失时是否挂到根
 */
interface BuildTreeOptions {
  rootPid?: string | null;
  orphanToRoot?: boolean;
}

/**
 * @function buildMenuTree
 * @description 将扁平菜单数组转换为树结构（children），按 sort 升序排序，同值按 name 升序
 * @param {TreeNode[]} items - 扁平菜单数组（需包含 id、pid、sort、name）
 * @param {BuildTreeOptions} [options] - 构建选项
 * @returns {TreeNodeWithChildren[]} 树形菜单数组
 */
function buildMenuTree(
  items: TreeNode[],
  options: BuildTreeOptions = {},
): TreeNodeWithChildren[] {
  const { rootPid = null, orphanToRoot = true } = options;

  const nodes: TreeNodeWithChildren[] = items.map((x) => ({
    ...x,
    children: [],
  }));

  const map = new Map<string, TreeNodeWithChildren>(nodes.map((n) => [n.id, n]));
  const roots: TreeNodeWithChildren[] = [];

  for (const node of nodes) {
    const pid = node.pid ?? null;
    const parent = pid ? map.get(pid) : undefined;
    const isSelfLoop = node.id === pid;

    if (pid === rootPid || (!parent && orphanToRoot) || isSelfLoop) {
      roots.push(node);
      continue;
    }

    if (parent) {
      parent.children.push(node);
    } else if (orphanToRoot) {
      roots.push(node);
    }
  }

  const cmp = (a: TreeNodeWithChildren, b: TreeNodeWithChildren): number => {
    const sa = Number.isFinite(a.sort) ? a.sort! : 0;
    const sb = Number.isFinite(b.sort) ? b.sort! : 0;
    if (sa !== sb) return sa - sb;
    return String(a.name || '').localeCompare(String(b.name || ''), 'zh');
  };

  const sortRecursively = (arr: TreeNodeWithChildren[]): TreeNodeWithChildren[] => {
    arr.sort(cmp);
    for (const n of arr) {
      if (n.children?.length) sortRecursively(n.children);
    }
    return arr;
  };

  return sortRecursively(roots);
}

/* ======================== 最下方显式导出 ======================== */
export { buildMenuTree };
export type { TreeNode, TreeNodeWithChildren, BuildTreeOptions };
