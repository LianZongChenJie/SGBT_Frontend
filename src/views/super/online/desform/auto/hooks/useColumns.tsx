import type { Ref } from 'vue';
import { ref, unref, h } from 'vue';
import dayjs from 'dayjs';
import type {BasicColumn, TableActionType} from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
import { pushIfNotExist, simpleDebounce } from '/@/utils/common/compUtils';
import { getIsLowAppEnv } from '/@/utils/super/low/lowAppUtils';
import { filterDictText, initDictOptions } from '/@/utils/dict/JDictSelectUtil';
// @ts-ignored
import { getAreaTextByCode } from '/@/components/Form/src/utils/Area';
import { pageApi, updateWidgetByKeyModel } from '../auto.desform.api';
import { recursiveAllWidget, transitHttp } from '../../utils/desformUtils';
import { defHttp } from '/@/utils/http/axios';
import LinkRecordTags from '../components/LinkRecordTags.vue';
import {useSearchForm} from '/@/views/super/online/desform/multi/ts/useBaseList'
import { reactive } from 'vue';
import { useLowAppAuthStore } from "/@/store/modules/lowAppAuth";
import { useFuncSwitch } from "/@/hooks/jeecg/desform/useFuncSwitch";
import { useUserStore } from '/@/store/modules/user';
import { Tag } from "ant-design-vue";
import { getItemColor } from "/@/utils/dict/DictColors.js";

type Props = {
  desformCode: Ref;
  desformName?: Ref;
  buttonsAuth?: Ref;
  translData?: Ref;
  remoteOptionsMap?: Ref;
  dynamicConfig?: Recordable
  notBaseList?: number

  maxColumnLength?: number
};

type Methods = {
  tableAction?: TableActionType,
  loadData?: Fn,
  openLinkRecord?: Fn,
}

export function useColumns(props: Props, methods?: Methods) {
  const { createMessage: $message } = useMessage();
  // 所有可展示出来的列
  const allColumns = ref<BasicColumn[]>([]);
  // 所有可展示出来的列keys
  const allColumnKeys = new Map<any, BasicColumn>();
  // 高级查询条件
  const superQueryFields = ref<Recordable>({});
  // 关联记录控件实例（key=widgetKey，value=widget）
  const linkRecordWidget = ref<Record<string, Recordable>>({});
  // 关联记录的数据（key=desformCode，value=[]）
  const linkRecordDataMap = ref<Record<string, Recordable[]>>({});
  let searchFormRef: Nullable<ReturnType<typeof useSearchForm>> = null;
  if (methods?.tableAction) {
    searchFormRef = useSearchForm(methods?.tableAction);
  }
  const authStore = useLowAppAuthStore();
  const {allowFuncList} = useFuncSwitch()

  const extendConfig = reactive({
    dictCountList: [],
    total: 0,
    treeModel: {}
  });

  // 错误提示
  const errorTips = reactive({
    notDesignForm: false,
  });

  //update-begin-author:taoyan date:2023-2-14 for: QQYUN-4116【表单】表单设计器字段权限设置不可见，表单上好使，但是列表上还是可以看到这个字段
  /**
   * 获取旧的权限配置数据，用于重新渲染列表列
   */
  const userStore = useUserStore();
  async function getOldAuthData(code){
    const authUrl = '/desform/auth/query/'+code;
    const authList = await defHttp.get({ url: authUrl });
    let excludeFieldList:any[] = [];
    console.log('data1', authList);
    if(authList && authList.length>0){
      let username = userStore.getUserInfo.username;
      const userUrl = '/desform/auth/queryUser/' + username;
      const user = await defHttp.get({ url: userUrl });
      const { departs, roles, userInfo} = user;
      for(let item of authList){
        if(item.permissionType=='field' && item.authType=='1'){
          if(item.authScopeIsAll === 'N'){
            let userStr = item.authScopeUsersVal;
            let hasAuth = false;
            //判断用户
            if(userStr){
              let arr1 = userStr.split(',')
              if(userInfo && userInfo.username){
                if(arr1.indexOf(userInfo.username)>=0){
                  hasAuth = true;
                }
              }
            }
            //判断角色
            let roleStr = item.authScopeRolesVal;
            if(roleStr){
              let arr2 = roleStr.split(',');
              if(roles && roles.length>0){
                for(let i=0;i<arr2.length;i++){
                  if(roles.indexOf(arr2[i])>=0){
                    hasAuth = true;
                    break;
                  }
                }
              }
            }
            //判断部门
            let depStr = item.authScopeDepartsVal;
            if(depStr){
              let arr3 = depStr.split(',');
              if(departs && departs.length>0){
                for(let i=0;i<arr3.length;i++){
                  if(departs.indexOf(arr3[i])>=0){
                    hasAuth = true;
                    break;
                  }
                }
              }
            }
            if(hasAuth===false){
              excludeFieldList.push(item.authComKey)
            }
          }
        }
      }
    }
    return excludeFieldList;
  }
  //update-end-author:taoyan date:2023-2-14 for: QQYUN-4116【表单】表单设计器字段权限设置不可见，表单上好使，但是列表上还是可以看到这个字段

  /**
   * 加载列配置
   * @param code
   * @param subBtnAuth 视图的按钮权限
   * @param isSearch 是否是查询条件触发的
   */
  async function loadColumnsInfo(code, subBtnAuth?, isSearch?) {
    if(!code){
      console.error('加载表单的字段配置失败: code 为空!');
      return;
    }

    console.info(' ==>==>==> 加载表单的字段配置, code :', code);
    let loadColumnsParams = {};
    if(props.dynamicConfig && props.dynamicConfig.id){
      loadColumnsParams['listViewId'] = props.dynamicConfig.id;
    }
    const oldAuthExcludeFieldKeyList = await getOldAuthData(code);
    let { designForm, buttonsAuth, listView, allowFunc } = await pageApi.getColumns(code, loadColumnsParams);
    // 赋值功能开关
    if (Array.isArray(allowFunc)) {
      allowFuncList.value = allowFunc
    }
    if (props.buttonsAuth && props.notBaseList !== 1) {
      if (!subBtnAuth) {
        props.buttonsAuth.value = buttonsAuth;
      } else {
        props.buttonsAuth.value = subBtnAuth;
      }
      props.desformCode.value = designForm.desformCode;
      if (props.desformName) {
        props.desformName.value = designForm.desformName;
      }

      // update-begin--author:sunjianlei---date:20240604---for：【TV360X-633】视图应该单独走自己的设计，先注释掉
      // 判断是否是子视图
      // if (designForm.desformType === 2) {
      //   props.desformCode.value = designForm.parentCode;
      //   // 视图需要查询父级的字段，但按钮权限还是需要保留视图自己的
      //   return loadColumnsInfo(designForm.parentCode, buttonsAuth);
      // }
      // update-end--author:sunjianlei---date:20240604---for：【TV360X-633】视图应该单独走自己的设计，先注释掉
      // 判断是否是子视图
      if (designForm.desformType === 2) {
        // 子视图的部分逻辑也需要走主视图的逻辑
        props.desformCode.value = designForm.parentCode;
      }
    }
    let designJson = designForm.desformDesignJson;
    if (designJson == null) {
      errorTips.notDesignForm = true;
      return;
    }
    let json = JSON.parse(designJson);
    // 初始化
    allColumns.value = [];
    allColumnKeys.clear();
    superQueryFields.value = {};
    // 高级查询条件—，一对一的子表单独的集合
    const superQuerySubOne: Recordable = {};
    // 允许使用字典的组件
    const dictWidgets = ['select', 'radio', 'checkbox'];
    // 所有待加载的远程选项
    const allRemoteOptions: Recordable[] = [];

    // 字段查看权限
    let excludeFields:any[] = authStore.getExcludeFields(code)||[];
    let hasAdminAuth = authStore.getLowAppAdminAuth();
    const isValidField = (key)=>{
      //update-begin-author:taoyan date:2023-2-14 for: QQYUN-4116【表单】表单设计器字段权限设置不可见，表单上好使，但是列表上还是可以看到这个字段
      if(oldAuthExcludeFieldKeyList.indexOf(key)>=0){
        return false;
      }
      //update-end-author:taoyan date:2023-2-14 for: QQYUN-4116【表单】表单设计器字段权限设置不可见，表单上好使，但是列表上还是可以看到这个字段
      if(hasAdminAuth===true){
        return true
      }
      return excludeFields.indexOf(key)<0;
    }

    // 限制最多显示列数，-1为不限制【注：若要修改，后端也要同步修改】
    // DesignFormDataMongoServiceImpl.java:handleTableQueryNeedFields()
    const maxColumnLength = listView.showColumn === 'default' ? (props.maxColumnLength ?? 50) : -1;
    let currColumnLength = 0;

    let index = 1;
    /** 封装column，同时封装高级查询条件 */
    const packageColumn = (item) => {
      // 限制最多显示列数
      if (maxColumnLength !== -1 && currColumnLength >= maxColumnLength) {
        return;
      }
      // 处理逻辑删除的字段
      if (item.delFlag === true) {
        return;
      }
      // 不显示无法操作的组件
      if (checkIsDisableOperation(item)) {
        return;
      }

      // 忽略部分显示【注：若要修改，后端也要同步修改】
      let ignores = ['button', 'buttons', 'grid', 'card', 'tabs', 'text',  'divider', 'barcode'];
      // 【QQYUN-8909】默认不展示大字段
      if (maxColumnLength !== -1) {
        ignores.push('textarea', 'markdown', 'editor')
      }
      if (ignores.indexOf(item.type) === -1 && isValidField(item.key)) {
        let options = item.options;
        let name = item.name.trim() || item.model;
        const extraProps: Recordable = {
          // 是否是主表字段
          isMainField: item.modelType === 'main',
        }
        if (!extraProps.isMainField) {
          // 子表字段的表名
          extraProps.subTableName = options.subTableName
        }
        let column: BasicColumn = {
          key: item.key,
          title: name,
          ellipsis: true,
          align: 'center',
          sorter: {
            multiple: index++
          },
          width: 190,
          dataIndex: item.model,
          compType: item.type,
          extraProps: extraProps,
        };
        if(item.type === 'link-record'){
          if(options.showMode == 'many' && options.showType == 'table'){
            column['isSubTable'] = true;
          }else{
            column['isSubTable'] = item.isSubTable || false
          }
        }
        if(item.type === 'link-field'){
          column['saveType'] = item.options.saveType;
        }
        //update-begin-author:taoyan date:2023-1-13 for: QQYUN-3822【视图】列表怎么多了个流程状态
        if(item.key === 'bpmStatus'){
          column.ifShow = false;
        }
        //update-end-author:taoyan date:2023-1-13 for: QQYUN-3822【视图】列表怎么多了个流程状态
        // 高级查询类型，可根据校验的不同生成不同的类型
        let superQueryType = item.type;

        // update-begin--author:sunjianlei---date:220230425---for： 【QQYUN-4745】他表字段类型特殊处理
        if (item.type === 'link-field') {
          // 判断是否存储了他表类型
          if (item.options && item.options.fieldType) {
            // 目前只支持这几种类型
            if (['rate', 'slider', 'color', 'imgupload', 'file-upload'].includes(item.options.fieldType)) {
              item.type = item.options.fieldType;
              column.compType = item.options.fieldType;
              column.dataIndex = item.model + '_dictText';
            }
          }
        }
        // update-end--author:sunjianlei---date:220230425---for： 【QQYUN-4745】他表字段类型特殊处理

        // 判断是否使用了字典，是就做字典翻译（或远程数据）
        if (dictWidgets.includes(item.type)) {
          for (let i = 0; i < dictWidgets.length; i++) {
            let { remote, remoteFunc } = options;
            // 远端数据翻译
            if (remote === true && remoteFunc) {
              pushIfNotExist(allRemoteOptions, item);
              column.customRender = ({ text }) => {
                return filterDictText(props.remoteOptionsMap?.value?.[item.key], text);
              };
            }
          }
        }
        // 翻译省市区组件（旧版已注释）
        // if (item.type === 'area-linkage') {
        //   column.customRender = ({ text }) => {
        //     try {
        //       // TODO getAreaTextByCode 待测试
        //       return getAreaTextByCode(text);
        //     } catch (e) {
        //       console.error(e);
        //       return text;
        //     }
        //   };
        // }
        // 图片特殊处理
        else if (item.type === 'imgupload') {
          column.slots = { customRender: 'view-picture' };
        }
        // 文件特殊处理
        else if (item.type === 'file-upload') {
          column.slots = { customRender: 'view-file' };
        }
        // 子表
        else if(item.type === 'sub-table-design'){
          column.slots = { customRender: 'view-sub-table' };
        }
        // 开关特殊处理
        else if (item.type === 'switch') {
          column.customRender = ({ text }) => {
            let activeValue = options.activeValue || true;
            // @ts-ignore
            return <a-switch size="small" checked={text === activeValue} disabled />;
          };
        }
        // 滑块特殊处理
        else if (item.type === 'slider') {
          superQueryType = 'number';
          let { min, max } = options;
          column.customRender = ({ text }) => {
            // @ts-ignore
            return <a-slider value={text} min={min} max={max} disabled style={"margin:0;"} />;
          };
        }
        //评分组件
        else if (item.type === 'rate') {
          superQueryType = 'number';
          let { max, allowHalf } = options;
          column.customRender = ({ text }) => {
            let val = parseInt(text);
            // @ts-ignore
            return <a-rate value={val} count={max} allowHalf={allowHalf} disabled style={"margin:0;font-size: 16px;"} />;
          };
        }
        // 颜色选择组件
        else if (item.type === 'color') {
          column.slots = { customRender: 'view-color' };
        }
        // 关联记录组件
        else if (item.type === 'link-record') {
          linkRecordWidget.value[item.key] = item;
          linkRecordDataMap.value[item.options.sourceCode] = [];
          column.customRender = ({ text, record }) => getLinkRecordData(text, record, item);
        }

        // 日期组件
        else if (item.type === 'date') {
          column.customRender = ({ text, record }) => {
            // 如果有字典翻译，则使用字典翻译
            const dictField = item.model + '_dictText';
            if (record[dictField]) {
              return record[dictField]
            }
            // 如果返回时间戳，则转换为日期格式
            if (options.timestamp && text != null && text !== '') {
              options.format = options.format.replace(/yyyy/g, 'YYYY')
              options.format = options.format.replace(/dd/g, 'DD')
              const format = (v) => dayjs(v).format(options.format);
              if (Array.isArray(text)) {
                return text.map(format).join(',');
              }
              return format(text);
            }
            return text;
          };
        }
        currColumnLength++;
        allColumns.value.push(column);
        allColumnKeys.set(column.key, column);
        // 格式化字符串，一般用于高级查询的日期格式处理
        let formatStr = null;
        // 特殊处理 input 的类型
        if (item.type === 'input') {
          if (Array.isArray(item.rules) && item.rules.length > 0) {
            for (let rule of item.rules) {
              // 如果校验是数字类型，那么高级查询的type也应该是number
              let numberTypes = ['number', 'integer', 'float'];
              if (numberTypes.includes(rule.type)) {
                superQueryType = 'number';
                break;
              }
            }
          }
        }
        // 处理金额类型
        if (item.type === 'money') {
          superQueryType = 'number';
        }
        // 处理整数类型
        if (item.type === 'integer') {
          superQueryType = 'number';
        }
        // 处理日期类型
        if (item.type === 'date') {
          if (options.type === 'datetime') {
            superQueryType = 'datetime';
          }
          formatStr = options.format;
        }
        // 处理时间类型
        if (item.type === 'time') {
          formatStr = options.format;
        }
        // 处理下拉选项
        if (Array.isArray(options.options) && options.options.length > 0) {
          options.options.forEach((opt) => {
            // 处理没有显示label的情况
            opt.label = opt.label ? opt.label : opt.value;
          });
        }

        // 通用翻译（当没有自定义渲染函数或插槽时才应用）
        if (!column.customRender && !column.slots?.customRender) {
          column.customRender = ({ record }) => {
            let field = item.model;
            let dictField = field + '_dictText';
            if (record.hasOwnProperty(dictField)) {
              field = dictField;
            }
            let data = record[field];
            if (data == null || data === '') {
              data = record[item.model];
            }
            //update-begin---author:wangshuai---date:2023-10-11---for:【QQYUN-6638】字典配置颜色后 列表展示---
            return setDictColor(item, record, data);
            //update-end---author:wangshuai---date:2023-10-11---for:【QQYUN-6638】字典配置颜色后 列表展示---
          };
        }

        // 是否有远程下拉选项
        let hasRemote = options.remote === true && options.remoteFunc;
        let pushQuery = superQueryFields;
        // 判断是否是一对一
        if (/#/.test(item.model)) {
          let subKey = item.model.split('#')[0];
          let subFields = superQuerySubOne[subKey] || {};
          superQuerySubOne[subKey] = subFields;
          pushQuery = subFields;
        }
        unref(pushQuery)[item.model] = {
          view: superQueryType,
          title: name,
          // 当设置了字典的时候才传dictCode
          dictCode: options.remote === 'dict' ? options.dictCode : null,
          dictTable: options.dictTable,
          // 当远程加载数据时，高级查询下拉选项是远程数据，否则就是静态数据
          remoteOptionsKey: hasRemote ? item.key : null,
          options: hasRemote ? [] : options.options,
          // 如果是日期类型，是否需要转为时间戳
          timestamp: hasRemote ? [] : options.timestamp,
          customReturnField: options.customReturnField,
          formatStr,
          formatValue: (value) => {
            if (item.type === 'date') {
              if (options.timestamp) {
                return dayjs(value).toDate().getTime();
              }
            }
            return value;
          },
        };
      }
    };

    recursiveAllWidget(json.list, (item, parent) => {
      if (parent && parent.type === 'sub-table-design') {
        // do nothing
      } else {
        packageColumn(item);
      }
    });
    // 加载远程选项
    loadRemoteOptions(allRemoteOptions);
    // 合并一对一子表到 superQuery 里
    assignSuperQuerySubOne(superQuerySubOne);
    // 增加 bpmStatus 列
    // pushBpmStatusColumn();

    if (props.notBaseList !== 1) {
      // 查询条件
      if (searchFormRef) {
        await searchFormRef.reloadSearchFormSchema(listView, designForm);
      }
      methods?.tableAction?.setProps({
        immediate: false
      });
      // 当查询条件为空时，或不是等待执行查询后才显示数据，则执行查询方法
      if (listView.queryList?.length === 0 || !listView.waitQuery || isSearch) {
        await methods?.loadData?.(props.desformCode.value);
      }
      extendConfig.dictCountList = listView.dictCountList
      extendConfig.total = listView.total;
      extendConfig.treeModel = listView.treeModel;
    }

    console.log('列表列的信息', allColumns.value)
    return listView;
  }

  /**
   * 检查组件是否禁止操作【注：若要修改，后端也要同步修改】
   * @param widget
   */
  function checkIsDisableOperation(widget) {
    if (['link-record'].includes(widget.type)) {
      const {options: {sourceIsDelete}} = widget
      return sourceIsDelete === true
    }
    return false;
  }

  /** 增加 bpmStatus 列*/
  // @ts-ignored
  function pushBpmStatusColumn() {
    // 仅在lowApp环境下才增加
    if (getIsLowAppEnv()) {
      let columnKey = 'bpmStatus';
      let column: BasicColumn = {
        title: '流程状态',
        key: columnKey,
        dataIndex: '_record.bpmStatus_dictText',
        width: 100,
      };
      allColumns.value.push(column);
      allColumnKeys.set(columnKey, column);
    }
  }

  /** 加载远程选项 */
  function loadRemoteOptions(remoteOptions: Recordable[]) {
    remoteOptions.forEach(async (element) => {
      let { key, options } = element;
      let { remoteFunc: remoteUrl, props: optProps } = options;
      remoteUrl = remoteUrl.trim();
      // 内部请求直接请求，外部请求需要中转
      let response;
      if (/^https?/.test(remoteUrl)) {
        response = await transitHttp.get({ url: remoteUrl }, {isTransformResponse: false});
      } else {
        response = await defHttp.get({ url: remoteUrl }, {isTransformResponse: false});
      }
      let remoteOptions: any = null;
      // 返回值可能存在的情况：
      // 1、直接返回了个数组
      // 2、result是个数组
      // 3、result.records是个数组（后台包裹了分页对象）
      if (Array.isArray(response)) {
        remoteOptions = response;
      } else if (response.success) {
        if (Array.isArray(response.result)) {
          remoteOptions = response.result;
        } else if (response.result && Array.isArray(response.result.records)) {
          remoteOptions = response.result.records;
        }
      }
      if (remoteOptions == null) {
        console.error('远端数据请求失败：', response);
        return Promise.reject(response);
      }
      remoteOptions = remoteOptions.map((item) => {
        return {
          value: item[optProps.value],
          label: item[optProps.label],
          text: item[optProps.label],
          // children: item[options.optProps.children]
        };
      });
      if (props.remoteOptionsMap) {
        props.remoteOptionsMap.value[key] = remoteOptions;
      }
      // 由于可能在加载完高级查询时还没有加载出远程数据，所以需要同步更新下
      for (let [, field] of Object.entries(superQueryFields.value)) {
        if (field.remoteOptionsKey === key) {
          field.options = remoteOptions;
          break;
        }
      }
    });
  }

  // 合并一对一子表到 superQuery 里
  async function assignSuperQuerySubOne(superQuerySubOne: Recordable) {
    let subOneKeys = Object.keys(superQuerySubOne);
    if (subOneKeys.length > 0) {
      let tableTxtMap = await queryOnlineTableTxt(subOneKeys);
      for (const subOneKey of subOneKeys) {
        superQueryFields[subOneKey] = {
          view: 'table',
          title: tableTxtMap.has(subOneKey) ? tableTxtMap.get(subOneKey) : subOneKey,
          fields: superQuerySubOne[subOneKey],
          // 是否仅包含字段名，不需要拼接子表表名
          onlyFieldName: true,
        }
      }
    }
  }

  // 查询online表单的表名
  async function queryOnlineTableTxt(tableName: string[]) {
    let tableTxtMap = new Map<string, string>();
    try {
      let dictCode = 'onl_cgform_head,table_txt,table_name';
      // TODO 不能使用 拼接 in 条件查询，因为逗号有冲突
      // let whereSql = `table_name in ("${tableName.join('","')}")`
      // 拼接 or 条件查询
      let whereSql = ` (table_name = '${tableName.join(`' or table_name = '`)}')`;
      let { success, result, message } = await initDictOptions(`${dictCode},${whereSql}`, false);
      if (success) {
        for (let item of result) {
          tableTxtMap.set(item.value, item.text);
        }
      } else {
        $message.warn('查询附表名失败：' + (message || '未知错误'));
      }
    } catch (e: any) {
      console.error(e);
      $message.warn('查询附表名失败：' + e.message);
    }
    return tableTxtMap;
  }

  // update-begin--Author:sunjianlei Date:20220805 for：他表字段的逻辑 --------------------
  // 等待被查询的数据ID
  let queryLinkRecordIdsMap = new Map<string, string[]>();

  // 查询关联记录的数据（防抖）
  // @ts-ignored
  const queryLinkRecordDataDebounce = simpleDebounce((formKey, widget) => {
    for (let [desformCode, ids] of queryLinkRecordIdsMap.entries()) {
      queryLinkRecordData(desformCode, ids, formKey, widget);
    }
  }, 100);

  // 查询关联记录的数据
  async function queryLinkRecordData(desformCode, ids, formKey, widget) {
    // 空数据不查询
    if (!ids || ids.length === 0) {
      return;
    }
    let res = await pageApi.list({ desformCode, id: ids.join(','), pageSize: ids.length, translInData: true });
    if (!res.success) {
      if (res.code === 404) {
        // 更新删除状态
        widget.options.sourceIsDelete = true;
        // @ts-ignore 删除该列
        allColumns.value = allColumns.value.filter((i) => i.key !== widget.key);
        // 调接口更新表单
        try {
          updateWidgetByKeyModel(
            formKey,
            {model: widget.model},
            'update',
            {options: {sourceIsDelete: true}},
          )
        } catch (e) {
          console.error(e)
        }
      } else {
        $message.warn(res.message);
      }
      return;
    }
    for (const record of res.result.records) {
      let fields = JSON.parse(record.desformDataJson);
      linkRecordDataMap.value[desformCode].push({ id: record.id, fields: fields });
      let waitQueryId = queryLinkRecordIdsMap.get(desformCode)!;
      waitQueryId.splice(waitQueryId.indexOf(record.id), 1);
    }
  }

  // 获取关联字段的数据
  function getLinkRecordData(ids, record, widget) {
    if (!ids || ids.length == 0) {
      return '';
    }
    if(ids instanceof Array){
    }else{
      ids = ids.split(',')
    }
    // 过滤空字符串
    ids = ids.filter(i => !!i);
    let records: any[];
    const {
      options: { sourceCode },
      model,
    } = widget;
    const recordsModel = model + '_dictRecords';
    if (Array.isArray(record[recordsModel])) {
      records = record[recordsModel];
    } else {
      records = ids.map((id) => ({ id, text: id }));
    }

/*  // ----------------------- 老逻辑，需要查询后台，性能较慢 ---------------------
    // 关联表单code，标题字段
    let { sourceCode, titleField } = widget.options;
    let dataList = linkRecordDataMap.value[sourceCode];
    if (!dataList) {
      dataList = [];
      linkRecordDataMap.value[sourceCode] = dataList;
    }
    // 没有获取到数据，则需要查询的ID
    let queryIds: string[] = [];
    // 通过id获取数据（数组），如果没有获取到，则需要查询
    let records = ids.map((id) => {
      let data = dataList.find((i) => i.id === id);
      if (data) {
        let text = data.fields[titleField];
        let dictText = data.fields[titleField + '_dictText'];
        if (dictText) {
          text = dictText;
        }
        if (!text) {
          text = '未命名';
        }
        return {id: id, text: text};
      }
      pushIfNotExist(queryIds, id);
      return { id: id, text: id };
    });
    // 存在未获取到数据的ID，进行查询操作
    if (queryIds.length > 0) {
      let waitIds = queryLinkRecordIdsMap.get(sourceCode);
      if (!waitIds) {
        queryLinkRecordIdsMap.set(sourceCode, queryIds);
      } else {
        queryIds.forEach((id) => pushIfNotExist(waitIds, id));
      }
      // @ts-ignore 查询数据（防抖）
      queryLinkRecordDataDebounce(unref(props.desformCode), widget);
    }
    // ----------------------- 老逻辑，需要查询后台，性能较慢 ---------------------
*/

    return h(LinkRecordTags, {
      records,
      onOpen(id) {
        methods?.openLinkRecord?.(sourceCode, id);
      },
    });
  }

  //======================= begin 处理字典颜色 ============================================================
  /**
   * 设置字典颜色
   * @param item
   * @param record
   * @param data
   */
  function setDictColor(item, record, data) {
    let type = ['select', 'radio', 'checkbox']
    //判断当前类型是否是下拉框、单选按钮、多选框，其他没有字典颜色
    if (type.indexOf(item.type) != -1) {
      let dictColor = record[item.model + '_dictColor'];
      //没有字典颜色直接返回数据
      if (!dictColor || dictColor.length == 0) {
        //如果字典颜色为空，判断数据时候为数组，如果为数组返回逗号拼接的字符串
        if (Array.isArray(data)) {
          return data.join(',');
        }
      } else if (dictColor) {
        //有字典颜色的时候用tag显示出来
        let dictData: any = [];
        //获取字典颜色
        let dictColors = dictColor.split(",");
        //获取字典文本
        let dictTxts = data.split(",");
        for (let i = 0; i < dictTxts.length; i++) {
          //获取字体颜色
          let color = getItemColor(dictColors[i]);
          //将每个tag放进一个数组
          dictData.push(h(Tag, {
            color: dictColors[i],
            style: {"margin-left": "5px", "color": color}
          }, () => dictTxts[i]));
        }
        return h('div', dictData)
      }
    } else {
      // 处理数组，逗号分隔
      if (Array.isArray(data)) {
        return data.join(',');
      }
    }
    return data;
  }
  //========================= end 处理字典颜色 ============================================================

  return {
    allColumns,
    allColumnKeys,
    superQueryFields,
    loadColumnsInfo,
    linkRecordDataMap,
    extendConfig,

    errorTips,
  };
}

/**
 * 轮询获取 ref 对象的值，获取为true或是真实存在 就执行下一步逻辑，可用于判断状态或组件的加载是否完成
 * @param componentRef
 */
export function getRefPromise(componentRef) {
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
