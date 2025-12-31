/**
 * @function genUserId
 * @description 随机生成 11 位数字用户 ID（不含前导约束，仅保证长度与字符集）
 * @returns {string} 11 位数字字符串
 */
export function genUserId(): string {
  // 使用加密级随机数，避免 Math.random 的可预测性
  const bytes = new Uint8Array(11);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    // 映射到 0–9
    result += (bytes[i] % 10).toString();
  }

  return result;
}
