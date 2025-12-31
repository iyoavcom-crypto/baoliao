/**
 * @packageDocumentation
 * @module utils/id
 * @since 1.0.0 (2025-12-23)
 * @author Z-kali
 * @description 简易 ID 工具
 */



/**
 * @function uuid4
 * @description 生成 UUID v4（简化版）
 * @returns {string} uuid
 */
export function uuid4(): string {
  const s = crypto.getRandomValues(new Uint8Array(16));
  s[6] = (s[6] & 0x0f) | 0x40;
  s[8] = (s[8] & 0x3f) | 0x80;
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return (
    `${toHex(s[0])}${toHex(s[1])}${toHex(s[2])}${toHex(s[3])}-` +
    `${toHex(s[4])}${toHex(s[5])}-` +
    `${toHex(s[6])}${toHex(s[7])}-` +
    `${toHex(s[8])}${toHex(s[9])}-` +
    `${toHex(s[10])}${toHex(s[11])}${toHex(s[12])}${toHex(s[13])}${toHex(s[14])}${toHex(s[15])}`
  );
}

/**
 * @function nowMs
 * @description 返回当前毫秒时间戳
 * @returns {number} 毫秒
 */
export function nowMs(): number {
  return Date.now();
}

