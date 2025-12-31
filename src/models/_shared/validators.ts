/**
 * @packageDocumentation
 * @module models/_shared/validators
 * @since 1.0.0
 * @author Z-kali
 * @description 可复用的模型字段验证器，用于减少模型钩子中的重复验证代码
 */

/**
 * @interface ValidatorResult
 * @description 验证器返回结果
 */
export interface ValidatorResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误消息（如果验证失败） */
  error?: string;
}

/**
 * @function nonEmptyString
 * @description 验证非空字符串
 * @param {any} value - 待验证的值
 * @param {string} [fieldName] - 字段名（用于生成错误消息）
 * @returns {ValidatorResult} 验证结果
 */
export function nonEmptyString(value: any, fieldName: string = "字段"): ValidatorResult {
  if (typeof value !== "string" || value.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName}不能为空`
    };
  }
  return { valid: true };
}

/**
 * @function positiveNumber
 * @description 验证正数
 * @param {any} value - 待验证的值
 * @param {string} [fieldName] - 字段名（用于生成错误消息）
 * @returns {ValidatorResult} 验证结果
 */
export function positiveNumber(value: any, fieldName: string = "字段"): ValidatorResult {
  if (typeof value !== "number" || value <= 0) {
    return {
      valid: false,
      error: `${fieldName}必须是正数`
    };
  }
  return { valid: true };
}

/**
 * @function numberInRange
 * @description 验证数字在指定范围内
 * @param {any} value - 待验证的值
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（包含）
 * @param {string} [fieldName] - 字段名（用于生成错误消息）
 * @returns {ValidatorResult} 验证结果
 */
export function numberInRange(
  value: any,
  min: number,
  max: number,
  fieldName: string = "字段"
): ValidatorResult {
  if (typeof value !== "number" || value < min || value > max) {
    return {
      valid: false,
      error: `${fieldName}必须在${min}到${max}之间`
    };
  }
  return { valid: true };
}

/**
 * @function minLength
 * @description 验证字符串最小长度
 * @param {any} value - 待验证的值
 * @param {number} min - 最小长度
 * @param {string} [fieldName] - 字段名（用于生成错误消息）
 * @returns {ValidatorResult} 验证结果
 */
export function minLength(value: any, min: number, fieldName: string = "字段"): ValidatorResult {
  if (typeof value !== "string" || value.length < min) {
    return {
      valid: false,
      error: `${fieldName}长度不能少于${min}个字符`
    };
  }
  return { valid: true };
}

/**
 * @function maxLength
 * @description 验证字符串最大长度
 * @param {any} value - 待验证的值
 * @param {number} max - 最大长度
 * @param {string} [fieldName] - 字段名（用于生成错误消息）
 * @returns {ValidatorResult} 验证结果
 */
export function maxLength(value: any, max: number, fieldName: string = "字段"): ValidatorResult {
  if (typeof value !== "string" || value.length > max) {
    return {
      valid: false,
      error: `${fieldName}长度不能超过${max}个字符`
    };
  }
  return { valid: true };
}

/**
 * @function isEnum
 * @description 验证值是否在枚举中
 * @param {any} value - 待验证的值
 * @param {any[]} enumValues - 枚举值数组
 * @param {string} [fieldName] - 字段名（用于生成错误消息）
 * @returns {ValidatorResult} 验证结果
 */
export function isEnum(value: any, enumValues: any[], fieldName: string = "字段"): ValidatorResult {
  if (!enumValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName}必须是以下值之一: ${enumValues.join(", ")}`
    };
  }
  return { valid: true };
}

/**
 * @function matchPattern
 * @description 验证值是否匹配正则表达式
 * @param {any} value - 待验证的值
 * @param {RegExp} pattern - 正则表达式
 * @param {string} [fieldName] - 字段名（用于生成错误消息）
 * @param {string} [patternDesc] - 模式描述（用于错误消息）
 * @returns {ValidatorResult} 验证结果
 */
export function matchPattern(
  value: any,
  pattern: RegExp,
  fieldName: string = "字段",
  patternDesc?: string
): ValidatorResult {
  if (typeof value !== "string" || !pattern.test(value)) {
    return {
      valid: false,
      error: patternDesc 
        ? `${fieldName}格式不正确，${patternDesc}` 
        : `${fieldName}格式不正确`
    };
  }
  return { valid: true };
}

/**
 * @function combineValidators
 * @description 组合多个验证器
 * @param {any} value - 待验证的值
 * @param {Array<(value: any) => ValidatorResult>} validators - 验证器函数数组
 * @returns {ValidatorResult} 验证结果（返回第一个失败的结果）
 */
export function combineValidators(
  value: any,
  validators: Array<(value: any) => ValidatorResult>
): ValidatorResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * @function assertValid
 * @description 断言验证结果，如果验证失败则抛出错误
 * @param {ValidatorResult} result - 验证结果
 * @throws {Error} 如果验证失败
 */
export function assertValid(result: ValidatorResult): void {
  if (!result.valid && result.error) {
    throw new Error(result.error);
  }
}
