/**
 * @function fromIso
 * @description 将 ISO 格式（或任意可识别时间）转为人类可读字符串
 * @param {Date|string|number} input - 时间输入
 * @param {Intl.DateTimeFormatOptions} [options] - 可选的格式化配置
 * @returns {string} 人类可读的时间字符串
 * @example
 * fromIso("2025-11-06T06:20:00.000Z") => "2025-11-06 14:20:00"
 */
export function fromIso(
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "Invalid Date";

  // 默认格式：YYYY-MM-DD HH:mm:ss（基于本地时区）
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...options,
  };

  const parts = new Intl.DateTimeFormat("zh-CN", defaultOptions)
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export const fromISO = fromIso;
