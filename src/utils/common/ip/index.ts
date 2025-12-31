/**
 * @packageDocumentation
 * @module utils/ip
 * @since 1.0.0 (2025-09-12)
 * @author Z-kali
 * @description 提供 IP/主机名判定工具：本机地址、内网地址（RFC1918）等
 */

/**
 * @function extractHostname
 * @description 从 origin 字符串中提取 hostname（支持 URL / host:port / 纯 IP / [IPv6]:port）
 * @param {string} origin - 可能为 URL、host:port、[IPv6]:port 或纯 IP
 * @returns {string | null} 解析出的主机名或 IP 字符串，无法解析时返回 null
 */
function extractHostname(origin: string): string | null {
  if (!origin) return null;

  const value = origin.trim();
  if (!value) return null;

  // 1. 尝试按 URL 解析
  try {
    const url = new URL(value);
    return url.hostname;
  } catch {
    // 非 URL 格式，继续按 host / IP 解析
  }

  // 2. 处理 [IPv6]:port 形式
  if (value.startsWith("[") && value.includes("]")) {
    const end = value.indexOf("]");
    if (end > 1) {
      return value.slice(1, end);
    }
  }

  // 3. 处理 host:port 或 IPv4:port
  const colonCount = (value.match(/:/g) || []).length;
  if (colonCount === 1 && !value.includes("::")) {
    // 简单场景：只有一个冒号，视为 host:port
    const [hostPart] = value.split(":");
    return hostPart || null;
  }

  // 4. 其他情况直接返回原始值（可能是 IPv4、压缩 IPv6 或纯 hostname）
  return value;
}

/**
 * @function parseIPv4
 * @description 尝试将字符串解析为 IPv4 段数组
 * @param {string} host - 主机名或 IP 字符串
 * @returns {number[] | null} 成功时返回 4 段 IPv4 数组，每段 0-255；否则返回 null
 */
function parseIPv4(host: string): number[] | null {
  const parts = host.split(".");
  if (parts.length !== 4) return null;

  const nums: number[] = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    nums.push(n);
  }
  return nums;
}

/**
 * @function isLoopbackIPv4
 * @description 是否为 IPv4 本机回环地址（127.0.0.0/8）
 * @param {string} host - 仅限 IPv4 字符串
 * @returns {boolean} true 表示是 127.x.x.x
 */
function isLoopbackIPv4(host: string): boolean {
  const nums = parseIPv4(host);
  if (!nums) return false;
  return nums[0] === 127;
}

/**
 * @function isPrivateIPv4
 * @description 是否为 IPv4 内网地址（RFC1918：10/8、172.16/12、192.168/16）
 * @param {string} host - 仅限 IPv4 字符串
 * @returns {boolean} true 表示是内网 IPv4（不含 127.0.0.0/8）
 */
function isPrivateIPv4(host: string): boolean {
  const nums = parseIPv4(host);
  if (!nums) return false;

  const [p1, p2] = nums;

  // 10.0.0.0/8
  if (p1 === 10) return true;

  // 172.16.0.0 ~ 172.31.255.255
  if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;

  // 192.168.0.0/16
  if (p1 === 192 && p2 === 168) return true;

  return false;
}

/**
 * @function isLocalHostname
 * @description 是否为本地主机名（localhost）
 * @param {string} host - 主机名
 * @returns {boolean} true 表示为 localhost
 */
function isLocalHostname(host: string): boolean {
  return host === "localhost";
}

/**
 * @function isLoopbackIPv6
 * @description 是否为 IPv6 本机回环地址（::1 或等价形式）
 * @param {string} host - IPv6 字符串
 * @returns {boolean} true 表示为本机回环 IPv6
 */
function isLoopbackIPv6(host: string): boolean {
  const normalized = host.toLowerCase();
  return normalized === "::1" || normalized === "0:0:0:0:0:0:0:1";
}

/**
 * @function isLoopbackAddress
 * @description 判断是否为本机地址（localhost / 127.0.0.0/8 / IPv6 回环）
 * @param {string} origin - 可能为 URL、host:port、纯 IP 等
 * @returns {boolean} true 表示本机地址
 */
export function isLoopbackAddress(origin: string): boolean {
  const host = extractHostname(origin);
  if (!host) return false;

  if (isLocalHostname(host)) return true;
  if (isLoopbackIPv4(host)) return true;
  if (isLoopbackIPv6(host)) return true;

  return false;
}

/**
 * @function isPrivateNetworkAddress
 * @description 判断是否为内网地址（含 RFC1918 IPv4、localhost、本机回环）
 * @param {string} origin - 可能为 URL、host:port、纯 IP 等
 * @returns {boolean} true 表示为内网地址
 */
export function isPrivateNetworkAddress(origin: string): boolean {
  const host = extractHostname(origin);
  if (!host) return false;

  // 本机地址视为内网
  if (isLoopbackAddress(host)) return true;

  // RFC1918 IPv4 内网地址
  if (isPrivateIPv4(host)) return true;

  // 如需扩展 IPv6 ULA / link-local，可在此追加判断逻辑

  return false;
}

/**
 * @function isLocalNetwork
 * @description 兼容旧命名：判断是否为本机或内网地址（等价于 isPrivateNetworkAddress）
 * @param {string} origin - 可能为 URL、host:port、纯 IP 等
 * @returns {boolean} true 表示为本机或内网地址
 */
export function isLocalNetwork(origin: string): boolean {
  return isPrivateNetworkAddress(origin);
}
