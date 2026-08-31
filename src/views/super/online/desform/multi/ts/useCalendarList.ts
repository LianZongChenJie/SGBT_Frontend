import { ref, toRaw, unref, watch, onMounted, onUnmounted } from 'vue';
import { useColumns, getRefPromise } from '/@/views/super/online/desform/auto/hooks/useColumns';
import dayjs from "dayjs";
import { useMessage } from '/@/hooks/web/useMessage';
const { createConfirm } = useMessage();
import { pageApi } from '../../auto/auto.desform.api';
import { defHttp } from '/@/utils/http/axios';
import { useActionAuth } from "../../auto/hooks/useAuth";
import { getSuperQueryGroup } from "../ts/useSuperQueryCurd";

export function useCalendarList(props, appId) {
  const calendar = ref();
  const allEvents = ref<any[]>([]);
  // 排序--{field:'', type: 'asc'/'desc'}
  const orderList = ref<any>([]);
  // 日历配置的时间字段组
  const dateColumnList = ref<any[]>([]);
  const leftTimestamp = ref(0);
  // 是否是24小时制
  const hourStatus = ref(false);

  const routeCode = ref<string>();
  // 后台翻译结果
  const translData = ref({});
  // 远程选项
  const remoteOptionsMap = ref({});
  const desformName = ref<string>();
  // 加载列配置  allColumnKeys,
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
  function openLinkRecord(){
  }


  watch(()=>props.code, async ()=>{
    routeCode.value = props.code;
    await reload();
  }, { immediate: true });
  
  watch(()=>props.timestamp, async (val)=>{
    //不要立即触发，等下次修改配置后再触发
    if(val){
      console.log('重新刷新数据');
      await reload();
      leftTimestamp.value = val;
      if(calendar.value){
        let api = calendar.value.getApi();
        setTimeout(()=>{
          api.updateSize();
         // console.log('?????????????????????????????????????????-------------------------------+++-??-------', props.viewId)
        }, 3000)
       
      }
    }
  }, {immediate: false});
  
  /** 重新加载数据 */
  async function reload() {
    if (!routeCode.value) {
      return;
    }else{
      try {
        const listView = await loadColumnsInfo(routeCode.value);
        dateColumnList.value = listView.calendarColumnList;
        await loadEvent();
      } finally {
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
    loadEvent();
  },{immediate: false, deep: true})

  async function loadEvent(){
    await getRefPromise(calendar);
    let api = calendar.value.getApi();
    // 本月1号 下月1号
    const { currentStart, currentEnd } = api.view;
    const url = '/desform/data/calendarList';
    let params = {
      code: routeCode.value,
      appId: unref(appId),
      listViewId: props.dynamicConfig.id,
      superQuery: getSuperQueryGroup(superQueryParams.value),
      global_keyword: props.keyword,
      ['begin_date']: dayjs(currentStart).format('YYYY-MM-DD') + ' 00:00:00',
      ['end_date']: dayjs(currentEnd).format('YYYY-MM-DD') + ' 00:00:00',
    }
    const arr = await defHttp.get({ url, params, timeout: 30000 });
    if(!arr || arr.length==0){
      allEvents.value = []
    }else{
     dataSetter(arr)
    }
    console.log('日历视图数据查询结果',props.viewId, arr)
    //allEvents.value = [];
  }
  
  
  function dataSetter(arr){
    let dateColumns = dateColumnList.value;
    let list:any[] = [];
    let titleModel = unref(titleField)
    console.log('---------------------------222->', titleModel)
    if(!titleModel){
      // 没有配置标题字段 那么选择第一个字段展示
      let columns = allColumns.value
      if(columns && columns.length>0){
        titleModel = columns[0].dataIndex;
        titleField.value = titleModel
      }
    }
    for (let j = 0; j < arr.length; j++) {
      let item = arr[j];
      let data:any = item.desformData;
      let noTagData = true;
      if(dateColumns && dateColumns.length>0){
        for(let i=0;i<dateColumns.length;i++){
          let {beginDateField, endDateField, seq, tag } = dateColumns[i];
          if(seq === data['jeecgCalendarViewTag']){
            noTagData = false;
            let beginValue = 0, endValue = 0;
            if(beginDateField){
              beginValue = data[beginDateField]
            }
            if(endDateField){
              endValue = data[endDateField]
            }
            let titleValue = data[titleModel]
            if(data[titleModel+'_dictText']){
              titleValue = data[titleModel+'_dictText']
            }
            let temp = {
              id: item.id,
              title: titleValue || '无标题',
              start: new Date(data[beginDateField])
            }
            if(endDateField && data[endDateField]){
              temp['end'] = new Date(data[endDateField])
            }
            if(beginValue && endValue){
              //只有两个时间字段才需要判断全天状态
              let status = getAllDayStatus(beginValue, endValue);
              temp['allDay'] = status
              if (status) {
                // 【QQYUN-4717】将结束时间设置为下一天的0点
                temp['end'] = dayjs(temp['end']).endOf('d').add(1, 'ms').toDate();
              }
            }
            let orderContent = getOrderContent(data);
            Object.keys(orderContent).map(k=>{
              temp[k] = orderContent[k]
            });
            temp['extendedProps']={
              tag: tag,
              metaData: toRaw(item),
              index: j,
              records: arr,
            };
            list.push(temp);
          }
        }
      }
      // 处理没有日历标签的数据
      if(noTagData===true){
        handleNoTagData(item, dateColumns, titleModel, list, arr, j);
      }
    }
    allEvents.value = list
  }
  
  // QQYUN-3588【视图】其他视图创建的数据 日历中不显示
  function handleNoTagData(item:any, dateColumns:any[], titleModel:any, list:any[], records, dataIndex) {
    let data:any = item.desformData;
    if(dateColumns && dateColumns.length>0) {
      let api = calendar.value.getApi();
      // date类型
      const { currentStart, currentEnd } = api.view;
      let startTime = dayjs(currentStart).valueOf();
      let endTime = dayjs(currentEnd).valueOf();
      for (let i = 0; i < dateColumns.length; i++) {
        let { beginDateField, endDateField, tag } = dateColumns[i];
        let beginValue = 0;
        let endValue = 0;
        if(beginDateField){
          beginValue = data[beginDateField];
          if(startTime<=beginValue && endTime>=beginValue){
            if(endDateField){
              endValue = data[endDateField]
            }
            let titleValue = data[titleModel]
            if(data[titleModel+'_dictText']){
              titleValue = data[titleModel+'_dictText']
            }
            let temp = {
              id: item.id,
              title: titleValue || '无标题',
              start: new Date(data[beginDateField])
            }
            if(endDateField && data[endDateField]){
              temp['end'] = new Date(data[endDateField])
            }
            if(beginValue && endValue){
              //只有两个时间字段才需要判断全天状态
              let status = getAllDayStatus(beginValue, endValue);
              temp['allDay'] = status
              if (status) {
                // 【QQYUN-4717】将结束时间设置为下一天的0点
                temp['end'] = dayjs(temp['end']).endOf('d').add(1, 'ms').toDate();
              }
            }
            let orderContent = getOrderContent(data);
            Object.keys(orderContent).map(k=>{
              temp[k] = orderContent[k]
            });
            temp['extendedProps']={
              tag: tag,
              metaData: toRaw(item),
              index: dataIndex,
              records: records,
            };
            list.push(temp);
            break;
          }
        }
      }
    }
  }
  
  function getOrderContent(data){
    let arr = orderList.value;
    let orderContent = {}
    if(arr && arr.length>0){
      for(let item of arr){
        orderContent[item.field] = data[item.field]
      }
    }
    return orderContent
  }
  
  function getAllDayStatus(beginValue, endValue){
    let str1 = dayjs(new Date(beginValue)).format('YYYY-MM-DD');
    let str2 = dayjs(new Date(endValue)).format('YYYY-MM-DD');
    if(str1 != str2){
      return true;
    }else{
      return false
    }
  }
  

  function deleteOne(id) {
    createConfirm({
      iconType: 'warning',
      title: '删除',
      content: '确定要删除吗？',
      onOk: async () => {
        await pageApi.delete(routeCode.value, id);
        loadEvent();
      },
    });
  }

  const titleField = ref('');
  const calendarDefault = ref('dayGridMonth');
  const firstDay = ref(1);
  const weekDayList = ref([]);
  // 是否只显示工作日
  const weekStatus = ref(false);
  const lunarStatus = ref(false);
  watch(()=>props.dynamicConfig, (config)=>{
    if(config && props.viewId === config.id){
      console.log('------------props.dynamicConfig---------------->', config)
      
      titleField.value = config.titleField;
      hourStatus.value = config.hourStatus;

      if(calendar.value){
        let api = calendar.value.getApi();
        if(config.calendarDefault){
          api.changeView(config.calendarDefault)
        }
      }
      calendarDefault.value = config.calendarDefault||'dayGridMonth';
      firstDay.value = Number(config.firstDay||'1');
      if(config.weekDayList){
        weekDayList.value = config.weekDayList.map(item=>Number(item));
      }
      weekStatus.value = !!config.weekStatus;
      if(config.lunarStatus){
        lunarStatus.value = config.lunarStatus;
      }else{
        lunarStatus.value = false;
      }
      
      if(config.orders){
        orderList.value = toRaw(config.orders)
      }
    }

  }, {immediate: true, deep: true})


  /**
   * 事件排序
   * @param e1
   * @param e2
   */
  function compareEvent(e1, e2){
    let arr = orderList.value;
    return compareNext(arr, 0, e1, e2);
  }
  
  function compareNext(arr, index, e1, e2){
    if(index==arr.length){
      return 0;
    }
    let item = arr[index];
    let field = item.field;
    if(item.type == 'desc'){
      if(e1[field]>e2[field]){
        return -1
      }else if(e1[field]<e2[field]){
        return 1
      }else{
        //等于 比较下一个
        return compareNext(arr, ++index, e1, e2)
      }
    }else{
      if(e1[field]>e2[field]){
        return 1
      }else if(e1[field]<e2[field]){
        return -1
      }else{
        //等于 比较下一个
        return compareNext(arr, ++index, e1, e2)
      }
    }
  }

  /**
   * 获取时间字段的配置
   */
  function getDateFieldOptions(){
    let list = dateColumnList.value;
    let arr:any[] = [];
    if(list && list.length>0){
      for(let item of list){
        if(item.beginDateField){
          let tag = item.tag;
          if(!tag){
            tag = getFieldText(item.beginDateField)
          }
          arr.push({
            seq: item.seq,
            tag,
            //update-begin---author:wangshuai---date:2023-12-01---for:【QQYUN-4716】日历视图不支持拖拽创建---
            field: item.beginDateField,
            endField: item.endDateField,
            //update-end---author:wangshuai---date:2023-12-01---for:【QQYUN-4716】日历视图不支持拖拽创建---
          })
        }
      }
      return arr;
    }
    
    function getFieldText(key){
      let columns = allColumns.value;
      let title = ''
      for(let item of columns){
        if(item.dataIndex===key){
          title = item.title
        }
      }
      if(title){
        return '使用 '+title
      }
      return title;
    }
    return []
  }

  return {
    calendar,
    dateColumnList,
    routeCode,
    deleteOne,
    allEvents,
    allColumns,
    titleField,
    hourStatus,
    loadEvent,
    getDateFieldOptions,
    compareEvent,
    leftTimestamp,
    superQueryParams,
    weekStatus,
    weekDayList, calendarDefault, firstDay, lunarStatus,
  }
}

/**
 * 监听鼠标事件 显示提示信息
 * @param props
 */
export function useCalendarTip(props) {
  const { hasCreateAuth } = useActionAuth();
  
  let hideTimeoutEvent:any = null;
  function showCalendarTip(e){
    e.preventDefault();
    e.stopPropagation();
    //console.log(e)
    let ifAdd = hasCreateAuth(props.code);
    if(ifAdd===true){
      let tip = document.getElementById('calendar-tips'+props.viewId);
      if(tip){
        if(hideTimeoutEvent!=null){
          clearTimeout(hideTimeoutEvent);
        }
        tip.style.top = (e.clientY) + 'px';
        tip.style.left = (e.clientX ) + 'px';
        tip.style.display = 'block';

        hideTimeoutEvent = setTimeout(()=>{
          tip!.style.display = 'none';
        }, 1000)
      }
    }
  }
  function hideCalendarTip(){
    let tip = document.getElementById('calendar-tips'+props.viewId);
    if(tip){
      tip.style.display = 'none';
    }
  }

  onMounted(()=>{
    let div = document.querySelector('#a'+props.viewId+" ");
    if(div){
      let temp = div.querySelector("table tbody");
      if(temp){
        temp.addEventListener('mouseover', showCalendarTip);
        temp.addEventListener('mouseout', hideCalendarTip);
      }
    }
  });

  onUnmounted(()=>{
    let div = document.querySelector('#a'+props.viewId+" ");
    if(div){
      let temp = div.querySelector("table tbody");
      if(temp){
        temp.removeEventListener('mouseover', showCalendarTip);
        temp.removeEventListener('mouseout', hideCalendarTip);
      }
    }
  });
}
