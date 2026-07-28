<template>
  <JVxeTable
    ref="tableRef"
    row-class-name="online-config-page"
    rowNumber
    keyboardEdit
    :maxHeight="tableHeight.noToolbar"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :disabledRows="{ dbFieldName: ['id', 'has_child'] }"
    @valueChange="handleValueChange"
    v-bind="tableProps" >
    <!-- 定义插槽开始了 -->
    <template #fieldConfig="props">
      <a-button type="primary" v-if="showConfigButton(props)" size="small" ghost @click="openConfig(props)">更多配置</a-button>
    </template>
  </JVxeTable>
  
  <!-- 关联记录弹窗配置 -->
  <link-table-config-modal @register="registerModal" @success="handleConfigData"/>
  
  <!-- 他表字段弹窗配置 -->
  <link-table-field-config-modal @register="registerFieldModal" @success="handleFieldConfigData"/>

  <!-- 扩展参数弹窗配置 -->
  <FieldExtendJsonModal @register="registerExtJsonModal" @success="handleExtJson"/>
</template>

<script lang="ts">
  import { ref, defineComponent } from 'vue';
  import { JVxeTypes, JVxeColumn } from '/@/components/jeecg/JVxeTable/types';
  import { useTableSync } from '../../hooks/useTableSync';
  import LinkTableConfigModal from '../../extend/linkTable/LinkTableConfigModal.vue'
  import LinkTableFieldConfigModal from '../../extend/linkTable/LinkTableFieldConfigModal.vue'
  import FieldExtendJsonModal from '../../extend/FieldExtendJsonModal.vue'
  import { useModal } from '/@/components/Modal';

  const commonPageOptions = [
    { title: '文本框', value: 'text' },
    { title: '密码', value: 'password' },
    { title: '下拉框', value: 'list' },
    { title: '单选框', value: 'radio' },
    { title: '多选框', value: 'checkbox' },
    { title: '开关', value: 'switch' },
    { title: '日期(年月日)', value: 'date' },
    { title: '日期(年月日时分秒)', value: 'datetime' },
    { title: '时间(HH:mm:ss)', value: 'time' },
    { title: '文件', value: 'file' },
    { title: '图片', value: 'image' },
    { title: '多行文本', value: 'textarea' },
    { title: '富文本', value: 'umeditor' },
    { title: 'MarkDown', value: 'markdown' },
    { title: '用户选择', value: 'sel_user' },
    { title: '部门选择', value: 'sel_depart' },
    { title: '关联记录', value: 'link_table' },
    { title: '他表字段', value: 'link_table_field' },
    { title: '省市区组件', value: 'pca' },
    { title: 'Popup弹框', value: 'popup' },
    // update-begin--author:liaozhiyang---date:20240130---for：【QQYUN-7961】popupDict字典
    { title: 'Popup字典', value: 'popup_dict' },
    // update-end--author:liaozhiyang---date:20240130---for：【QQYUN-7961】popupDict字典
    { title: '下拉多选框', value: 'list_multi' },
    { title: '下拉搜索框', value: 'sel_search' },
    { title: '分类字典树', value: 'cat_tree' },
    { title: '自定义树控件', value: 'sel_tree' },
    { title: '联动组件', value: 'link_down' }
  ];
  const subTablePageOptions = [
    { title: '文本框', value: 'text' },
    { title: '单选框', value: 'radio' },
    { title: '开关', value: 'switch' },
    { title: '日期(yyyy-MM-dd)', value: 'date' },
    { title: '日期（yyyy-MM-dd HH:mm:ss）', value: 'datetime' },
    { title: '时间（HH:mm:ss）', value: 'time' },
    { title: '文件', value: 'file' },
    { title: '图片', value: 'image' },
    { title: '下拉框', value: 'list' },
    { title: '下拉多选框', value: 'list_multi' },
    { title: '下拉搜索框', value: 'sel_search' },
    { title: 'popup弹出框', value: 'popup' },
    // update-begin--author:liaozhiyang---date:20240130---for：【QQYUN-7961】popupDict字典
    // { title: 'Popup字典', value: 'popup_dict' },
    // update-end--author:liaozhiyang---date:20240130---for：【QQYUN-7961】popupDict字典
    { title: '部门选择', value: 'sel_depart' },
    { title: '用户选择', value: 'sel_user' },
    { title: '省市区组件', value: 'pca' },
    { title: '多行文本', value: 'textarea' },
  ];

  export default defineComponent({
    name: 'PageAttributeTable',
    components: {
      LinkTableConfigModal,
      LinkTableFieldConfigModal,
      FieldExtendJsonModal
    },
    setup() {
      const columns = ref<JVxeColumn[]>([
        { title: '字段名称', key: 'dbFieldName', width: 100 },
        { title: '字段备注', key: 'dbFieldTxt', width: 150 },
        {
          title: '表单显示',
          key: 'isShowForm',
          width: 80,
          type: JVxeTypes.checkbox,
          align: 'center',
          customValue: ['1', '0'],
          defaultChecked: true,
        },
        {
          title: '列表显示',
          key: 'isShowList',
          width: 80,
          type: JVxeTypes.checkbox,
          align: 'center',
          customValue: ['1', '0'],
          defaultChecked: true,
        },
        {
          title: '是否排序',
          key: 'sortFlag',
          width: 80,
          type: JVxeTypes.checkbox,
          align: 'center',
          customValue: ['1', '0'],
          defaultChecked: false,
          // update-begin--author:liaozhiyang---date:20240528---for：【TV360X-291】没勾选同步数据库禁用排序功能
          props: {
            isDisabledCell({ row, column }) {
              let { dbTable } = tables;
              // 获取到 dbTable（数据库属性） 中的数据
              const dbRowData = dbTable.value!.tableRef!.getTableData({ rowIds: [row.id] })[0];
              return dbRowData?.dbIsPersist == '0' ? true : false;
            },
          },
          // update-end--author:liaozhiyang---date:20240528---for：【TV360X-291】没勾选同步数据库禁用排序功能
        },
        {
          title: '是否只读',
          key: 'isReadOnly',
          width: 80,
          type: JVxeTypes.checkbox,
          align: 'center',
          customValue: ['1', '0'],
          defaultChecked: false,
        },
        {
          title: '控件类型',
          key: 'fieldShowType',
          width: 170,
          type: JVxeTypes.select,
          options: commonPageOptions,
          defaultValue: 'text',
          placeholder: '请选择${title}',
          validateRules: [{ required: true, message: '请选择${title}' }, { handler: validateFieldShowType }],
        },
        {
          title: '控件长度',
          key: 'fieldLength',
          width: 100,
          titleHelp: { message: '此长度只对子表列字段宽度有效！'},
          type: JVxeTypes.inputNumber,
          defaultValue: 120,
          placeholder: '请输入控件长度',
        },
        {
          title: '是否查询',
          key: 'isQuery',
          width: 80,
          type: JVxeTypes.checkbox,
          align: 'center',
          customValue: ['1', '0'],
          defaultChecked: false,
          // update-begin--author:liaozhiyang---date:20240528---for：【TV360X-423】未勾选同步数据库禁用查询
          props: {
            isDisabledCell({ row, column }) {
              let { dbTable } = tables;
              // 获取到 dbTable（数据库属性） 中的数据
              const dbRowData = dbTable.value!.tableRef!.getTableData({ rowIds: [row.id] })[0];
              return dbRowData?.dbIsPersist == '0' ? true : false;
            },
          },
          // update-end--author:liaozhiyang---date:20240528---for：【TV360X-423】未勾选同步数据库禁用查询
        },
        {
          title: '查询类型',
          key: 'queryMode',
          width: 120,
          type: JVxeTypes.select,
          options: [
            { title: '普通查询', value: 'single' },
            { title: '模糊查询', value: 'like' },
            { title: '范围查询', value: 'group' },
          ],
          defaultValue: 'single',
          placeholder: '请选择${title}',
          validateRules: [{ handler: validateQueryMode }],
          props: {
            isDisabledCell({ row, column }) {
              // update-begin--author:liaozhiyang---date:20240717---for：【TV360X-222】范围查询只支持数字和日期类型
              // let { dbTable } = tables;
              // // 获取到 dbTable（数据库属性） 中的数据
              // const dbRowData = dbTable.value!.tableRef!.getTableData({ rowIds: [row.id] })[0];
              // if (['double', 'int', 'BigDecimal', 'Date', 'Datetime'].includes(dbRowData?.dbType)) {
              //   return false;
              // }
              // return true;
              // update-end--author:liaozhiyang---date:20240717---for：【TV360X-222】范围查询只支持数字和日期类型
            },
          },
        },
        {
          title: '控件默认值',
          key: 'fieldDefaultValue',
          width: 140,
          type: JVxeTypes.input,
          props: {
            allowClear: true,
          },
          defaultValue: '',
        },
        {
          title: '定义转换器',
          key: 'converter',
          width: 150,
          type: JVxeTypes.input,
          defaultValue: '',
        },
        {
          title: '扩展参数',
          key: 'fieldExtendJson',
          width: 120,
          type: JVxeTypes.textarea,
          defaultValue: '',
        },
        {
          title: '更多配置',
          minWidth: 100,
          key: 'fieldConfig',
          type: JVxeTypes.slot,
          slotName: 'fieldConfig',
        },
      ]);
      const setup = useTableSync(columns);
      const { tableRef, tables } = setup;

      function validateFieldShowType({ cellValue, row }, callback) {
        let { dbTable } = tables;
        // 获取到 dbTable（数据库属性） 中的数据
        let dbType = dbTable.value!.tableRef!.getTableData({ rowIds: [row.id] })[0].dbType;
        //当控件类型为时间时，数据库类型必须是String类型
        if (cellValue === 'time' && dbType !== 'string') {
          callback(false, '当控件类型为时间时,数据库属性里的字段类型必须是String！');
        }
        // 当控件类型为日期时，数据库类型必须是Date类型
        else if (cellValue === 'date' && dbType !== 'Date' && dbType !== 'Datetime') {
          callback(false, '当控件类型为日期时，数据库属性里的字段类型必须是Date或Datetime！');
        }
        // 当控件类型为 yyyy-MM-dd HH:mm:ss 时，数据库类型必须是Datetime类型
        else if (cellValue === 'datetime' && dbType !== 'Datetime') {
          callback(false, '当控件类型为datetime时，数据库属性里的字段类型必须是Datetime！');
        } else {
          callback(true);
        }
      }

      /** 同步控件类型 */
      function syncFieldShowType(row) {
        // update-begin--author:liaozhiyang---date:20240801---for：【TV360X-1963】当字段类型旧值是时间类型时再次选择只要不是时间类型，控件类型就重置到文本框，都重置成输入框
        let showType = 'text';
        if (row.dbType === 'Datetime') {
          showType = 'datetime';
        } else if (row.dbType === 'Date') {
          showType = 'date';
        }
        // update-end--author:liaozhiyang---date:20240801---for：【TV360X-1963】当字段类型旧值是时间类型时再次选择只要不是时间类型，控件类型就重置到文本框，都重置成输入框
        tableRef.value!.setValues([
          {
            rowKey: row.id,
            values: { fieldShowType: showType },
          },
        ]);
      }
      // update-begin--author:liaozhiyang---date:20240313---for：【QQYUN-8485】不同步数据库的字段则去掉对应查询勾选
      function syncIsQuery(row) {
        if (row.dbIsPersist === '0') {
          tableRef.value!.setValues([
            {
              rowKey: row.id,
              values: { isQuery: '0', sortFlag: '0' },
            },
          ]);
        }
      }
      // update-end--author:liaozhiyang---date:20240313---for：【QQYUN-8485】不同步数据库的字段则去掉对应查询勾选

      function changePageType(flag) {
        for (let col of columns.value) {
          if (col.key == 'fieldShowType') {
            col.options = !flag ? commonPageOptions : subTablePageOptions;
            break;
          }
        }
      }

      function enableQuery(id) {
        tableRef.value!.setValues([
          {
            rowKey: id,
            values: { isQuery: '1' },
          },
        ]);
      }

      //update-begin-author:taoyan date:2022-8-11 for: VUEN-1940【online】关联记录和他表字段，配置智能化
      //注册modal
      const [registerModal, { openModal }] = useModal();
      const [registerFieldModal, { openModal: openFieldModal }] = useModal();
      const [registerExtJsonModal, { openModal: openExtJsonModal }] = useModal();
      
      //是否展示个性化配置按钮
      function showConfigButton(props){
        if(props.row.dbFieldName=='id'){
          return false
        }else{
          return true;
        }
      }

      /**
       * 根据不同类型打开不同配置
       */
      function openConfig(props){
        if(props.row.fieldShowType.indexOf('link_table')>=0){
          showFieldConfig(props);
        }else{
          showExtJsonConfig(props);
        }
      }
      
      //点击按钮触发弹窗
      function showFieldConfig(props){
        let { row } = props;
        let { checkTable } = tables;
        if(checkTable){
          let checkTableValue = checkTable.value!.tableRef!.getTableData({ rowIds: [row.id] })[0];
          if(props.row.fieldShowType == 'link_table'){
            let record = getLinkTableModalData(row, checkTableValue);
            openModal(true, {
              record,
              fieldName: row.dbFieldName
            })
          }else if(props.row.fieldShowType == 'link_table_field'){
           let data = getLinkTableFieldData(row, checkTableValue);
            openFieldModal(true, data)
          }
        }
      }
      
      // 获取他表字段的配置信息
      function getLinkTableFieldData(row, checkTableValue){
        let tableData = tableRef.value!.getTableData();
        let pageTableData = tableData.filter(item=>item.fieldShowType=='link_table');
        // 获取关联记录的表名和相关字段信息
        let tableAndFieldsMap = {}
        if(pageTableData && pageTableData.length>0){
          let checkTableData = tables!.checkTable.value!.tableRef!.getTableData();
          for(let pageTable of pageTableData){
            let tempArray = checkTableData.filter(i=>i.dbFieldName == pageTable.dbFieldName)
            if(tempArray && tempArray.length>0){
              let item = tempArray[0];
              tableAndFieldsMap[item.dbFieldName] = {
                title: pageTable.dbFieldTxt,
                table: item.dictTable,
                fields: item.dictText
              }
            }
          }
        }
        const { dictTable,dictText } = checkTableValue;
        const { id, dbFieldTxt} = row;
        let record = {
          rowKey: id,
          dbFieldTxt,
          dictText,
          dictTable,
        };
        return {
          record,
          tableAndFieldsMap
        }
      }
      
      //获取关联记录的配置数据
      function getLinkTableModalData(row, checkTableValue){
        const { id, dbFieldTxt, fieldExtendJson} = row;
        const { dictTable,dictText } = checkTableValue;
        //dbFieldTxt  dictTable titleField otherFields multiSelect showType
        let result = {
          rowKey: id,
          dbFieldTxt,
          dictTable
        };
        if(dictText){
          let arr = dictText.split(',');
          result['titleField'] = arr[0];
          if(arr.length>1){
            result['otherFields'] = dictText.substring(dictText.indexOf(',')+1)
          }
        }else{
          result['titleField'] = ''
          result['otherFields'] = ''
        }
        if(fieldExtendJson){
          try{
            let json = JSON.parse(fieldExtendJson);
            if(json.multiSelect){
              result['multiSelect'] = json.multiSelect
            }else{
              result['multiSelect'] = false
            }
            if(json.showType){
              result['showType'] = json.showType
            }else{
              result['showType'] = 'card'
            }
            if(json.imageField){
              result['imageField'] = json.imageField
            }else{
              result['imageField'] = ''
            }
          }catch (e) {
            console.error('解析扩展参数出错', fieldExtendJson)
          }
        }
        return result;
      }
      
      // 配置完成将数据填回vxe table
      function handleConfigData(record){
        //dbFieldTxt  dictTable titleField otherFields multiSelect showType
        //1.设置扩展配置
        const { multiSelect, showType, imageField, fieldName } = record;
        let extJson = {showType, multiSelect, imageField};
        let values = [{ rowKey: record.rowKey, values: { fieldExtendJson: JSON.stringify(extJson),dbFieldTxt: record.dbFieldTxt } }];
        tableRef.value!.setValues(values);
        
        let { checkTable, dbTable } = tables;
        //2.设置字段描述
        if(dbTable){
          let dbTableValues = [{ rowKey: record.rowKey, values: { dbFieldTxt: record.dbFieldTxt } }];
          dbTable.value!.tableRef!.setValues(dbTableValues)
        }
        //3.设置字典信息
        if(checkTable){
          let dictText = record.titleField;
          if(record.otherFields){
            dictText+=','+record.otherFields;
          }
          const {dictTable,dictField } = record;
          let temp = {
            dictTable,
            dictField,
            dictText,
            dbFieldName: fieldName
          };
          let dbTableValues = [{ rowKey: record.rowKey, values: temp }];
          checkTable.value!.tableRef!.setValues(dbTableValues)
        }
          //let checkTableValue = checkTable.value!.tableRef!.getTableData({ rowIds: [row.id] })[0]
      }

      // 配置完成将数据填回vxe table
      function handleFieldConfigData(record){
        const {dbFieldTxt, dictTable, dictText, rowKey } = record;
        //1.设置字段描述
        let values = [{ rowKey, values: { dbFieldTxt } }];
        tableRef.value!.setValues(values);

        let { checkTable, dbTable } = tables;
        //2.设置字段描述，取消同步数据库勾选状态
        if(dbTable){
          let tableValues = [{ rowKey, values: { dbFieldTxt, dbIsPersist:'0' } }];
          dbTable.value!.tableRef!.setValues(tableValues)
        }

        //3.设置字典信息
        if(checkTable){
          let tableValues = [{ rowKey, values: { dictTable, dictText } }];
          checkTable.value!.tableRef!.setValues(tableValues)
        }
      }

      /**
       * 扩展参数的配置弹窗
       * @param props
       */
      function showExtJsonConfig(props) {
        let jsonStr = props.row.fieldExtendJson || '';
        let id = props.rowId;
        let fieldShowType = props.row.fieldShowType || '';
        let sortFlag = props.row.sortFlag || '0';
        const dbType = props.row.dbType;
        openExtJsonModal(true, {
          jsonStr,
          fieldShowType,
          sortFlag,
          id,
          dbType,
        });
      }

      /**
       * 扩展参数的 弹窗回调
       * @param props
       */
      function handleExtJson(data, rowKey){
        let values;
        if(data && Object.keys(data).length>0){
          values = [{ rowKey, values: { fieldExtendJson: JSON.stringify(data) } }];
        }else{
          values = [{ rowKey, values: { fieldExtendJson: '' } }];
        }
        tableRef.value!.setValues(values);
      }
      
      const handleValueChange = (event) => {
        console.log(event);
      }
      /**
       * 2024-07-25
       * liaozhiyang
       * 【TV360X-1857】online查询增加模糊查询
       * */
      function validateQueryMode({ cellValue, row }, callback) {
        let { dbTable } = tables;
        // 获取到 dbTable（数据库属性） 中的数据
        const dbType = dbTable.value!.tableRef!.getTableData({ rowIds: [row.id] })[0].dbType;
        if (cellValue === 'group') {
          // 【TV360X-1967】范围查询只支持时间和数字类型且得支持控件类型是时间(HH:mm:ss)
          if (['double', 'int', 'BigDecimal', 'Date', 'Datetime'].includes(dbType) || row.fieldShowType === 'time') {
            callback(true);
          } else {
            callback(false, '范围查询，只支持数据库属里的字段类型为：Integer、Double、BigDecimal及Date、Datetime 或 控件类型是时间(HH:mm:ss)');
          }
        } else if (cellValue === 'like') {
          if (['string'].includes(dbType) && row.fieldShowType === 'text') {
            callback(true);
          } else {
            callback(false, '模糊查询，只支持控件类型是文本框且数据库属里的字段类型是String');
          }
        } else {
          callback(true);
        }
      }
      const syncQueryMode = ({oldValue, row}) => {
        // 当字段类型旧值是string时，且查询类型是模糊查询，改成精确查询
        if (row.dbType != 'string' && oldValue == 'string') {
          const curTableRow = tableRef.value!.getTableData({ rowIds: [row.id] })[0];
          if (curTableRow.queryMode == 'like') {
            tableRef.value!.setValues([
              {
                rowKey: row.id,
                values: { queryMode: 'single' },
              },
            ]);
          }
        }
      };

      return { ...setup, columns, enableQuery, syncFieldShowType, changePageType, 
        showConfigButton, showFieldConfig, 
        registerExtJsonModal, handleExtJson, openConfig,
        registerModal, handleConfigData,
        registerFieldModal, handleFieldConfigData, syncIsQuery, handleValueChange, syncQueryMode};
      //update-end-author:taoyan date:2022-8-11 for: VUEN-1940【online】关联记录和他表字段，配置智能化
      
    },
  });
</script>

<style lang="less" scoped>
  :deep(.online-config-page td:last-child.col--selected){
    box-shadow:none !important;
  }
  //【QQYUN-8972】online隐藏控件长度前面的可编辑icon
  :deep(.vxe-header--row) {
    .vxe-header--column:nth-child(9) {
      .vxe-cell--edit-icon {display:none;}
    }
  }
</style>
