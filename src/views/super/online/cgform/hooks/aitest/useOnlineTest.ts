import { ref, nextTick, inject } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { createLocalStorage } from '/@/utils/cache';
import { FormActionType, JCodeEditor } from '/@/components/Form';
import { CgformModal, CgformPageType } from '/@/views/super/online/cgform/types';

import aiTestTableList from '/@/hooks/jeecg/aitest/data/config';
import { defaultFields, customButtons, customListEnhanceJavascript, customJavaEnhance, customFormEnhanceJavascript } from '/@/hooks/jeecg/aitest/data/data.common';
// Online AiTest 配置
import configMap from '/@/hooks/jeecg/aitest/data';

export function useOnlineTest(data, methods, form: Nullable<FormActionType>) {
  // Online单元测试开关
  const aiTestMode = ref(true);
  const aiTestTable = ref([]);
  const aiTableList = ref(aiTestTableList);
  
  const { createMessage: $message } = useMessage();
  const $ls = createLocalStorage();
  const CACHE_TABLE_KEY = 'ai_test_table_name';

  // 判断页面类型，如果是视图模式，就不显示 aiTest
  const pageType = inject<CgformPageType>('cgformPageType', CgformPageType.normal);
  if (pageType === CgformPageType.copy) {
    aiTestMode.value = false;
  }

  function initVirtualData() {
    form?.resetFields();
    setTaleConfig();
  }

  // 自定义按钮
  function genButtons(code) {
    let url = '/online/cgform/button/aitest';
    let params: any[] = [];
    for (let button of customButtons) {
      let temp = Object.assign({ cgformHeadId: code }, button);
      params.push(temp);
    }

    defHttp.post({ url, params }).then(() => {
      $message.success('操作成功');
      methods.reload();
    });
  }

  // 生成java增强
  function genEnhanceJavaData(code) {
    let url = '/online/cgform/head/enhanceJava/' + code;
    let arr: Promise<any>[] = [];
    for (let params of customJavaEnhance) {
      arr.push(defHttp.post({ url, params }));
    }
    Promise.all(arr).then(() => {
      $message.success('操作成功');
      methods.reload();
    });
  }

  // 生成js增强
  function genEnhanceJsData(tableName, type, codeEditor: InstanceType<typeof JCodeEditor>) {
    let mataTableName = getCacheTableName(tableName);
    let config = configMap[mataTableName + '_config'];
    // update-begin--author:liaozhiyang---date:20240709---for：【TV360X-363】js增强所有表都可生成测试代码
    // if (!config) {
    //   $message.error('ai测试数据与表名不匹配，无法生成js增强！');
    //   return false;
    // }
    // update-end--author:liaozhiyang---date:20240709---for：【TV360X-363】js增强所有表都可生成测试代码
    let regExp = new RegExp(mataTableName, 'gm');
    if (type == 'form') {
      let realEnhanceJs = config?.enhanceFormJs?.replace(regExp, tableName) ?? '';
      // update-begin--author:liaozhiyang---date:20240709---for：【TV360X-363】js增强所有表都可生成测试代码
      codeEditor?.setValue(realEnhanceJs ? realEnhanceJs : customFormEnhanceJavascript);
      // update-end--author:liaozhiyang---date:20240709---for：【TV360X-363】js增强所有表都可生成测试代码
    } else if (type == 'list') {
      codeEditor?.setValue(customListEnhanceJavascript);
    } else {
      $message.error('不识别的类型');
    }
  }

  // 自定义sql增强
  function genEnhanceSqlData(code, tableName) {
    let realTableName = getCacheTableName(tableName);
    let config = configMap[realTableName + '_config'];
    if (!config) {
      $message.error('ai测试数据与表名不匹配，无法生成sql增强！');
      return false;
    }
    let regExp = new RegExp(realTableName, 'gm');
    let buttonCode = 'two';
    let arr = customButtons.filter((item) => {
      return item.optType == 'action' && item.buttonStyle == 'button';
    });
    if (arr.length > 0) {
      buttonCode = arr[0].buttonCode;
    }
    let realEnhanceSql = config?.enhanceSql?.replace(regExp, tableName);
    let url = '/online/cgform/head/enhanceSql/' + code;
    let params = {
      buttonCode: buttonCode,
      cgbSql: realEnhanceSql,
    };
    defHttp.post({ url, params }).then(() => {
      $message.success('操作成功');
      methods.reload();
    });
  }

  /**
   * 加载配置信息
   */
  function setTaleConfig() {
    let key = aiTestTable.value;
    let config = configMap[key + '_config'];
    methods.initialAllShowItem(config.table);
    nextTick(() => {
      form?.setFieldsValue(config.table);
      refreshCacheTableName('', config.table.tableName);
      data.oldTableName.value = config.table.tableName;
    });
    let { dbTable, idxTable } = data.tables as CgformModal.TablesRef;
    dbTable.value!.tableRef!.clearSelection();
    let fields = [...defaultFields, ...config.fields];
    let orderNum = 1;
    for (let item of fields) {
      item.id = guid(item.dbFieldName);
      item.orderNum = orderNum++;
    }
    methods.setAllTableData(fields);
    $message.success('操作成功!');
    // 添加索引数据
    if (config.indexList) {
      for (let item of config.indexList) {
        item.id = guid(item.indexField);
      }
      idxTable.value!.setDataSource(config.indexList);
    }
  }

  function tableJsonGetHelper(pickAfter) {
    console.log('Online表的配置信息:', JSON.stringify(pickAfter));
    console.log('---------------------------------------');
  }

  /**
   * json 获取小助手
   * @param fields
   */
  function fieldsJsonGetHelper(fields) {
    let temp: any[] = [];
    let excludeFields = ['id', 'create_by', 'update_by', 'create_time', 'update_time'];
    for (let item of fields) {
      let obj = { ...item };
      delete obj.id;
      delete obj.cgformHeadId;
      delete obj.dbFieldNameOld;
      delete obj.dbDefaultVal;
      delete obj.updateBy;
      delete obj.updateTime;
      delete obj.createBy;
      delete obj.createTime;
      delete obj.sys_org_code;
      delete obj.updateBy;
      delete obj.cgformHeadId;
      if (excludeFields.indexOf(obj.dbFieldName) < 0) {
        temp.push(obj);
      }
    }
    console.log(JSON.stringify(temp));
  }

  function refreshCacheTableName(oldValue, newValue) {
    if (!oldValue) {
      oldValue = newValue;
    }
    let map = $ls.get(CACHE_TABLE_KEY);
    if (!map) {
      map = {};
      map[newValue] = oldValue;
    } else {
      let firstName = map[oldValue];
      if (!firstName) {
        map[newValue] = oldValue;
      } else {
        delete map[oldValue];
        // 总之 每次保存的key是最新的表名 value是第一次添加模拟数据的表名
        map[newValue] = firstName;
      }
    }
    $ls.set(CACHE_TABLE_KEY, map);
  }

  function getCacheTableName(name) {
    let map = $ls.get(CACHE_TABLE_KEY);
    if (!map) {
      return name;
    } else {
      if (!map[name]) {
        return name;
      } else {
        return map[name];
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  return {
    aiTestMode,
    aiTestTable,
    aiTableList,
    initVirtualData,
    genButtons,
    genEnhanceJavaData,
    genEnhanceJsData,
    genEnhanceSqlData,
    setTaleConfig,
    tableJsonGetHelper,
    fieldsJsonGetHelper,
    refreshCacheTableName,
    getCacheTableName,
  };
}

function guid(arg) {
  let temp = Number(Math.random().toString().substr(3, 3) + Date.now()).toString(24);
  if (temp.length > 24) {
    temp = temp.substr(0, 24);
  }
  if (!arg) {
    arg = '';
  }
  arg = arg.replace(/_/g, '');
  if (arg.length > 8) {
    arg = arg.substr(0, 8);
  }
  return arg + temp;
}
