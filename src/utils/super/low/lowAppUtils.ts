/**
 * 判断当前是否是 lowApp 环境
 * @todo 需要删掉
 */
export function getIsLowAppEnv(): boolean {
  let html: Nullable<HTMLElement> = null;
  let elements = document.getElementsByTagName('html');
  if (elements && elements[0]) {
    html = elements[0];
  } else {
    return false;
  }
  let flag = html.getAttribute('data-low-app');
  return flag != null;
}
