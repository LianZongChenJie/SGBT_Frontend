import type {ViewColumn, FilterItem, FilterItemGroup, MatchType} from "../ts/type.definition";
import FormSchemaFactory from "/@/views/super/online/cgform/auto/comp/factory/FormSchemaFactory";
import {ref, unref, toRaw } from "vue";
import dayjs from "dayjs";
import {defHttp} from "@/utils/http/axios";
import {systemFields} from "../ts/type.definition";
import { add } from '/@/components/Form/src/componentMap';
import LinkRecordSelect from '../../components/linkRecord/LinkRecordSelect.vue'
import {randomString, replaceUserInfoByExpression} from "/@/utils/common/compUtils";
import {queryParentElement} from "@/utils/domUtils";
import {queryRemoteOptionsCache} from "../../utils/remoteUtils";

const queryComponentMap = {}

/**
 * 用于表单设计器的高级查询
 * 字段渲染组件
 * @param props
 * @param inPopover 是否是高级查询的pop
 */
export function useFilterField(props, inPopover?, parentClass?){
  
  addLinkRecordComp();

  /**
   * 避免重复添加
   */
  function addLinkRecordComp() {
    const key = 'linkRecordSelect'
    if(!queryComponentMap[key]){
      add(key, LinkRecordSelect)
      queryComponentMap[key] = 1;
    }
  }
  
/*  const remoteDataMap = {
  }*/

  /**
   dictCode: undefined
   dictTable: undefined
   dictText: undefined
   key: "1666856777816_780136"
   model: "radio_jt"
   name: "单选静态"
   options: (4) [{…}, {…}, {…}, {…}]
   type: "radio"
   * @param field
   */
  function getFieldConfig(field){
    let list = [
      ...(unref(props.columnList) || []),
      // 【QQYUN-5074】系统字段也要处理
      ...systemFields.map((item) => ({ ...item, model: item.field }))
    ]
    if(!list || list.length==0){
      return ''
    }
    let arr = list.filter(item=>item.model===field);
    if(!arr || arr.length==0){
      return ''
    }
    return arr[0];
  }
  
  function systemField2Data(item, queryType) {
    // field,rule,val,type: item.type,name: item.name,
    let arr = systemFields.filter(i=>i.field === item.field);
    if("create_by" === item.field || 'update_by' === item.field ){
      return {
        view: 'select_user2',
        multi: true,
        store: 'username',
        query: true,
        key: item.field,
        title: arr[0].name
      };
    }
    return {
      key: item.field,
      view: queryType=='range'?'rangeDate':item.type,
      title: arr[0].name,
      datetime: true,
    }
  }
  
  function config2Data(config, queryType){
    const {type} = config;
    switch (type) {
      case 'radio':
        return radio(config, false);
      case 'checkbox':
        return radio(config, true);
      case "select":
        return radio(config, false);
      case 'time':
        return time(config, queryType);
      case 'date':
      case 'year':
      case 'month':
        return date(config, queryType);
      case 'datetime':
        return datetime(config, queryType);
      case 'integer':
      case 'number':
      case 'money':
      case 'rate':
      case 'slider':
      case 'formula':
      case 'summary':
        return number(config, queryType);
      case 'select-depart':
        return depart(config);
      case 'select-user':
        return user(config);
      case 'table-dict':
        return tableDict(config);
      case 'select-tree':
        return selectTree(config);
      case 'switch':
        return kaiguan(config);
      case 'link-record':
        return linkRecord(config);
      case 'area-linkage':
        return areaLinkage(config);
      default:
        return input(config)
    }
  }

  function input(config){
    let data = {
      view: 'input',
      title: config.name,
    };
    return data;
  }
  
  function time(config, queryType) {
    if(queryType==='range'){
      return {
        view: 'rangeTime',
        title: config.name,
        format: config.format
      }
    }else{
      return {
        view: 'time',
        title: config.name,
      };
    }
   
  }
  function date(config, queryType){
    let view = 'date'
    if(queryType==='range'){
      view = 'rangeDate'
    }
    return {
      view,
      timestamp: config.timestamp,
      title: config.name,
      type: config.type
    };
  }
  function datetime(config, queryType){
    if(queryType==='range'){
      return {
        view: 'rangeDate',
        datetime: true,
        title: config.name,
      }
    }else{
      return {
        view: 'datetime',
        title: config.name,
      };
    }
  }
  
  function number(config, queryType) {
    if(queryType==='range'){
      return {
        view: 'rangeNumber',
        title: config.name,
      }
    }else{
      return {
        view: 'input',
        type: 'number',
        title: config.name,
      };
    }
  }
  
  function depart(config) {
    let fieldExtendJson = JSON.stringify({
      multiSelect: config.multiSelect,
      store: config.rowKey,
      primaryKey: config.rowKey
    });
    return {
      view: 'sel_depart',
      title: config.name,
      fieldExtendJson
    };
  }

  function user(config) {
    return {
      view: 'select_user2',
      multi: config.multiSelect,
      store: config.rowKey,
      title: config.name,
      query: true
    };
  }

  function tableDict(config) {
    const { dictTable, dictCode, dictText, multiple, subType, scope, name, model } = config;
    if(subType=='select'){
      if(scope=='database'){
        const view = config.filterable ? 'sel_search' : 'list';
        return {
          view: view,
          title: name,
          dictTable,
          dictCode,
          dictText
        }
      }else if(scope=='cgreport'){
        // 走popup逻辑
        return {
          view: 'popup',
          title: name,
          code: dictTable,
          popupMulti: multiple,
          orgFields: dictCode,
          destFields: model
        }
      }else{
        console.error('不识别的queryScope', scope)
      }
    }else if(subType=='popup'){
      return {
        view: 'popup',
        title: name,
        code: dictTable,
        popupMulti: multiple,
        orgFields: dictCode,
        destFields: dictText
      }
    }
    return input(config);
  }
  
  function selectTree(config){
    const { conf, dataFrom, name } = config;
    if(dataFrom=='category'){
      return {
        view: 'cat_tree',
        title: name,
        pcode: conf.category.code
      }
    }else{
      //table
      let { name, code, text, pidField, rootPid } = conf.table
      let dict = `${name},${text},${code}`;
      return {
        view: 'sel_tree',
        title: config.name,
        dict: dict,
        pidField,
        placeholder:'请选择',
        pidValue: rootPid
      }
    }
  }
  
  function kaiguan(config){
    let data = {
      view: 'list',
      title: config.name,
      multi: false
    };
    data['enum'] = [{
      value: config.options[0], title: '是'
    },{
      value: config.options[1], title: '否'
    }];
    return data;
  }
  
  function linkRecord(config) {
    const { multi, code, titleField, name } = config;
    return {
      view: 'LinkTableForQuery',
      title: name,
      multi,
      code,
      titleField
    }
  }
  
  function areaLinkage(config) {
    const { name, areaLevel } = config;
    return {
      view: 'CascaderPcaForQuery',
      title: name,
      areaLevel: areaLevel,
    }
  }
  
  function radio(config, multiple){
    const { remote, dictCode, options, name } = config;
    if(!multiple){
      multiple = config.multiple
    }
    let data = {
      view: 'list',
      title: name,
      multi: multiple||false
    };
    if(remote){
      //远程数据 不支持
    }else if(dictCode){
      // 字典
      data['dictCode'] = dictCode;
    }else{
      // 静态数据
      data['enum'] = options.map(item=>{
        return {
          ...item,
          value: item.value,
          title: item.label || item.title || item.text || item.value,
        }
      });
    }
    if (config.updateOptions) {
      data['updateOptions'] = config.updateOptions;
    }
    return data;
  }
  const systemFieldList = ['create_time', 'create_by', 'update_time', 'update_by'];

  type GetSchemaSettings = {
    scrollContainer?: string | HTMLDivElement,
    setDestroyObj?: (obj: Fn) => void,
    setFieldsValue?: (values: Recordable) => void,
    onPressEnter?: (e: KeyboardEvent) => void
  }

  function getSchema(item: Recordable, settings?: GetSchemaSettings) {
    const {scrollContainer, setDestroyObj} = settings ?? {};
    let field = item.field;
    let queryType = item.queryType || item.rule;
    // 1.找到配置
    let config = getFieldConfig(field);
    // 处理需要多选的条件
    if (['in', 'not_in'].includes(queryType)) {
      config.multi = true;
      config.multiple = true;
      config.multiSelect = true;
    }
    if(config.type === 'link-record'){
      return getLinkRecordSchema(config, item)
    }else if(config.type === 'org-role'){
      return getRoleSelectSchema(config, item)
    }
    // 2. 转化配置
    console.log(config)
    let data:any = config2Data(config, queryType);
    if(systemFieldList.indexOf(field)>=0){
      //如果是系统字段
      data = systemField2Data(item, queryType);
    }
    
    let temp = FormSchemaFactory.createFormSchema(item.field, data, item);
    temp.noChange()
    // 查询条件中的 下拉框popContainer为parentNode
    if(inPopover===true){
      temp.isInPopover();
      let popParentContainer = parentClass?parentClass:'jee-filter-select-pop'
      temp.setCustomPopContainer(popParentContainer)
    }else{
      temp.asSearchForm();
    }
    // popup组件用于设置值
    const setFieldValue = (values)=>{
      if (settings?.setFieldsValue) {
        settings.setFieldsValue(values)
      } else {
        item['val'] = values[item.field]
      }
    };
    temp.setFunctionForFieldValue(setFieldValue);
    
    let schema:any = temp.getFormItemSchema();
    schema.componentProps = schema.componentProps ?? {};

    // 添加回车事件
    if (settings?.onPressEnter) {
      schema.componentProps.onPressEnter = settings.onPressEnter
    }

    if(queryType === 'empty' || queryType === 'not_empty'){
      // 清空值
      item.val = ''
      // 禁用组件
      if(schema.componentProps){
        schema.componentProps.disabled = true
      }else{
        schema.componentProps = {
          disabled: true
        }
      }
    }
     // QQYUN-3909【应用视图】数据过滤 创建人、修改人 无法配置当前登录用户及下属
    if(schema.component === "UserSelect"){
      schema.componentProps.inSuperQuery = true;
    }
    
    // QQYUN-4624【视图】批量修改数据问题 3.年、年月 做成选择组件
    if(data.type == 'month'){
      schema.componentProps.picker = data.type
      schema.componentProps.valueFormat = 'YYYY-MM'
    }else if(data.type == 'year'){
      schema.componentProps.picker = data.type
      schema.componentProps.valueFormat = 'YYYY'
      // 时间戳模式
      schema.componentProps.timestamp = data.timestamp
    }

    // 处理需要多选的条件
    if (['in', 'not_in'].includes(queryType)) {
      schema.componentProps.mode = 'multiple'
      schema.componentProps.multi = true
      schema.componentProps.multiple = true
    }

    // update-begin--author:sunjianlei---date:20240513---for: 【QQYUN-9268】解决下拉弹出遮挡和定位问题
    schema.componentProps.dropdownClassName = 'j-dropdown-class-name__' + randomString(12);
    schema.componentProps.getPopupContainer = (element: HTMLElement) => {
      // update-begin--author:liusq---date:20240603---for: 【TV360X-644】表单设计器查询条件-部门组件切换筛选条件时，页面报错卡死
      if (element && element['_POPUP_CONTAINER_EVENT']) {
        return document.body
      }
      // update-end--author:liusq---date:20240603---for: 【TV360X-644】单设计器查询条件-部门组件切换筛选条件时，页面报错卡死
      const cls: string[] = []
      let parent: Nullable<HTMLDivElement> = null
      if (typeof scrollContainer === 'string') {
        cls.push(scrollContainer)
      } else if (scrollContainer instanceof HTMLElement) {
        parent = scrollContainer
      }
      if (parent == null) {
        parent = queryParentElement(element, (node) => cls.findIndex(c => node.classList.contains(c)) >= 0) as HTMLDivElement
      }
      if (!parent) {
        return document.body
      }
      const listener = () => {
        let dropdown = document.querySelector('.' + schema.componentProps.dropdownClassName) as HTMLDivElement
        if (dropdown) {
          let rect = element.getBoundingClientRect()
          // 计算下拉框的top位置
          dropdown.style.top = (rect.top + rect.height + 4) + 'px'
        }
      }
      parent.addEventListener('scroll', listener)
      setDestroyObj && setDestroyObj(() => parent?.removeEventListener('scroll', listener))
      element['_POPUP_CONTAINER_EVENT'] = true
      return document.body
    }
    // update-end--author:sunjianlei---date:20240513---for: 【QQYUN-9268】解决下拉弹出遮挡和定位问题

    console.log('schema', schema)
    return schema
  }

  /**
   * 获取关联记录的表单项
   * @param config
   */
  function getLinkRecordSchema(config, item) {
    const { model, code, name, multi, showFields } = config;
    let schema:any = {
      component: "linkRecordSelect",
      field: model,
      componentProps:{
        code: code,
        multi: multi,
        titleField: config.titleField,
        showFields: toRaw(showFields),
        style:{
          width: '100%'
        },
        getContainer: ()=>document.body
      },
      itemProps:{
        labelCol: {class: 'online-form-label'}
      },
      label: name,
      labelLength: 4,
    };

    let popParentContainer = parentClass?parentClass:'jee-filter-select-pop'
    if(inPopover === true){
      schema.componentProps['getContainer'] = ()=>{
        return document.querySelector(`.${popParentContainer}`)
      }
    }
    let queryType = item.queryType || item.rule;
    if(queryType === 'empty' || queryType === 'not_empty'){
      // 清空值
      item.val = '';
      // 禁用组件
      schema.componentProps.disabled = true;
    }
    console.log('schema link-record', schema)
    return schema;
  }

  /**
   * 获取 角色选择 组件配置
   * @param config
   * @param item
   */
  function getRoleSelectSchema(config, item) {
    const { model, multiple, name } = config;
    let schema:any = {
      component: "RoleSelect",
      field: model,
      componentProps:{
        multi: multiple,
        store: 'code',
        style:{
          width: '100%'
        },
        getContainer: ()=>document.body
      },
      itemProps:{
        labelCol: {class: 'online-form-label'}
      },
      label: name,
      labelLength: 4,
    };

    let popParentContainer = parentClass?parentClass:'jee-filter-select-pop'
    if(inPopover === true){
      schema.componentProps['getContainer'] = ()=>{
        return document.querySelector(`.${popParentContainer}`)
      }
    }
    let queryType = item.queryType || item.rule;
    if(queryType === 'empty' || queryType === 'not_empty'){
      // 清空值
      item.val = '';
      // 禁用组件
      schema.componentProps.disabled = true;
    }
    console.log('schema role-select', schema)
    return schema;
  }
  
  return {
    getSchema,
    getFieldConfig
  }
}

/**
 * 将列的配置从json数据中拿出来 用于表单渲染
 */
export function useColumnConfig() {

  // 设计器code
  const desformCode = ref<string>()

  const columnList = ref<ViewColumn[]>([]);
  function initColumnList(designForm) {
    let temp: ViewColumn[] = [];
    desformCode.value = designForm.desformCode;
    let jsonStr = designForm.desformDesignJson;
    if (jsonStr) {
      let json = JSON.parse(jsonStr);
      let widgetList = json.list;
      let titleFieldModel = ''
      if(json.config){
        if(json.config.titleField){
          titleFieldModel = json.config.titleField
        }
      }
      addViewColumn(temp, widgetList, titleFieldModel);
    }
    console.log('the last columns-->', temp);
    columnList.value = temp;
  }

  const ignoreTypes = ['button', 'buttons', 'grid', 'card', 'tabs', 'text', 'divider', 'barcode'];
  // 如果是grid可能列配置会有嵌套
  function addViewColumn(columnArray, list, titleFieldModel) {
   
    if (list && list.length > 0) {
      for (let item of list) {
        // 处理逻辑删除的字段
        if (item.delFlag === true) {
          continue;
        }
        if(item.type === "sub-table-design"){
          const subColumnTemp: ViewColumn[] = [];
          const arr = item.columns.flatMap((c) => c.list ?? []);
          addViewColumn(subColumnTemp, arr, arr?.[0]?.model);
          columnArray.push({
            name: item.name,
            key: item.key,
            model: item.model,
            type: item.type,
            columns: subColumnTemp,
          });
          continue;
        }
        
        //update-begin-author:taoyan date:2023-7-25 for: QQYUN-5927【表单设计器】视图 关联记录拖至tab中 视图中的字段不显示了
        if(item.panes && item.panes.length>0){
          let panesList = item.panes;
          for(let panel of panesList){
            let panesList = panel.list;
            if(panesList && panesList.length>0){
              addViewColumn(columnArray, panesList, titleFieldModel)
            }
          }
          continue;
        }
        //update-end-author:taoyan date:2023-7-25 for: QQYUN-5927【表单设计器】视图 关联记录拖至tab中 视图中的字段不显示了
        
        if (item.columns && item.columns.length > 0) {
          //说明是嵌套列
          for (let c of item.columns) {
            if (!c.list) {
              console.error('no column');
            } else {
              addViewColumn(columnArray, c.list, titleFieldModel);
            }
          }
        } else {
          if(ignoreTypes.indexOf(item.type)>=0){
            if(item.list){
              addViewColumn(columnArray, item.list, titleFieldModel);
            }
          }else{
            let temp = {
              name: item.name,
              key: item.key,
              model: item.model,
              type: item.type,
              rules: item.rules||[]
            };
            if(titleFieldModel == item.model){
              temp['isTitle'] = true;
            }
            if (item.options) {
              temp['required'] = item.options.required;
              temp['unique'] = item.options.unique;
              // 转换type类型
              if (item.type === 'formula') {
                if (item.options.type === 'date') {
                  // DATEADD = 为日期加减时间
                  if (item.options.mode === 'DATEADD') {
                    item.type = 'date';
                    item.options.format = item.options.datePrintFormat;
                  } else {
                    item.type = 'input';
                  }
                  item.options.type = item.type
                  item.options.timestamp = false;
                } else {
                  item.type = 'number';
                }
                temp.type = item.type;
              }

              // 转换他表字段类型
              if(item.type == 'link-field'){
                temp['saveType'] = item.options.saveType;

                //update-begin-author:taoyan date:2023-4-26 for: QQYUN-5207【表单设计器】他表字段仅显示的时候，筛选列表应该不显示
                temp['realType'] = temp.type;
                //update-end-author:taoyan date:2023-4-26 for: QQYUN-5207【表单设计器】他表字段仅显示的时候，筛选列表应该不显示

                // 【QQYUN-4977】从他表字段中获取出类型
                if (item.options.fieldType) {
                  temp['type'] = item.options.fieldType;
                }
                // 【QQYUN-6160】从他表字段中获取options配置
                if (item.options.fieldOptions) {
                  item.options = {
                    ...item.options,
                    ...item.options.fieldOptions
                  }
                }
              }

              if (item.type == 'link-record') {
                temp['multi'] = item.options.showMode==='many';
                temp['titleField'] = item.options.titleField;
                temp['showFields'] = item.options.showFields;
                temp['code'] = item.options.sourceCode;
                temp['multiple'] =  item.options.showMode==='many';
                if(item.options.showMode == 'many' && item.options.showType == 'table'){
                  temp['isSubTable'] = true;
                }else{
                  temp['isSubTable'] = item.isSubTable || false
                }
              } else if(item.type == 'select-depart' || item.type == 'select-user'|| item.type == 'org-role'){
                temp['rowKey'] = item.options.customReturnField;
                temp['multiSelect'] = item.options.multiple;
                temp['multiple'] =  item.options.multiple;
                temp['dataAuthType'] =  item.options.dataAuthType;
              }else if(item.type == 'date'){
                temp['type'] = item.options.type;
                temp['format'] = item.options.format;
                temp['timestamp'] = item.options.timestamp;
              } else if(item.type === 'time'){
                temp['format'] = item.options.format;
              }else if(item.type == 'switch'){
                temp['options'] = [item.options.activeValue, item.options.inactiveValue];
              }else if(item.type == 'select-tree'){
                temp['dataFrom'] = item.options.dataFrom;
                temp['conf'] = item.options.conf;
                temp['multiple'] = item.options.multiple;
              }else if(item.type == 'area-linkage'){
                temp['areaLevel'] = item.options.areaLevel ?? 3;
              } else{
                temp['dictCode'] = item.options.dictCode;
                temp['dictTable'] = item.options.dictTable;
                temp['dictText'] = item.options.dictText;
                temp['options'] = item.options.options;
                if(item.type === 'select'){
                  if(item.options.multiple===true){
                    temp['multiple'] =  true;
                  }else{
                    temp['multiple'] =  false;
                  }
                }
                if(item.type == "table-dict"){
                  // 表字典是否多选
                  temp['multiple'] =  item.options.multiple;
                  // popup-select
                  temp['subType'] = item.options.style;
                  // database-cgreport
                  temp['scope'] = item.options.queryScope;
                  temp['filterable'] = item.options.filterable;
                }
                if (['radio', 'checkbox', 'select'].includes(item.type)) {
                  // 【QQYUN-5384】当之前设置过数据字典，但又改为静态数据，走的还是数据字典的逻辑。
                  // 所以这里判断一下，如果不是数据字典，就把数据字典的字段去掉
                  if (item.options.remote !== 'dict') {
                    delete temp['dictCode'];
                  }

                  // 判断是否使用了远程取值下拉选项
                  if (item.options.remote === 'linkData') {
                    // 查询工作表
                    temp['options'] = ref([{value: "loading", title: "加载中…", disabled: true}])
                    temp['updateOptions'] = () => loadLinkDataOptions(temp, item)
                    temp['updateOptions']()
                  } else if (item.options.remote === true) {
                    // 远端选项
                    temp['options'] = ref([{value: "loading", title: "加载中…", disabled: true}])
                    temp['updateOptions'] = () => loadRemoteOptions(temp, item)
                    temp['updateOptions']()
                  }
                }
              }
            }
            columnArray.push(temp);
            
          }
          
        }
      }
    }
  }

  /** 加载下拉查询工作表 */
  async function loadLinkDataOptions(schema, widget) {
    try {
      const res = await defHttp.get({
        url: '/desform/data/queryLinkDataOptions',
        params: {
          desformCode: desformCode.value,
          fieldModel: widget.model,
        }
      }, {isTransformResponse: false})
      if (res?.success) {
        schema.options.value = res.result
      } else {
        console.error('查询工作表下拉项查询失败：', res);
      }
    } catch (e) {
      console.error('查询工作表下拉项查询失败：', e);
    }
  }

  /** 加载远程选项 */
  async function loadRemoteOptions(schema: Recordable, widget: Recordable) {
    try {
      schema.options.value = await queryRemoteOptionsCache(widget)
    } catch (e) {
      console.error('查询工作表下拉项查询失败：', e);
    }
  }

  return {
    columnList,
    initColumnList
  }
  
}


/**
 * 不同组件对应的条件类型不一样
 */
export function useComponentCondition() {
  const conditionOptions = [
    { label: '包含', value: 'like' },
    { label: '等于', value: 'eq' },
    { label: '以..开始', value: 'right_like' },
    { label: '以..结尾', value: 'left_like' },
    { label: '在...中', value: 'in' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'ge' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'le' },
    { label: '多词匹配', value: 'like_with_and' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' },
  ];

  /**
   * QQYUN-4273【表单设计器】筛选 高级查询  1.文本类型没有大于、大于等于 等可屏蔽掉
   * 普通输入框
   */
  const inputConditionOptions = [
    { label: '包含', value: 'like' },
    { label: '等于', value: 'eq' },
    { label: '以..开始', value: 'right_like' },
    { label: '以..结尾', value: 'left_like' },
    { label: '在...中', value: 'in' },
    { label: '不等于', value: 'ne' },
    { label: '多词匹配', value: 'like_with_and' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' },
  ];
  
  /**时间、数值*/
  const numberConditionOptions = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'ge' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'le' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' },
    { label: '在范围内', value: 'range' },
  ];
  
  /**用户、部门、下拉树、表字典 此类支持多选的选择形的组件*/
  const selectConditionOptions = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '是其中一个', value: 'in' },
    { label: '不是其中一个', value: 'not_in' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' },
  ];

  /**
   * 支持数组格式的
   * 下拉、多选、关联记录
   */
  const selectMultiConditionOptions = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '是其中一个', value: 'in' },
    { label: '不是其中一个', value: 'not_in' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' },
  ];

  /**
   * 支持数组格式的
   * 下拉、多选、关联记录
   */
  const linkRecordConditionOptions = [
    ...selectMultiConditionOptions,
    { label: '查询工作表', value: 'linkage' }
  ];

  /**单选、省市区*/
  const radioConditionOptions = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '是其中一个', value: 'in' },
    { label: '不是其中一个', value: 'not_in' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' },
  ];

  /**开关*/
  const switchConditionOptions = [
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' },
  ];

  /* 子表 sub-table-design */
  const subTableConditionOptions = [
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' }
  ];

  /** 地图 */
  const mapConditionOptions = [
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' }
  ]

  // 通用的，只有为空和不为空两个条件
  const emptyConditionOptions = [
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' }
  ]

  function getConditionOptions(type: string, isMulti?: boolean, isRightFilter = false){
    // QQYUN-4273【表单设计器】筛选 高级查询
    if(type == 'select' && isMulti === false){
      return radioConditionOptions
    }
    switch (type) {
      case 'radio':
      case 'area-linkage':
        return radioConditionOptions;
      case 'switch':
        return switchConditionOptions;
      case 'time':
      case 'year':
      case 'month':
      case 'date':
      case 'datetime':
      case 'integer':
      case 'number':
      case 'money':
      case 'rate':
      case 'slider':
      case 'formula':
      case 'summary':
        return numberConditionOptions;
      case 'select-depart':
      case 'select-user':
      case 'table-dict':
      case 'select-tree':
      case 'org-role':
        return selectConditionOptions;
      case 'checkbox':
      case 'select':
        return selectMultiConditionOptions;
      case 'link-record':
        return (isRightFilter && !isMulti) ? linkRecordConditionOptions : selectMultiConditionOptions;
      case 'sub-table-design':
        return subTableConditionOptions;
      case 'map':
      case 'location':
        return mapConditionOptions;
      case 'color':
      case 'markdown':
      case 'imgupload':
      case 'file-upload':
        return emptyConditionOptions;
      default:
        return inputConditionOptions
    }
  }
  
  function getDefaultRule(type){
    switch (type) {
      case 'radio':
      case 'switch':
      case 'time':
      case 'year':
      case 'month':
      case 'date':
      case 'datetime':
      case 'integer':
      case 'number':
      case 'money':
      case 'checkbox':
      case "select":
      case 'select-depart':
      case 'select-user':
      case 'org-role':
      case 'table-dict':
      case 'select-tree':
      case 'link-record':
      case 'area-linkage':
      case 'rate':
      case 'slider':
      case 'formula':
      case 'summary':
        return 'eq';
      case 'map':
      case 'location':
      case 'sub-table-design':
      case 'color':
      case 'markdown':
      case 'imgupload':
      case 'file-upload':
        return 'empty'
      default:
        return 'like';
    }
  }
  
  function getDefaultVal(type){
    // link-record 比较特殊，实际存的是字符串，但是设置空数组可以实现清空选中的效果
    const selectComp = ['select', 'radio', 'checkbox', 'link-record'];
    if(type == 'slider' || type == 'rate'){
      return 0;
    }
    if(selectComp.indexOf(type)>=0){
      return []
    }else{
      return ''
    }
  }
  
  function getTypeLabel(value) {
    let arr = conditionOptions.filter(item=>item.value===value);
    if(arr.length==0){
      arr = numberConditionOptions.filter(item=>item.value===value);
    }
    if(arr.length==0){
      arr = selectConditionOptions.filter(item=>item.value===value);
    }
    if(arr.length==0){
      arr = selectMultiConditionOptions.filter(item=>item.value===value);
    }
    if(arr.length==0){
      arr = radioConditionOptions.filter(item=>item.value===value);
    }
    if(arr.length==0){
      return value
    }
    return arr[0].label;
  }

  /**
   * 判断 数据是否满足条件（分组）
   * @param cGroups 条件分组
   * @param type 父matchType
   * @param record 数据
   */
  function ifGroupTrue(cGroups: FilterItemGroup[], type: MatchType, record: any): boolean {
    if (!Array.isArray(cGroups) || cGroups.length == 0) {
      return true;
    }
    let flag = true
    for (const cGroup of cGroups) {
      const {matchType, queryItems} = cGroup
      if (matchType === 'and') {
        flag = ifAndTrue(queryItems, record);
      } else if (matchType === 'or') {
        flag = ifOrTrue(queryItems, record);
      }
      // 如果父type为and，只要有一个条件不满足，直接返回false
      if (type === 'and' && !flag) {
        return false
      }
      // 如果父type为or，只要有一个条件满足，直接返回true
      else if (type === 'or' && flag) {
        return true
      }
    }
    return flag
  }

  /**
   * 判断 数据是否满足条件
   * @param conditions 条件
   * @param record 数据
   */
  function ifTrue(conditions:FilterItem[], type:string, record:any):boolean {
    if(!conditions || conditions.length==0){
      return true;
    }
    if(type === 'and'){
      return ifAndTrue(conditions, record);
    }else if(type === 'or'){
      return ifOrTrue(conditions, record);
    }
    return false
  }
  
  function ifAndTrue(conditions:FilterItem[], record:any) {
    let flag = true;
    for(let item of conditions){
      let { rule } = item;
      let temp = false;
      if(rule){
        temp = switchRule(item, record)
      }
      flag = temp && flag;
      if(flag===false){
        break;
      }
    }
    return flag
  }

  function ifOrTrue(conditions: FilterItem[], record:any) {
    let flag = false;
    for(let item of conditions){
      let { rule } = item;
      let temp = false;
      if(rule){
        temp = switchRule(item, record)
      }
      flag = temp || flag;
      if(flag===true){
        break;
      }
    }
    return flag
  }
  
  function like_with_and(dataVal, conditionVal) {
    let arr:any[] = []
    if (conditionVal instanceof Array) {
      arr = [...conditionVal];
    }else{
      arr = conditionVal.split(',');
    }
    for(let item of arr){
      if(dataVal.indexOf(item)>=0){
        return true;
      }
    }
    return false
  }
  
  function range(dataVal, conditionVal) {
    if (conditionVal instanceof Array) {
      return dataVal>=conditionVal[0] && dataVal<=conditionVal[1]
    }else{
      let arr = conditionVal.split(',');
      return dataVal>=arr[0] && dataVal<=arr[1]
    }
  }
  
  function eleMatch(dataVal, conditionVal) {
    let arr:any[] = []
    if (conditionVal instanceof Array) {
      arr = [...conditionVal];
    }else{
      arr = conditionVal.split(',');
    }
    for(let item of arr){
      if(dataVal.indexOf(item)>=0){
        return true;
      }
    }
    return false
  }

  function empty(val) {
    if(val===0){
      return false
    }
    if(val instanceof Array){
      return val.length == 0;
    }
    return !val;
  }
  
  function notEmpty(val) {
    if(val === 0){
      return true
    }
    if(!!val){
      if(val instanceof Array){
        return val.length > 0;
      }
      return true
    }
    return false
  }

  /**
   * 判断 值与逗号隔开的字符串 匹配
   * @param dataVal
   * @param conditionVal
   */
  function inArrayString(dataVal, conditionVal){
    let arr: string[] = Array.isArray(conditionVal) ? conditionVal : conditionVal.split(',');
    if(dataVal instanceof Array && dataVal.length==1){
      let temp = dataVal[0];
      if(arr.indexOf(temp)>=0){
        return true
      }
    }else{
      if(arr.indexOf(dataVal)>=0){
        return true
      }
    }
    return false;
  }

  /**
   * 判断条件值 和 实际数据值 是否满足rule
   * @param item
   * @param record
   */
  function switchRule(item: FilterItem, record) {
    let { type, field, rule, val } = item;
    // @ts-ignored
    let flag = switchRuleHandle(type, rule, val, record[field])
    if (flag) {
      return true
    }
    // 特殊处理日期
    if (type === 'date') {
      // 转换成时间戳
      let timestampVal = dayjs(val as string).toDate().getTime()
      if (isNaN(timestampVal)) {
        return false;
      }
      return switchRuleHandle(type, rule, timestampVal, record[field])
    }
    return false
  }

  /**
   * 判断条件值 和 实际数据值 是否满足rule
   * @param type
   * @param rule
   * @param conditionVal
   * @param dataVal
   */
  function switchRuleHandle(type: string, rule: string, conditionVal: any, dataVal: any) {
    // 【QQYUN-6074】替换表达式（#{xxx}）为实际值
    conditionVal = replaceUserInfoByExpression(conditionVal);
    if (conditionVal == null) {
      conditionVal = ''
    }
    // QQYUN-4501【严重bug】89、视图按钮筛选条件不对，激活状态为空的时候，按钮没出来——陶炎
    if (dataVal == null) {
      dataVal = ''
    }

    let handleAfter = {rule, conditionVal}
    if (type === 'area-linkage') {
      handleAfter = handleAreaLinkage(rule, conditionVal)
    }
    rule = handleAfter.rule
    conditionVal = handleAfter.conditionVal

    switch (rule) {
      case 'like':
        return dataVal.indexOf(conditionVal)>=0;
      case 'eq':
        return conditionVal==dataVal;
      case 'right_like':
        return dataVal.startsWith(conditionVal);
      case 'not_right_like':
        return !dataVal.startsWith(conditionVal);
      case 'left_like':
        return dataVal.endsWith(conditionVal);
      case 'not_left_like':
        return !dataVal.endsWith(conditionVal);
      case 'in':
        return inArrayString(dataVal, conditionVal);
      case 'ne':
        return dataVal!=conditionVal;
      case 'gt':
        return dataVal > conditionVal;
      case 'ge':
        return dataVal >= conditionVal;
      case 'lt':
        return dataVal < conditionVal;
      case 'le':
        return dataVal <= conditionVal;
      case 'like_with_and':
        return like_with_and(dataVal, conditionVal);
      case 'empty':
        return empty(dataVal);
      case 'not_empty':
        return notEmpty(dataVal);
      case 'range':
        return range(dataVal, conditionVal);
      case 'elemMatch':
        return eleMatch(dataVal, conditionVal)
      default:
        return false;
    }
  }

  /**
   * 处理地区联动组件
   * @param rule
   * @param conditionVal
   */
  function handleAreaLinkage(rule: string, conditionVal: any) {
    let handleAfter = {rule, conditionVal}
    if (conditionVal && /^LIKE_\d/.test(conditionVal)) {
      const valArr = conditionVal.split('_')
      if (valArr.length === 3) {
        let level = Number(valArr[1]);
        let endIndex = level == 1 ? 2 : level == 2 ? 4 : -1;
        if (endIndex != -1) {
          handleAfter.conditionVal = valArr[2].substring(0, endIndex);
          handleAfter.rule = rule === 'eq' ? 'right_like' : 'not_right_like'
        }
      }
    }
    return handleAfter
  }

  return {
    getConditionOptions,
    getDefaultRule,
    getDefaultVal,
    getTypeLabel,
    ifTrue,
    ifGroupTrue,
  }
}

