let autoCounter = 0;

/**
 * @function nextId
 * @description 生成自增 ID（字符串）
 * @returns {string} ID
 */
export function nextId(): string {
  autoCounter += 1;
  return String(autoCounter);
}