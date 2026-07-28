import type { BasicColumn } from '/@/components/Table';
import type { RequestOptions } from '/#/axios';
import type { AxiosRequestConfig, Method } from 'axios';
import { defHttp } from '/@/utils/http/axios';

/**
 * 递归调用处理所有的组件（包括栅格或其他容器组件内的组件）
 * 注：这是一个同步方法
 *
 * @param dataList
 * @param handler
 */
export function recursiveAllWidget(dataList: any[], handler: Fn) {
  const recursive = (array, parent) => {
    for (let item of array) {
      // 判断是否是栅格或其他容器组件
      if (item.isContainer === true) {
        if (item.columns) {
          for (let column of item.columns) {
            recursive(column.list, item);
          }
        } else if (item.type === 'card') {
          // 卡片和tab需要特殊处理
          recursive(item.list, item);
        } else if (item.type === 'tabs') {
          for (let pane of item.panes) {
            recursive(pane.list, item);
          }
        }
      }

      // 执行处理回调
      if (typeof handler === 'function') handler(item, parent);
    }
  };
  recursive(dataList, null);
}

export const loadColumnsIgnores = ['button', 'buttons', 'grid', 'card', 'tabs', 'text', 'sub-table-design', 'divider'];

type GenerateColumnsOptions = {
  dataList: any[];
  generateSubTable?: boolean;
  handler?: Fn;
};

// 存储为数字类型的字段
const numberFields = ['number', 'integer', 'money', 'rate', 'slider'];

/**
 * 生成列
 * @param options
 */
export function generateColumns(options: GenerateColumnsOptions) {
  const { dataList, generateSubTable = false, handler } = options;
  let columns: BasicColumn[] = [];
  recursiveAllWidget(dataList, (item, parent) => {
    if (loadColumnsIgnores.includes(item.type.toLowerCase())) {
      return;
    }
    if (parent && parent.type === 'sub-table-design' && !generateSubTable) {
      return;
    }
    // 生成 name，如果没有name就使用model
    let name = item.name.trim() || item.model;
    let column: BasicColumn = {
      key: item.key,
      title: name,
      align: 'center',
      dataIndex: item.model,
    };
    // 数据类型
    let valueType = item.type;
    // 判断是否是数字类型 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
    if (numberFields.includes(item.type)) {
      valueType = 'number';
    }
    // 判断是否为 select 就自定义输出内容（可输出字典
    if (item.type === 'select' && item.options.showLabel) {
      column.customRender = ({ text }) => {
        for (let option of item.options.options) {
          if ((option.value || '').toString() === (text || '').toString()) {
            return option.label;
          }
        }
        return text;
      };
    }
    column['valueType'] = valueType;
    columns.push(column);

    if (typeof handler === 'function') {
      handler(item, parent, dataList);
    }
  });
  return columns;
}

/** 替换url的 ${xxx} 变量 */
export function replaceUrl(url: string, params: Recordable) {
  return url.replace(/\${([^}]+)}/g, (_$0, $1) => params[$1]);
}

// 后台中转HTTP请求，可解决跨域
export const transitHttp = {
  get: bindTransitHttp('GET'),
  post: bindTransitHttp('POST'),
  put: bindTransitHttp('PUT'),
  http: bindTransitHttp(),
};

function bindTransitHttp(method?: Method) {
  return function (config: AxiosRequestConfig, options?: RequestOptions) {
    let url = config.url || '';
    url = `/desform/api/transitRESTful?url=${encodeURIComponent(url)}`;
    if (!method) {
      method = config.method;
    }
    return defHttp.request({ ...config, url, method }, options);
  };
}
