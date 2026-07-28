import {ref, unref, watch, watchEffect} from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { CardColumnType, CardFieldDict } from './type.definition';
import { onMountedOrActivated } from '/@/hooks/core/onMountedOrActivated';
import { router } from '/@/router';
import { useColumns } from '/@/views/super/online/desform/auto/hooks/useColumns';
import { useMessage } from '/@/hooks/web/useMessage';
const { createConfirm } = useMessage();
import { pageApi } from '../../auto/auto.desform.api';
import { useActionAuth, useAuthStore } from "../../auto/hooks/useAuth";
import { getSuperQueryGroup } from "../ts/useSuperQueryCurd";

// 颜色集合
const colorArray:string[] = ['rgb(33, 150, 243)', 'rgb(0, 195, 69)', 'rgb(250, 173, 20)', 'rgb(250, 140, 22)', 'rgb(255, 87, 0)', 'rgb(245, 34, 45)', 'rgb(235, 47, 150)', 'rgb(128, 128, 128)', 'rgb(153, 62, 186)', 'rgb(78, 82, 206)']

export function useCardList(props, appId, dataModal) {

  const loading = ref(false);
  const routeCode = ref<string>();
  const typeArray = ref<CardColumnType[]>([]);
  // 后台翻译结果
  const translData = ref({});
  // 远程选项
  const remoteOptionsMap = ref({});
  const desformName = ref<string>();
  // 加载列配置
  const { allColumns, loadColumnsInfo } = useColumns(
    {
      desformCode: routeCode,
      translData,
      remoteOptionsMap,
      dynamicConfig: props.dynamicConfig,
      desformName,
      notBaseList: 1
    },
    {
      loadData,
      openLinkRecord,
    }
  );
  
  function loadData(){
    
  }

  const { getFormAuthOnce } = useAuthStore();
  const { hasUpdateAuth } = useActionAuth();

  // 打开关联记录
  async function openLinkRecord(desformCode, dataId){
    desformCode = unref(desformCode);
    const lowAppId = unref(appId);
    const viewId = unref(props.viewId);
    await getFormAuthOnce(lowAppId, desformCode);
    dataModal.openModal(true, {
      mode: 'edit',
      desformCode: desformCode,
      dataId: dataId,
      isOnline: false,
      viewId: viewId,
      lowAppId: lowAppId,
      setMode({ record }) {
        // 判断这条数据是否有编辑权限
        let desformData = record?.desformData ? record.desformData : record;
        let status = hasUpdateAuth(desformCode, viewId, [desformData]);
        return status ? 'edit' : 'detail';
      },
    });
  }

  onMountedOrActivated(() => {
    if (props.code) {
      routeCode.value = props.code;
    } else {
      routeCode.value = router.currentRoute.value.params.code as string;
    }
  });


  watch(routeCode, reload, { immediate: true });
  watch(()=>props.timestamp, (val)=>{
    //不要立即触发，等下次修改配置后再触发
    if(val){
      console.log('重新刷新数据')
      reload();
    }
  }, {immediate: false});

  const groupList = ref();
  const groupType = ref('');

  const groupField = ref('');
  const titleField = ref<CardFieldDict>({
    name: '',
    label: '',
    compType: '',
  });
  const itemFieldList = ref<CardFieldDict[]>([
 
  ]);
  const showLabel = ref(false);
  const coverField = ref<CardFieldDict>({
    name: '',
    label: '',
  });
  const coverView = ref(false);

  

  watchEffect(()=>{
    let config = props.dynamicConfig;
    if(config){
      groupField.value = config.groupField;
      groupType.value = config.filterGroupType;
      showLabel.value = config.showLabel;
      coverView.value = config.coverView;
      
      let all = allColumns.value;
      // 标题字段
      let titleFieldKey = config.titleField;
      let temp:any = getColumnInfo(titleFieldKey, all);
      if(temp){
        titleField.value = {
          name: temp.name,
          label: temp.label,
          compType: temp.compType
        }
      }
      
      //图片字段
      let coverFieldKey = config.coverField;
      if(coverFieldKey=='none'){
        coverField.value = { name: '', label: '' }
      }else{
        let temp2:any = getColumnInfo(coverFieldKey, all);
        if(temp2){
          coverField.value = {
            name: temp2.name,
            label: temp2.label
          }
        }
      }
      
      //其余字段
      console.log('1111111111watchEffect')
      let showList = config.cardColumnList;
      if(showList){
        let arr:any[] = []
        for(let item of showList){
          if(item.show===true && item.field!=titleFieldKey){
            let temp:any = getColumnInfo(item.field, all);
            if(temp){
              arr.push({
                name: temp.name,
                label: temp.label,
                compType: temp.compType
              })
            }
          }
        }
        console.log('看板视图显示字段', arr)
        itemFieldList.value = arr;
      }
     
    }
  });

  function getColumnInfo(key ,all){
    let temp = all.filter(item=>item.key==key);
    if(temp && temp.length>0){
      return {
        name: temp[0].dataIndex,
        label: temp[0].title,
        compType: temp[0].compType
      }
    }
    return ''
  }
  
  
  /** 重新加载数据 */
  async function reload() {
    if (!routeCode.value) {
      return;
    }else{
      try {
        loading.value = true
        const listView = await loadColumnsInfo(routeCode.value);
        groupList.value = listView.dictCountList
        await loadAll();
      } finally {
        loading.value = false
      }
    }
  }

  const superQueryParams = ref<any>({});
  watch(()=>props.superQuery, (data)=>{
    if(data){
      superQueryParams.value = {
        matchType: data.matchType,
        superQueryParams: data.superQueryParams,
      };
    }
    loadAll();
  },{immediate: false, deep: true})

  const loadDataUrl = '/desform/data/cardList';
  const pageSize = 20;

  // 加载card列表
  const loadCardListData = (params) => defHttp.get({url: loadDataUrl, params, timeout: 30000})

  // 加载所有分组的第1页数据
  async function loadAll() {
    let params = getQueryParams()
    const arr = await loadCardListData(params);
    if (!arr || arr.length == 0) {
      typeArray.value = []
    } else {
      dataSetter(arr)
    }
    console.log('loadAll 查询结果', arr)
  }

  /**
   * 加载指定分组的指定页数的数据
   *
   * @param groupTypes 分组type
   * @param pageNo 页码
   */
  async function loadNext(groupTypes, pageNo) {
    let params = getQueryParams({groupTypes, pageNo})
    const arr = await loadCardListData(params);
    console.log('loadNext 查询结果', arr)
    if (arr && arr.length > 0) {
      let types = dataSetter(arr, true)!
      typeArray.value.forEach((item) => {
        const find = types.find((type) => type.value === item.value);
        if (find && find.data && item.data) {
          if (find.data.length < pageSize) {
            item.paging.isEnd = true
          }
          item.count = find.count
          item.title = find.title
          item.data = item.data.concat(find.data)
          item.paging.current = pageNo
        }
      })
    }
  }

  function getQueryParams(params = {}) {
    return {
      code: routeCode.value,
      appId: unref(appId),
      superQuery: getSuperQueryGroup(superQueryParams.value),
      global_keyword: props.keyword,
      listViewId: props.dynamicConfig.id,
      // 【QQYUN-7365】分页查询，初始每个分组只显示10条数据
      pageNo: 1,
      pageSize: pageSize,
      ...params,
    }
  }
  
  function getColor(i){
    let color ='';
    if(colorArray.length>i){
      color = colorArray[i];
    }else{
      color = getRandomColor();
    }
    return color;
  }

  /**
   * 处理查询结果
   * @param arr
   * @param ret 是否返回数据，而不是直接赋值给 typeArray
   */
  function dataSetter(arr, ret = false) {
    let list:CardColumnType[] = [];
    if(!groupType.value || groupType.value == 'all'){
      arr.sort(function (a, b) {
        return a.title - b.title;
      });
      // 全部数据以查询出来的为准
      for(let i=0;i<arr.length;i++){
        let { count, title, value, dataList } = arr[i];
        list.push({
          title: title || '未知项',
          value,
          color: getColor(i),
          count,
          data: dataList,
          paging: {
            current: 1,
            size: pageSize,
            isEnd: false,
            isChange: true,
          }
        });
      }
    }else{
      // 部分数据或是存在的数据，以分组数据为准
      let groupDataList = groupList.value;
      if(groupDataList){
        for(let j=0;j<groupDataList.length;j++){
          let { count, title, value } = groupDataList[j];
          let temp: CardColumnType = {
            title, value, count, color: getColor(j),
            paging: {
              current: 1,
              size: pageSize,
              isEnd: false,
              isChange: true,
            }
          };
          for(let i=0;i<arr.length;i++){
            if(arr[i].value == value){
              temp['data'] = arr[i].dataList;
              break;
            }
          }
          list.push(temp)
        }
      }
    }

    // 【QQYUN-4705】根据 title 排序，防止顺序经常变化
    list = list.sort((a, b) => {
      return (a?.title || '').localeCompare(b?.title || '');
    });

    if (ret) {
      return list
    }
    typeArray.value = list;
  }
  
  
  function getRandomColor() {
    return (
      '#' +
      (function () {
        let rand = Math.floor(Math.random() * 0xffffff).toString(16);
        return rand.length == 6 ? rand : 'rgb(33, 150, 243)';
      })()
    );
  }



  /**
   * 加载列配置信息
   * @param code
   */
/*  async function loadColumnsInfo(code){
    console.log('code', code);
    let loadColumnsParams = {};
    if(props.dynamicConfig && props.dynamicConfig.id){
      loadColumnsParams['listViewId'] = props.dynamicConfig.id;
    }
    let { designForm, listView } = await pageApi.getColumns(code, loadColumnsParams);
    let designJson = designForm.desformDesignJson;
    if (designJson == null) {
      console.error('表单设计器不存在！');
      return;
    }
    let json = JSON.parse(designJson);
    
  }*/

  async function initGroupList() {
/*    const url = '/desform/data/cardList';
    const arr = await defHttp.get({ url });
    let temp: CardColumnType[] = [];
    if (arr && arr.length > 0) {
      for (let title of arr) {
        const { records, total } = await queryListByCreateBy(title);
        temp.push({
          title,
          value: title,
          color: getRandomColor(),
          num: total,
          data: records,
        });
      }
    }
    typeArray.value = temp;*/
  }

/*  async function queryListByCreateBy(createBy) {
   /!* const result = await defHttp.get({ url: Api.list, params: { createBy } });
    console.log('result', result);
    let records = result.records;
    let total = result.total;
    return {
      records,
      total,
    };*!/
  }

  async function reloadSingleTypeData(type) {
    const { records, total } = await queryListByCreateBy(type);
    let arr: CardColumnType[] = typeArray.value || [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].value === type) {
        arr[i].num = total;
        arr[i].data = records;
      }
    }
    typeArray.value = arr;
  }*/

  async function updateType({id, type}) {
    const url = '/desform/data/edit';
    let json = {
      _id: id,
      [groupField.value]: type,
      // 是否是部分更新，如果是部分更新，只更新传入的字段，否则更新整个表单（未传入的字段会被删除）
      __CFG_PART_EDIT: true,
    }
    let params = {
      desformCode: routeCode.value,
      desformDataJson: JSON.stringify(json),
      id
    }
    await defHttp.put({ url, params });
  }

  function deleteOne(record) {
  /*  defHttp.delete({ url: Api.delete, data: { id: record.id } }, { joinParamsToUrl: true }).then(() => {
      reloadSingleTypeData(record.createBy);
    });*/
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: async () => {
        await pageApi.delete(routeCode.value, record.id);
        loadAll();
      },
    });
  }

  async function copyOne(_record) {
    //let params = { ...record };
    // desform/data/add
   /// await defHttp.post({ url: Api.save, params });
   // reloadSingleTypeData(record.createBy);
  }

  return {
    loading,
    getRandomColor,
    initGroupList,
    typeArray,
    updateType,
    loadAll,
    loadNext,
    deleteOne,
    copyOne,
    allColumns,

    groupType,
    groupField,
    titleField,
    itemFieldList,
    showLabel,
    coverField,
    coverView,
    routeCode,
    superQueryParams,
  }
}
