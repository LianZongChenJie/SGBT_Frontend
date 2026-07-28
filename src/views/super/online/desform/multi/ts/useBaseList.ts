import type {FormActionType} from "@/components/Form";
import {ref, computed, watchEffect, toRaw, onUnmounted} from 'vue';
import dayjs from 'dayjs';
import { systemFields } from './type.definition';
import {useColumnConfig, useFilterField } from './useFilterField'
/**
 * 
 * @param props
 */
export function useBaseList(props, tableAction, allColumns) {
  let intervalInst:any = '';
  
  const checkedList = ref([])
  const { getItem } = useTableColumnShower(checkedList);
  
  watchEffect(async ()=>{
    let config = props.dynamicConfig;
    let currentColumns = allColumns.value;
    if(config.lineHeight){
      await getInstance(tableAction.getTableRef())
      tableAction.setProps({
        size: config.lineHeight
      })
    }
    autoRefresh(config);
    
    if(currentColumns.length>0){
      // 根据配置的显示隐藏展示具体的列
      showColumn(config);
    }
    
  });
  


  //自动刷新
  function autoRefresh(config) {
    if(config.autoRefresh>0){
      if(intervalInst){
        //先关闭上次的定时
        clearInterval(intervalInst)
      }
      intervalInst = setInterval(async ()=>{
        await getInstance(tableAction.getTableRef());
        console.log('自动刷新列表', dayjs(new Date()).format("HH:mm:ss"))
        tableAction.reload();
      }, config.autoRefresh*1000)
    }else{
      if(intervalInst){
        console.log('关闭自动刷新', dayjs(new Date()).format("HH:mm:ss"))
        clearInterval(intervalInst)
      }
    }
  }

  onUnmounted(() => {
    if (intervalInst) {
      console.log('页面卸载，关闭自动刷新', dayjs(new Date()).format("HH:mm:ss"))
      clearInterval(intervalInst)
    }
  })

  /**
   * 默认配置列
   * 需要判断系统字段和显示字段
   */
  function handleDefaultColumnConfig(config){
    let currentColumns = toRaw(allColumns.value);
    // 显示字段配置--这里的字段不包括系统字段
    let showList = config.showColumnList;
    if(showList && showList.length>0){
      // 移除隐藏列-表单字段
      let hideList1 = showList.filter(item=>item.show==false).map(item=>item.field);
      currentColumns = currentColumns.filter(item=>hideList1.indexOf(item.key)<0);
    }

    // 系统字段配置
    let sysList = config.systemColumnList;
    if(sysList && sysList.length>0){
      // 移除隐藏列-系统字段
      let hideList2 = sysList.filter(item=>item.show==false).map(item=>item.field);
      currentColumns = currentColumns.filter(item=>hideList2.indexOf(item.key)<0);
      // 追加显示的系统字段 
      let systemShowList = sysList.filter(item=>item.show==true).map(item=>item.field);
      for(let field of systemShowList){
        if(existField(field, currentColumns)){
        }else{
          let temp = addSysColumn(field, systemFields)
          currentColumns.push(temp)
        }
      }
    }
    return currentColumns;
  }

  function handleDiyColumnConfig(config){
    let currentColumns = toRaw(allColumns.value);
    // 表格配置 自定义字段配置
    let list = config.columnList;
    if(list && list.length>0){
      let arr:any[] = [];
      let hideList:any[] = [];
      // 显示字段配置--这里的字段不包括系统字段
      let showList = config.showColumnList;
      if(showList && showList.length>0){
        // 移除隐藏列-表单字段
        hideList = showList.filter(item=>item.show==false).map(item=>item.field);
      }
      list.sort(function(a,b) {
        return a.seq - b.seq;
      });
      for(let i=0;i<list.length;i++){
        let field = list[i].field;
        if(hideList.indexOf(field)<0){
          if(list[i].show==true){
            let {temp} = getItem(field, currentColumns)
            if(temp){
              arr.push(temp)
            }else{
              console.error('不识别的列', field)
            }
          }
        }
      }
      return arr;
    }else{
      return currentColumns;
    }
  }
  const tableColumns = ref<any[]>([])
  //列配置
  async function showColumn(config){
    await getInstance(tableAction.getTableRef());
    let myColumns:any[] = [];
    if(config.showColumn == 'default' || !config.showColumn){
      // 默认只配置了 系统字段，
      myColumns = handleDefaultColumnConfig(config);
    }else if(config.showColumn == 'diy'){
      // 自定义的 配置了列的显示和顺序
      myColumns = handleDiyColumnConfig(config)
    }
    console.log('列表列-->', myColumns)
    //update-begin-author:taoyan date:2023-2-15 for:QQYUN-4274 【表单设计器】字段多的时候 列表表格错位了
    let maxWidth = window.innerWidth - 530;
    let totalWith = 0;
    for(let item of myColumns){
      totalWith+=item.width;
    }
    // 当总宽度小于最大宽度时，不需要滚动条
    if (totalWith < maxWidth && myColumns.length > 0) {
      // 删除最后一列的宽度，以自适应
      delete myColumns[myColumns.length-1].width
    }
    //update-end-author:taoyan date:2023-2-15 for:QQYUN-4274 【表单设计器】字段多的时候 列表表格错位了
    tableAction.setColumns(myColumns);
    tableColumns.value = myColumns;
  }
  
  function addSysColumn(field, list){
    let arr = list.filter(item=>item.field==field);
    return systemFieldconfig2Column(arr[0])
  }
  
  function existField(field, columns){
    let flag = false;
    for(let item of columns){
      if(item.key == field){
        flag = true;
      }
    }
    return flag;
  }

  return {
    tableColumns
  }
}

function getInstance(componentRef) {
  return new Promise((resolve) => {
    (function next() {
      let ref = componentRef.value;
      if (ref) {
        resolve(ref);
      } else {
        setTimeout(() => {
          next();
        }, 100);
      }
    })();
  });
}

export function useTableColumnShower(checkedList) {
  
  function addOptions(config, options){
    let flag = false
    if(config.showColumn == 'default'){
      let checkeds = checkedList.value;
      let list = config.systemColumnList;
      if(list && list.length>0){
        let showList = list.filter(item=>item.show==true).map(item=>item.field);
      //  let hideList = list.filter(item=>item.show==false).map(item=>item.field);
       // options = options.filter(item=>hideList.indexOf(item.value)<0);
        //追加显示列
        for(let field of showList){
          if(existField(field, options)){
          }else{
            let arr = systemFields.filter(item=>item.field==field);
            let item = arr[0];
            checkeds.push(item.field);
            flag = true;
            options.push({
              label: item.name,
              value: item.field,
            })
          }
        }
        // allColumns.value = currentColumns;
      }
      checkedList.value = checkeds;
    }else if(config.showColumn == 'diy'){
      let arr:any[] = [];
      let checkeds = checkedList.value;
      // 调整顺序
      let list = config.columnList;
      if(list){
        list.sort(function(a,b) {
          return a.seq - b.seq;
        });
        if(list.filter(item=>item.show==true).length!=options.length){
          flag=true;
        }
        for(let i=0;i<list.length;i++){
          let field = list[i].field;
          if(list[i].show===true){
            checkeds.push(field);
          }else{
            checkeds = checkeds.filter(item=>item!=field)
          }
          let {temp, index} = getItem(field, options);
          arr.push(temp)
          if(index!=i){
            flag=true;
          }
        }
      }
      if(arr.length>0){
        options = arr;
      }
      checkedList.value = checkeds;
    }
    return {
      hasChange: flag,
      newOptions: options
    };
  }

  const systemFieldDataList = [
    {name:'创建时间', show: false, field: 'create_time', type:'date', seq: 100},
    {name:'创建人', show: false, field: 'create_by', type:'input', seq: 101},
    {name:'修改时间', show: false, field: 'update_time', type:'input', seq: 102},
    {name:'修改人', show: false, field: 'update_by', type:'input', seq: 103},
    {name:'流程状态', show: false, field: 'bpm_status', type:'select', seq: 104, dictCode: 'bpm_status'},
  ];


  /**
   * 通过字段名找 字段 
   * 
   * @param field
   * @param options
   */
  function getItem(field, options){
    let temp:any = '';
    let index = -1;
    for(let i=0;i<options.length;i++){
      if(field===options[i].value || field===options[i].key){
        temp = options[i];
        index = i;
        break;
      }
    }
    if(!temp){
      //没找到 找系统字段
      for(let i=0;i<systemFieldDataList.length;i++){
        let item = systemFieldDataList[i];
        if(field===item.field){
          temp = systemFieldconfig2Column(item)
          break;
        }
      }
    }
    
    return {
      index,
      temp
    };
  }

  function addColumns(config, columns){
    if(config.showColumn == 'default'){
      let list = config.systemColumnList;
      if(list && list.length>0){
        let showList = list.filter(item=>item.show==true).map(item=>item.field);
        //追加显示列
        for(let field of showList){
          if(existField(field, columns)){
          }else{
            let arr = systemFields.filter(item=>item.field==field);
            let item:any = {
              key: arr[0].field,
              title: arr[0].name,
              align: 'center',
              sorter: true,
              dataIndex: arr[0].field,
            };
            if(item.key=='create_time'|| item.key=='update_time'){
              item.customRender = ({ text })=>{
                if(!text){
                  return ''
                }
                return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
              }
            }
            columns.push(item)
          }
        }
      }
    } else if(config.showColumn == 'diy'){
      let arr:any[] = [];
      // 调整顺序
      let list = config.columnList;
      if(list){
        list.sort(function(a,b) {
          return a.seq - b.seq;
        });
        for(let i=0;i<list.length;i++){
          let field = list[i].field;
          if(list[i].show==true){
            let {temp} = getItem(field, columns)
            arr.push(temp)
          }
        }
      }
      columns = arr;
    }
    return columns;
  }

/*  function addSysColumn(field, list){
    let arr = list.filter(item=>item.field==field);
    let item = arr[0]
    return {
      key: item.field,
      title: item.name,
      align: 'center',
      sorter: true,
      dataIndex: item.field
    }
  }*/

  function existField(field, options){
    let flag = false;
    for(let item of options){
      if(item.value == field || item.key == field){
        flag = true;
      }
    }
    return flag;
  }
  
  return {
    addOptions,
    addColumns,
    getItem
  }
  
}


function systemFieldconfig2Column(config){
  let item = config;
  let temp:any = {
    key: item.field,
    title: item.name,
    align: 'center',
    sorter: true,
    // 【QQYUN-4690】日期控件的默认宽度宽一点，防止换行
    width: ['date', 'datetime'].includes(item.type) ? 200 : 150,
    dataIndex: item.field
  }
  if(temp.key=='create_time'|| temp.key=='update_time'){
    temp.customRender = ({ text })=>{
      if(!text){
        return ''
      }
      return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
    }
  }else{
    temp.customRender = ({ text, record })=>{
      if(!text){
        return ''
      }
      return record[temp.dataIndex+"_dictText"]
    }
  }
  return temp;
}

/**
 * 用于获取列表查询条件配置
 * 支持组件：
 * 
 */
export function useSearchForm(tableAction){

  // 获取列配置
  const { columnList, initColumnList } = useColumnConfig();
  
  const {getSchema} = useFilterField({
    columnList
  });

  /**
   * 查询条件配置获取
   * @param listView
   * @param designForm
   */
  async function reloadSearchFormSchema(listView, designForm){
    let queryList = listView.queryList;
    let queryButton = listView.queryButton;
    let schemas:any[] = await getSearchFormSchema(queryList, designForm);
    await getInstance(tableAction.getTableRef());
    let buttonStatus = true;
    if(queryButton===false){
      buttonStatus = false
    }
    if(schemas && schemas.length>0){
      let formConfig ={
        labelWidth: 120,
        schemas: schemas,
        autoAdvancedCol: 3,
        showResetButton: buttonStatus,
        showSubmitButton: buttonStatus,
        autoSearch: !buttonStatus,
        actionColOptions: {
          style: { textAlign: 'left', paddingLeft: '10px' },
        },
      }
      tableAction.setProps({formConfig, useSearchForm: true})
    } else {
      tableAction.setProps({formConfig: {schemas:[]}, useSearchForm: false})
    }
  }
  
  
  async function getSearchFormSchema(queryList, designForm){
    initColumnList(designForm);
    let arr:any[] = [];
    if(queryList && queryList.length>0){
      const searchFormRef = tableAction.getForm() as FormActionType

      for(let item of queryList){
        let temp = getSchema(item, {
          setFieldsValue: searchFormRef.setFieldsValue,
          // 回车时触发查询（仅输入框组件）
          onPressEnter: () => searchFormRef.submit(),
        });
        arr.push({
          ...temp,
          colProps: { span: 6 }
        });
        /*let field = item.field;
        let name = getName(field)
        arr.push({
          field: field,
          label: name,
          component: 'Input',
        })*/
      }
    }
    console.log('查询条件表单--->', arr)
    return arr
  }

  return {
    reloadSearchFormSchema
  }
}

/**
 * 用于左侧筛选列表
 */
export function useLeftFilterList(){
  const expandLeft = ref(false);
  const treeKeyWord = ref('');
  const tableStyle = computed(()=>{
    if(expandLeft.value == true){
      return {
        width: 'calc(100% - 220px)'
      }
    }else{
      return {
        width: 'calc(100% - 30px)'
      }
    }
  });
  
  const treeData = ref();
  const expandedKeys = ref([])
  const selectedKeys = ref([]);
  
  function handleSelect(){
    
  }
  
  function onLoadData(){
    
  }

  
  return {
    expandLeft,
    treeKeyWord,
    tableStyle,

    treeData,
    expandedKeys,
    selectedKeys,
    handleSelect,
    onLoadData
  }
  
}
