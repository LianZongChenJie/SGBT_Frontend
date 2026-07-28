import { useListPage } from '/@/hooks/system/useListPage';
import { columns, columns_group, columns_history, TaskType, searchFormSchema } from './task.handle.data';
import { list, taskNodeInfo } from './task.handle.api';

/**
 * 用于列表渲染
 * @param urlObject
 */
export function useTaskList(type) {
  const { tableContext } = useListPage({
    designScope: 'process-design',
    pagination: true,
    tableProps: {
      title: '',
      api: getDataList,
      columns: getColumns(),
      showIndexColumn: true,
      showTableSetting: false,
      canResize: false,
      scroll: { x: 1800 },
      actionColumn: { dataIndex: 'action', fixed: 'right',width:150 },
      useSearchForm: TaskType.GROUP != type,
      formConfig: {
        schemas: getSearchFormSchema(),
        autoAdvancedCol: 3,
        baseColProps: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 },
        actionColOptions: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 },
      },
    },
  });
  const [registerTable, { reload }] = tableContext;

  /**
   * 数据请求接口
   * @param params
   */
  function getDataList(params) {
    return list(type, params);
  }

  /**
   * 列
   * 不同类型 列表列有少许差别
   */
  function getColumns() {
    if (TaskType.RUN == type) {
      return columns;
    } else if (TaskType.GROUP == type) {
      return columns_group;
    } else {
      return columns_history;
    }
  }

  /**
   * 查询条件
   */
  function getSearchFormSchema() {
    return searchFormSchema.filter((item) => !item.buss || item.buss === type);
  }

  /**
   * 获取流程节点信息
   */
  async function getTaskNodeInfo(record) {
    //查询条件
    let params = { taskId: record.id };
    const result = await taskNodeInfo(type, params);
    console.log('获取流程节点信息', result);
    let procInsId = record.processInstanceId || (result.records?result.records.BPM_INST_ID: '');
    let formData: any = {
      taskId: record.id,
      taskDefKey: result.taskDefKey,
      procInsId: procInsId,
      dataId: result.dataId,
      tableName: result.tableName,
      permissionList: result.permissionList,
      subPermissionList: result.subPermissionList,
      vars: result.records,
    };
    let tempFormUrl = result.formUrl;
    console.log('获取流程节点表单URL', tempFormUrl);
    //节点配置表单URL，VUE组件类型对应的拓展参数
    if (tempFormUrl && tempFormUrl.indexOf('?') != -1 && !isURL(tempFormUrl) && tempFormUrl.indexOf('{{DOMAIN_URL}}') == -1) {
      tempFormUrl = result.formUrl.split('?')[0];
      console.log('获取流程节点表单URL（去掉参数）', tempFormUrl);
      let qv: any = getQueryVariable(result.formUrl);
      if (qv.edit == 1) {
        formData['disabled'] = false;
      }
      formData.extendUrlParams = qv;
    }
    //如果没有taskId参数，程序自动追加，用于设计器表单节点权限
    if (tempFormUrl != null && tempFormUrl.indexOf('{{DOMAIN_URL}}/desform/') != -1 && tempFormUrl.indexOf('taskId') == -1) {
      tempFormUrl = tempFormUrl.trim();
      if (tempFormUrl.endsWith('?')) {
        tempFormUrl = tempFormUrl + 'taskId=' + result.taskDefKey;
      } else {
        tempFormUrl = tempFormUrl + '&taskId=' + result.taskDefKey;
      }
    }
    return {
      formData,
      formUrl: tempFormUrl,
      isSignTask: result.isSignTask,
      assignee: result.assignee,
      taskIsHandel: result.taskIsHandel||false,
    };
  }

  /**
   * 获取历史任务信息
   */
  async function getHistoryTaskInfo(record) {
    return await getTaskInfoForHistory(record);
  }

  return {
    registerTable,
    reload,
    getTaskNodeInfo,
    getHistoryTaskInfo,
  };
}

export async function getTaskInfoForHistory(record) {
  //查询条件
  let params = { procInstId: record.processInstanceId };
  const result = await taskNodeInfo('history', params);
  console.log('获取历史任务信息', result);
  let formData: any = {
    dataId: result.dataId,
    taskId: record.id,
    taskDefKey: record.taskId,
    procInsId: record.processInstanceId,
    tableName: result.tableName,
    vars: result.records,
  };
  let tempFormUrl = result.formUrl;
  console.log('获取流程节点表单URL', tempFormUrl);
  //节点配置表单URL，VUE组件类型对应的拓展参数
  if (tempFormUrl && tempFormUrl.indexOf('?') != -1 && !isURL(tempFormUrl) && tempFormUrl.indexOf('{{DOMAIN_URL}}') == -1) {
    tempFormUrl = result.formUrl.split('?')[0];
    console.log('获取流程节点表单URL（去掉参数）', tempFormUrl);
    formData.extendUrlParams = getQueryVariable(result.formUrl);
  }
  return {
    formData,
    formUrl: tempFormUrl,
  };
}

/**
 * 获取URL上参数
 * @param url
 */
function getQueryVariable(url) {
  if (!url) return;

  let t,
    n,
    r,
    i = url.split('?')[1],
    s = {};
  (t = i.split('&')), (r = null), (n = null);
  for (let o in t) {
    let u = t[o].indexOf('=');
    u !== -1 && ((r = t[o].substr(0, u)), (n = t[o].substr(u + 1)), (s[r] = n));
  }
  return s;
}

/**
 * URL地址
 * @param {*} s
 */
function isURL(s) {
  return /^http[s]?:\/\/.*/.test(s);
}
