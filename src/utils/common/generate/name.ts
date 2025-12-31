/**
 * @function genUserName
 * @description 随机生成博牛用户 10 位数字用户名（仅保证长度与字符集）
 * @returns {string} 10 位数字字符串
 * @example
 * const name = genUserName();
 */
export function genUserName(): string {
  // 使用加密级随机数
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += (bytes[i] % 10).toString();
  }

  return result;
}
