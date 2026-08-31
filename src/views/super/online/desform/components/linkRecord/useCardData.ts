import { useColumns } from '/@/views/super/online/desform/auto/hooks/useColumns';
import { defHttp } from '/@/utils/http/axios';
import { ref, watch, h } from 'vue';
import { useDebounceFn } from '@vueuse/core';
/**
 * 用于卡片格式的数据展示
 */
export function useCardData(props, load?) {
  const dataList = ref<any[]>([]);
  const totalRecord = ref(0);
  const pageNo = ref(1);
  const filterValue = ref('');
  const showFieldList = ref<any[]>([]);
  // 后台翻译结果
  const translData = ref({});
  // 远程选项
  const remoteOptionsMap = ref({});
  const desformName = ref<string>();
  const desformCode = ref('');
  // 加载列配置
  const { allColumns, allColumnKeys, loadColumnsInfo } = useColumns(
    {
      desformCode: desformCode,
      translData,
      remoteOptionsMap,
      desformName,
      notBaseList: 1,
    },
    {
      loadData,
      openLinkRecord,
    }
  );
  function loadData() {}
  function openLinkRecord() {}

  watch(
    () => props.code,
    async (val) => {
      if (val) {
        desformCode.value = val;
        await loadColumnsInfo(val);
        initShowFieldList();
        if(load===true){
          await onLoadData();
        }
      }
    },
    { immediate: true }
  );

  async function onLoadData(page?) {
    const url = '/desform/data/list';
    //update-begin---author:wangshuai---date:2024-05-09---for:【QQYUN-9245】错误2：pageNo传递参数值不对---
    if (page && typeof page === 'number') {
    //update-end---author:wangshuai---date:2024-05-09---for:【QQYUN-9245】错误2：pageNo传递参数值不对---
      pageNo.value = page;
    }
    const params: any = {
      order: 'desc',
      column: 'createTime',
      desformCode: props.code,
      pageNo: pageNo.value,
    };
    if (filterValue.value) {
      params['global_keyword'] = filterValue.value;
    }
    const data = await defHttp.get({ url, params }, { isTransformResponse: false });
    if (data.success) {
      dataList.value = data.result.records;
      totalRecord.value = data.result.total;
    } else {
      totalRecord.value = 0;
      dataList.value = [];
    }
  }

  function initShowFieldList() {
    let arr: any[] = [];
    if (props.showFields && props.showFields.length > 0) {
      let list = allColumns.value;
      for (let field of props.showFields) {
        for (let item of list) {
          if (item.dataIndex === field || item.key === field) {
            arr.push({
              model: item.dataIndex,
              compType: item.compType,
              title: item.title,
            });
          }
        }
      }
    }
    showFieldList.value = arr;
  }

  function getFieldValue(record, key) {
    let columns = allColumns.value;
    let text = record[key];
    if(text===0){
      return 0;
    }
    if(!text){
      return ''
    }
    for (let item of columns) {
      if (item.dataIndex === key) {
        if (item.customRender) {
          text = item.customRender({ text, record });
        }
        break;
      }
    }
    return text;
  }

  function getComponentValue(record, key) {
    let columns = allColumns.value;
    let text = record[key];
    if(text!==0 && !text){
      return h('span')
    }
    console.log(key, text, record)
    for (let item of columns) {
      if (item.dataIndex === key) {
        if (item.customRender) {
          text = item.customRender({ text, record });
        }
        break;
      }
    }
    return text;
  }

  const componentTypeArray = ['slider', 'rate', 'switch', 'link-record'];
  function isComponent(field, data) {
    let text = data.desformData[field.model]
    if(text!==0 && !text){
      return false
    }
    return componentTypeArray.indexOf(field.compType) >= 0;
  }

  function onChangeFilter() {
    onLoadData(1);
  }

  return {
    filterValue,
    pageNo,
    getFieldValue,
    isComponent,
    showFieldList,
    onLoadData,
    dataList,
    allColumnKeys,
    totalRecord,
    allColumns,
    getComponentValue,
    onChangeFilter: useDebounceFn(onChangeFilter, 350),
  };
}
