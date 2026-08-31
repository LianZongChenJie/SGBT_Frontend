import * as constant from './constant';

/**
 * 获取对应的option
 * @param value
 * @param enumObject
 * @param allowNull
 */
export function getEnumByValue(value, enumObject, allowNull = true) {
  for (let key in enumObject) {
    if (enumObject.hasOwnProperty(key)) {
      if (enumObject[key].value === value) {
        return enumObject[key];
      }
    }
  }
  return allowNull ? null : {};
}

/**
 * 获取对应的value
 * @param value
 * @param enumObject
 */
function getByEnum(value, enumObject) {
  for (let key in enumObject) {
    if (enumObject.hasOwnProperty(key)) {
      if (enumObject[key].value === value) {
        return enumObject[key].text;
      }
    }
  }
  return value;
}

/**
 * 获取考勤状态
 * @param value
 */
export function getSignStatus(value) {
  return getByEnum(value, constant.SignStatusEnum);
}

/**
 * 获取考勤类型
 * @param value
 */
export function getSignType(value) {
  return getByEnum(value, constant.SignTypeEnum);
}

/**
 * 获取对应的options
 * @param enumObj
 */
function getOptionsByEnum(enumObj) {
  return Object.keys(enumObj).map((key) => ({ value: enumObj[key].value, label: enumObj[key].text }));
}

/**
 * 获取考勤状态options
 */
export function getOptionsSignStatus() {
  return getOptionsByEnum(constant.SignStatusEnum);
}

/**
 * 获取考勤类别options
 */
export function getOptionsSignType() {
  return getOptionsByEnum(constant.SignTypeEnum);
}

/**
 * 外出时间规则
 * @param startTime
 * @param value
 */
export function validatorEndTime(startTime, value) {
  if (startTime != null && value != null) {
    let fmt = 'YYYY-MM-DD';
    if (startTime.format(fmt) !== value.format(fmt)) {
      return Promise.reject('外出时间不能跨天');
    }
  }
  return Promise.resolve();
}

/**
 * 格式化日期和时间
 * @param dateTime 时间
 * @param format 格式化字符串
 */
export function formatDateTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
  return dateTime ? dateTime.format(format) : null;
}
