<template>
  <div v-if="visible">
    <div class="button-conditions-text" >
      <div style="flex: 1">
        <div class="condition-item" >
          <span v-if="formTable === 'current'">在当前记录中</span>
          <template v-else>
            <span>在关联记录</span>
            <span style="font-weight: 700">{{ getLinkRecordFieldText() }}</span>
            <span>中</span>
          </template>
        </div>

        <div class="condition-item auto-height">
          <span>{{ formType === 'update' ? '填写' : '新建' }}</span>
          <span style="font-weight: 700">{{ whatFields }}</span>
        </div>
      </div>
      <div class="button-edit-icon">
        <EditOutlined @click="goEdit" />
      </div>
    </div>

    <a-modal centered v-model:open="modalVisible" title="设置填写内容" @ok="onOk" width="630px" forceRender>
      <div class="button-config" style="padding: 0px 24px 20px">
        <div class="item">
          <h5>填写对象</h5>
          <div class="content">
            <a-radio-group :value="formTable" @change="onChangeFormTable">
              <a-radio value="current">当前记录</a-radio>
              <a-radio value="link-record">关联记录（单条）</a-radio>
            </a-radio-group>

            <div style="margin-top: 10px; width: 100%" v-if="formTable == 'link-record'">
              <span style="width: 70px">关联字段：</span>
              <span>
                <a-select style="width: calc(100% - 70px)" placeholder="请选择" v-model:value="linkRecordField" @change="onChangeLinkRecordField2">
                  <template v-if="selectOptions1.length > 0">
                    <a-select-option v-for="item in selectOptions1" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </template>
                  <a-select-option v-else disabled value="">无数据</a-select-option>
                </a-select>
              </span>
            </div>
          </div>
        </div>

        <div class="item">
          <h5>填写内容</h5>
          <div class="content">
            <a-radio-group v-model:value="formType" @change="onChangeFormType">
              <a-radio value="update">填写指定字段</a-radio>
              <a-radio value="create">新建关联记录</a-radio>
            </a-radio-group>

            <div style="margin-top: 10px; width: 100%" v-if="formType == 'create'">
              <span style="width: 70px">关联字段：</span>
              <span>
                <a-select style="width: calc(100% - 70px)" placeholder="请选择" v-model:value="createFormField" @change="onChangeCreateFormField">
                  <template v-if="selectOptions2.length > 0">
                    <a-select-option v-for="item in selectOptions2" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </template>
                  <a-select-option v-else disabled value="">无数据</a-select-option>
                </a-select>
              </span>
            </div>
          </div>
        </div>
        <FormFieldSelect
          :formTable="formTable"
          :linkRecordField="linkRecordField"
          :linkRecordColumnList="dynamicColumnList"
          :dbFieldList="updateFieldList"
          v-if="'update' == formType"
          ref="fieldListRef"
        />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
  import { ref, watch, defineComponent, computed, inject } from 'vue';
  import { EditOutlined } from '@ant-design/icons-vue';
  import FilterFiledList from '../select/FilterFiledList.vue';
  import FormFieldSelect from './FormFieldSelect.vue';
  import type { Ref } from 'vue';
  import { useColumnConfig } from '../ts/useFilterField';
  import { defHttp } from '/@/utils/http/axios';
  import { useMessage } from "/@/hooks/web/useMessage";
  import {sleep} from "/@/utils";

  interface FormField {
    key: string;
    //属性 只读 readonly/填写text/必填required
    attr: string;
    //默认值
    defaultVal: string;
  }
  export default defineComponent({
    name: 'ButtonFormConfig',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },

      info: {
        type: Object,
        default: () => {},
      },
    },
    components: {
      EditOutlined,
      FilterFiledList,
      FormFieldSelect,
    },
    emits: ['ok'],
    setup(props) {
      const { createConfirmSync } = useMessage()
      // 当前表/关联记录(单选)--current/link-record
      const formTable = ref('');
      //关联字段下拉框- 从当前表中取得单选的关联记录字段
      const selectOptions1 = ref<any[]>([]);

      //关联字段下拉框- 从当前表中取得关联记录字段 或者 从单选的关联记录字段的表中取得 关联记录字段
      const selectOptions2 = ref<any[]>([]);
      
      const columnList: Ref<any[]> | undefined = inject('globalColumnList', undefined);
      const { columnList: dynamicColumnList, initColumnList } = useColumnConfig();
      
      // 关联记录表-字段
      const linkRecordField = ref('');
      // 关联记录表-字段对应配置-表
      const linkRecordTable = ref('')
      // update-修改指定表单的指定字段/create-创建关联记录的记录（可能是当前表的关联记录/可能是关联记录表中的关联记录）
      const formType = ref('');
      function onChangeFormType() {
        if (formType.value == 'update') {
          createFormField.value = '';
        }
      }
      // 当formType=create,需要填写创建的是哪个关联记录字段
      const createFormField = ref('');
      // 表单设计器编码，用于新建 打开表单用
      const createFormCode = ref('');

      // 当formType=update,需要记录填写的字段集合-key
      const updateFieldList = ref<FormField[]>([]);

      // 控制modal的显示
      watch(
        () => props.visible,
        (val) => {
          if (val === true) {
            // 如果需要显示， 判断需要弹出modal与否
            if (!props.info) {
              modalVisible.value = true;
              return;
            } else {
              let ft = props.info.formType;
              if (!ft) {
                modalVisible.value = true;
                return
              } else {
                if (ft === 'create') {
                  if (!props.info.createFormField) {
                    modalVisible.value = true;
                    return
                  }
                } else {
                  if (!props.info.fieldList || props.info.fieldList.length == 0) {
                    modalVisible.value = true;
                    return
                  }
                }
              }
            }
            
            if(!whatFields.value){
              modalVisible.value = true;
            }
          }
        }
      );

      // 控制字段值
      watch(
        () => props.info,
        (info) => {
          formTable.value = info.formTable || 'current';
          linkRecordField.value = info.linkRecordField;
          linkRecordTable.value = info.linkRecordTable;

          formType.value = info.formType || 'update';
          createFormField.value = info.createFormField;
          createFormCode.value = info.createFormCode;
          updateFieldList.value = info.updateFieldList || [];

        },
        { immediate: true, deep: true }
      );
      
      // 第个radio的数据控制
      watch(formTable, (val)=>{
        if(val==='link-record'){
          // 如果是关联记录，需要加载关联记录的第一个下拉框
         if(!validateInject(1)){
           return;
         }
         let list:any[] = columnList!.value;
          let temp: any[] = list.filter((item) => item.type === 'link-record' && item.multi === false);
          let arr1: any[] = [];
          for (let item of temp) {
            arr1.push({
              value: item.key,
              label: item.name,
              table: item.code
            });
          }
          selectOptions1.value = arr1;
        }else if (val == 'current') {
          linkRecordField.value = '';
        }
      }, {immediate: true});
      
      // 关联记录字段的下拉框数据变化 需要重新加载该关联记录的所有字段信息
      watch(linkRecordField, async (val)=>{
        if(val){
          if(!validateInject(2)){
            return;
          }
          await loadDynamicColumnList(val);
        }
      }, {immediate: true});
      
      async function loadDynamicColumnList(val){
        let list:any[] = columnList!.value;
        let temp: any[] = list.filter((item) => item.key === val||item.model === val);
        if(temp && temp.length>0){
          let table = temp[0].code;
          if(table){
            await getColumnByCode(table);
            console.log('重新加载关联记录表的字段',table, dynamicColumnList.value)
          }
        }
      }
      
      watch(formType, async (val)=>{
        if (val == 'update') {
          createFormField.value = '';
        }else{
          // 新建关联记录 需要加载关联记录的第二个下拉框选项
          if(formTable.value === 'current'){
            //如果是从当前表中取
            if(!validateInject(3)){
              return;
            }
            let list:any[] = columnList!.value;
            let arr:any[] = getSelectOptions(list);
            selectOptions2.value = arr;
          }else{
            // 从关联记录表中取
            let list = await validateDynamicList();
            let arr:any[] = getSelectOptions(list);
            selectOptions2.value = arr;
          }
        }
      }, {immediate: true})


      /**
       * 获取第二个下拉框的下拉选项
       */
      function getSelectOptions(list){
        let temp: any[] = list.filter((item) => item.type === 'link-record');
        let arr: any[] = [];
        for (let item of temp) {
          arr.push({
            value: item.key,
            label: item.name,
            table: item.code
          });
        }
        return arr;
      }

      /**
       * 获取关联记录表 的所有字段
       */ 
      function validateDynamicList() {
        return new Promise((resolve, reject) => {
          (async function next(time) {
            if(time>10){
              // 自己请求获取数据
              if(!validateInject(5)){
                reject('columnList没获取到！');
                return;
              }
              let val = linkRecordField.value;
              if(!val){
                reject('第一个下拉框的值没有获取到！');
                return;
              }
              await loadDynamicColumnList(val);
              resolve(dynamicColumnList.value);
              return ;
            }
            let list = dynamicColumnList.value;
            if (list && list.length>0) {
              resolve(list);
            } else {
              setTimeout(() => {
                next(++time);
              }, 200);
            }
          })(0);
        });
      }
      
      function validateInject(type) {
        if(!columnList){
          console.error('columnList 不存在！', type)
          return false
        }
        if(!columnList.value){
          console.error('columnList-值 不存在！', type)
          return false;
        }
        return true;
      }


      const modalVisible = ref(false);
      function goEdit() {
        modalVisible.value = true;
      }

      const fieldListRef = ref();
      function getData() {
        let data: any = {};
        data['formTable'] = formTable.value;
        if (formTable.value === 'link-record') {
          data['linkRecordField'] = linkRecordField.value;
          data['linkRecordTable'] = linkRecordTable.value;
        }
        data['formType'] = formType.value;
        if (formType.value === 'create') {
          data['createFormField'] = createFormField.value;
          data['createFormCode'] = createFormCode.value;
        } else if (formType.value === 'update') {
          let fieldListData = fieldListRef.value.getFieldListData();
          data['updateFieldList'] = fieldListData;
        }
        return data;
      }

      function onOk() {
        if (formType.value === 'update') {
          let fieldListData = fieldListRef.value.getFieldListData();
          console.log('弹窗关闭, 获取数据', fieldListData);
          if (fieldListData && fieldListData.length > 0) {
            updateFieldList.value = fieldListData;
          } else {
            updateFieldList.value = [];
          }
        }
        modalVisible.value = false;
      }
      
      function getLinkRecordFieldText() {
        if (formTable.value === 'link-record') {
          let fieldKey = linkRecordField.value;
          if(!validateInject(6)){
            return '';
          }
          let list:any[] = columnList!.value;
          let temp: any[] = list.filter((item) => item.key === fieldKey||item.model === fieldKey);
          if(temp && temp.length>0){
            let label = temp[0].name;
            if(label){
              return '“' + label + '”';
            }
          }
        }
        return ''
      }

      function getFieldLabel(fieldKey) {
        if (formTable.value === 'current') {
          if (fieldKey) {
            if (columnList) {
              let list: any[] = columnList.value;
              for (let item of list) {
                if (item.key === fieldKey || item.model === fieldKey) {
                  return item.name;
                }
              }
            }
          }
          return '';
        } else {
          if (fieldKey) {
            if (dynamicColumnList) {
              let list: any[] = dynamicColumnList.value;
              for (let item of list) {
                if (item.key === fieldKey || item.model === fieldKey) {
                  return item.name;
                }
              }
            }
          }
          return '';
        }
      }

      const whatFields = computed(() => {
        if (formType.value === 'create') {
          let fieldKey = createFormField.value;
          let fieldLabel = getFieldLabel(fieldKey);
          if (fieldLabel) {
            return fieldLabel;
          }
        } else {
          let list = updateFieldList.value;
          let arr: any[] = [];
          if (list && list.length > 0) {
            for (let item of list) {
              let fieldLabel = getFieldLabel(item.key);
              if (fieldLabel) {
                arr.push(fieldLabel);
              }
            }
          }
          return arr.join('、');
        }
      });

      async function getColumnByCode(code) {
        const url = '/desform/view/queryDesignByCode';
        let params = { code };
        let data = await defHttp.get({ url, params }, { isTransformResponse: false });
        if (data.success) {
          initColumnList(data.result);
        }
      }

      
      function onChangeCreateFormField() {
        let options = selectOptions2.value;
        let field = createFormField.value;
        let arr = options.filter(item=>item.value === field);
        if(arr && arr.length>0){
          createFormCode.value = arr[0].table;
        }
      }
      
      async function onChangeLinkRecordField2() {
        let options = selectOptions1.value;
        let field = linkRecordField.value;
        let arr = options.filter(item=>item.value === field);
        if(arr && arr.length>0){
          linkRecordTable.value = arr[0].table;
          // 重新查询关联记录表的字段
          createFormField.value = '';
          selectOptions2.value = [];
          await sleep(300);
          // 从关联记录表中取
          let list = await validateDynamicList();
          selectOptions2.value = getSelectOptions(list);
        }
      }

      // 切换填写对象
      async function onChangeFormTable(event) {
        let fieldList = fieldListRef.value?.getFieldListData();
        if (fieldList && fieldList.length > 0) {
          let flag = await createConfirmSync({
            title: '切换填写对象',
            content: '这将会清空已经配置的字段列表，确定吗？',
          });
          if (!flag) {
            return;
          }
          fieldListRef.value.myList = [];
        }
        formTable.value = event.target.value;
      }

      return {
        formTable,
        linkRecordField,
        

        formType,
        onChangeFormType,
        createFormField,
        createFormCode,
        updateFieldList,

        modalVisible,
        onOk,
        goEdit,
        getData,
        
        whatFields,
        getLinkRecordFieldText,
        fieldListRef,
        selectOptions1,
        selectOptions2,
        dynamicColumnList,
        onChangeFormTable,
        onChangeCreateFormField,
        onChangeLinkRecordField2
      };
    },
  });
</script>

<style lang="less">
  .button-conditions-text {
    width: 100%;
    border: 1px solid rgb(221, 221, 221);
    border-radius: 3px;
    padding: 4px 12px 6px;
    box-sizing: border-box;
    color: rgb(51, 51, 51);
    margin: 10px 0px;
    display: flex;
    cursor: pointer;
    background: rgb(245, 245, 245);
    border-color: rgb(216, 216, 216);

    .button-edit-icon {
      color: rgb(158, 158, 158);
      font-size: 15px;
      padding-top: 0;
      &:hover {
        color: #0a8fe9;
      }
    }
    .condition-item {
      height: 25px;
      line-height: 25px;
      font-size: 13px;
      span {
        margin: 0px 7px 4px 1px;
      }

      &.auto-height {
        height: auto;
        min-height: 25px;
      }
    }
  }
</style>
