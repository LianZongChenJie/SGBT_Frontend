import { BasicColumn } from '/@/components/Table';

/**
 * 列表
 */
export const columns: BasicColumn[] = [
  {
    title: '名称',
    align: 'center',
    dataIndex: 'name',
  },
  {
    title: '流程KEY',
    align: 'center',
    dataIndex: 'key',
  },
  {
    title: '版本',
    align: 'center',
    dataIndex: 'version',
  },

  {
    title: '状态',
    align: 'center',
    dataIndex: 'suspensionState',
    customRender: function ({ text }) {
      if (text == 1) {
        return '已激活';
      } else if (text == 0) {
        return '挂起';
      } else {
        return text;
      }
    },
  },
];

/**
 * 版本监控节点列表
 */
export const deploymentNodeColumn: BasicColumn[] = [
  {
    title: '节点名称',
    align: 'center',
    dataIndex: 'processNodeName',
  },
  {
    title: '节点编码',
    align: 'center',
    dataIndex: 'processNodeCode',
  },
  {
    title: 'PC表单地址',
    align: 'center',
    dataIndex: 'modelAndView',
  },
  {
    title: '移动表单地址',
    align: 'center',
    dataIndex: 'modelAndViewMobile',
  },
  {
    title: '超时提醒（时）',
    align: 'center',
    dataIndex: 'nodeTimeout',
    customRender: function ({ text }) {
      if (!text) {
        return '';
      }
      return text + '小时';
    },
  },
];
