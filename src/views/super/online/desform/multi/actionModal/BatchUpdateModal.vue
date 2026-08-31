<template>
  <BasicModal @register="registerModal" :afterClose="afterClose" :width="560" :canFullscreen="false" destroyOnClose :closable="true" @ok="handleOk">
    <template #title>
      <div style="color: #333; font-size: 17px; font-weight: 400"> 批量编辑 </div>
    </template>

    <div>
      <div style="color: #757575; font-size: 14px; line-height: 20px; margin-bottom: 20px; word-break: break-all">
        通过批量编辑可快速统一修改相同字段的数据内容，无编辑权限的记录无法修改。
      </div>

      <div style="font-size: 14px">
        <div style="margin-bottom: 10px">
          <span style="display: inline-block; height: 30px; line-height: 30px; text-align: right; width: 100px; color: #9e9e9e; margin-right: 10px">
            字段
          </span>

          <a-popover overlayClassName="view-pop-field-select" placement="bottom" v-model:open="showPop" trigger="click">
            <template #content>
              <div class="field-list">
                <template v-for="item in fieldSelectOptions">
                  <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
                    <div><component-icon :type="item.type" />{{ item.name }}</div>
                  </div>
                </template>
              </div>
            </template>
            <template #title>
              <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
                <template #prefix>
                  <Icon icon="ant-design:search-outlined" style="color: #c0c0c0" />
                </template>
              </a-input>
            </template>
            <span @click="goSelectField" style="display: inline-block; height: 30px; line-height: 30px; width: 260px; cursor: pointer">
              <span> {{ selectedField.name }} </span>
              <Icon icon="ant-design:down-outlined" />
            </span>
          </a-popover>
        </div>
        <div>
          <span style="display: inline-block; text-align: right; width: 100px; color: #9e9e9e; margin-right: 10px"> 字段内容 </span>
          <div style="display: inline-block; vertical-align: middle; width: 260px">
            <a-radio-group v-model:value="updateType.value" name="radioGroup">
              <a-radio v-if="updateType.showUpdate" value="update">修改为新值</a-radio>
              <a-radio :disabled="updateType.disabledClear" value="clear">清空内容</a-radio>
            </a-radio-group>
          </div>
        </div>
        <div class="component-val" v-if="updateType.showUpdate && updateType.value=='update' ">
          <a-slider v-if="selectedField.type=='slider'" v-model:value="selectedField.val"/>
          <a-switch v-else-if="selectedField.type == 'switch'" :checkedValue="selectedField.options[0]" :unCheckedValue="selectedField.options[1]" v-model:checked="selectedField.val"/>
          <a-rate v-else-if="selectedField.type == 'rate'" v-model:value="selectedField.val"/>
          <online-super-query-val-component
            v-else
            style="width: 100%"
            :schema="getFieldValSchema()"
            :formModel="selectedField"
            :setFormModel="
              (key, value) => {
                setFormModel(key, value, selectedField);
              }
            "
          />
          <!-- 校验信息提示 -->
          <div v-if="validator.error" class="validate-error">
            {{ validator.msg }}
          </div>
        </div>
        
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, computed, reactive, defineComponent, inject, watchEffect, toRaw } from 'vue';
  import type { Ref } from 'vue';
  import { useLowAppAuthStore } from '/@/store/modules/lowAppAuth';
  import ComponentIcon from '/@/components/jeecg/super/desform/ComponentIcon.vue';
  import OnlineSuperQueryValComponent from '/@/views/super/online/cgform/auto/comp/superquery/SuperQueryValComponent.vue';
  import { useComponentCondition, useFilterField } from '../ts/useFilterField';
  import {useMessage} from "/@/hooks/web/useMessage";
  import dayjs from 'dayjs';

  export default defineComponent({
    name: 'BatchUpdateModal',
    components: {
      BasicModal,
      ComponentIcon,
      OnlineSuperQueryValComponent,
    },
    props: {
      tableColumns: {
        type: Array,
        default: () => [],
      },
      designFormCode: {
        type: String,
        default: '',
      },
    },
    emits:['register', 'ok'],
    setup(props, {emit}) {
     
      const { getDefaultRule, getDefaultVal } = useComponentCondition();
      
      const { createMessage: $message } = useMessage();
      
      const selectedField = reactive<any>({});
      const updateType = reactive({
        value: 'update',
        disabledClear: false,
        showUpdate: true
      });

      const showPop = ref(false);
      const filterValue = ref('');

      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.log('data', data);

        filterValue.value = '';
        if(selectedField.val){
          let val = getDefaultVal(selectedField.type);
          selectedField.val = val
        }
      });

      // 全局字段
      let currentColumnList: Ref<any[]> | undefined = inject('globalColumnList', undefined);

      const authStore = useLowAppAuthStore();
      const fieldSelectOptions = ref<any[]>([]);

      // 批量编辑 排除特定类型 汇总-他表字段-子表
      // QQYUN-46246.公式、大写金额、自动编码、文本组合 不用显示
      const excludeCompTypes = ['summary', 'link-field', 'sub-table-design', 'formula', 'capital-money', 'auto-number'];
      
      watchEffect(() => {
        // 当前视图列
        let viewColumns: any = props.tableColumns;
        let arr: any[] = [];
        if (viewColumns && viewColumns.length > 0) {
          if (currentColumnList) {
            let columnList = currentColumnList.value;
            let formCode = props.designFormCode;
            if (formCode) {
              let excludeFields: any[] = authStore.getExcludeUpdateFields(formCode) || [];
              console.log('excludeFields', excludeFields);
              for (let col of viewColumns) {
                // 排除特定类型
                if(excludeCompTypes.indexOf(col.compType)>=0){
                  continue;
                }
                let key = col.key;
                for (let item of columnList) {
               //update-begin-author:liusq---date:2023-10-08--for:[QQYUN-6077]批量编辑，设置了唯一校验后，不要隐藏
                  // 具有唯一校验的字段，不能批量编辑
                  if (item.unique) {
                   // continue;
                  }
                //update-end-author:liusq---date:2023-10-08--for:[QQYUN-6077]批量编辑，设置了唯一校验后，不要隐藏
                  if (key === item.key) {
                    if (excludeFields && excludeFields.indexOf(key) < 0) {
                      arr.push({ ...item });
                    }
                  }
                }
              }
            }
          }
        }
        if (arr.length > 0) {
          onSelectField(arr[0]);
        }
        fieldSelectOptions.value = arr;
        console.log('tableColumns');
        console.log('currentColumnList.', currentColumnList);
      });

 
      function isFilterItem(item) {
        let temp = filterValue.value;
        if (!temp) {
          return true;
        }
        if (!item) {
          return false;
        }
        return item.name.indexOf(temp) >= 0;
      }

      function onSelectField(item) {
        let field = item.field || item.model;
        let rule = getDefaultRule(item.type);
        let val = getDefaultVal(item.type);
        let obj:any = {
          field,
          rule,
          val,
          type: item.type,
          name: item.name,
          rules: item.rules,
          required: item.required === true,
          unique: item.unique === true
        };
        if(item.type=='switch'){
          obj['options'] = item['options']||['Y', 'N'];
        }
        Object.keys(obj).map((k) => {
          selectedField[k] = obj[k];
        });
        showPop.value = false;
      
        if(item.type=='switch'){
          if(item.options && item.options.length>1){
            selectedField.val = item.options[1];
          }
        }
        console.log('字段信息', item)
      }


      /**
       * 校验信息提示
       */ 
      const phonePattern = /^1[3456789]\d{9}$/
      const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      const validator = computed<any>(()=>{
        let result = {
          error: false,
          msg: ''
        }
        
        if(selectedField.type == 'phone'){
          if(selectedField.val){
            if (!new RegExp(phonePattern).test(selectedField.val)) {
              result.error = true;
              result.msg = '手机号码格式有误'
              return result
            }
          }
        }else if(selectedField.type == 'email'){
          if(selectedField.val){
            if (!new RegExp(emailPattern).test(selectedField.val)) {
              result.error = true;
              result.msg = '邮箱格式有误'
              return result
            }
          }
        }
        let rules = selectedField.rules;
        if(rules && rules.length>0){
          for(let item of rules){
            if(item.required===true){
              if(!selectedField.val){
                selectedField.required = true;
              }
            }
            if(item.pattern){
              if (!new RegExp(item.pattern).test(selectedField.val)) {
                result.error = true;
                result.msg = item.message ?? '';
                // 替换message
                result.msg = result.msg.replace('${title}', selectedField.name)
                return result
              }
            }
          }
        }
        return result;
      });
      
      // 只能执行清空操作的字段类型- markdown/富文本/文件上传/图片上传/唯一字段
      const onlyClearFieldTypes = ['markdown', 'editor', 'file-upload', 'imgupload', 'color', 'map']
      function selectedFieldChange() {
        updateType.value = 'update';
        if(onlyClearFieldTypes.indexOf(selectedField.type)>=0){
          updateType.value = 'clear';
          updateType.showUpdate = false;
        //update-begin-author:liusq---date:2023-10-08--for:[QQYUN-6077]批量编辑，设置了唯一校验后，不要隐藏
        }else if(selectedField.unique == true){
          updateType.value = 'clear';
          updateType.showUpdate = false;
         //update-end-author:liusq---date:2023-10-08--for:[QQYUN-6077]批量编辑，设置了唯一校验后，不要隐藏
        }else{
          updateType.showUpdate = true;
        }
        if(selectedField.required===true){
          updateType.disabledClear = true
        }else{
          updateType.disabledClear = false;
        }
      }

      function goSelectField(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const { getSchema } = useFilterField({
        columnList: fieldSelectOptions,
      });
      
      function getFieldValSchema() {
        let schema = getSchema(toRaw(selectedField));
        if(selectedField.type === "select-user"){
          schema.componentProps.inSuperQuery = false;
        }
        // QQYUN-4624  1.金额 保留2位小数
        if(selectedField.type === 'money'){
          schema.componentProps.precision = 2;
        }
        // QQYUN-4624  4.整数还可以输入小数点
        if(selectedField.type === 'integer'){
          schema.componentProps.precision = 0;
        }
        
        return schema
      }

      /**
       * val组件赋值
       */
      function setFormModel(key: string, value: any, item: any) {
        console.log('setFormModel', key, value);
        // formModel[key] = value;
        item['val'] = value;
      }

      function handleOk() {
        console.log('表单数据', selectedField);
        if(updateType.disabledClear && updateType.value == 'clear'){
          // 如果禁用了清空 但是又选中了清空条件 则不允许提交
          $message.info('不可清空必填字段！');
          return;
        }
        if(updateType.disabledClear && !selectedField.val){
          // 如果禁用了清空 但是没有输入条件值
          $message.info('不可清空必填字段！');
          return;
        }
        if(selectedField.required === true && !selectedField.val){
          $message.info('不可清空必填字段！');
          return
        }
        if(validator.value){
          if(validator.value.error === true){
            return;
          }
        }
        if(updateType.value=='update'){
          let val = selectedField.val;
          if(val===0 || val==='0'){
          }else if(!val){
            val = ''
          }
          let params:any = {
            field: selectedField.field,
            val
          }
          if(params.val){
            if(selectedField.type == 'year' || selectedField.type == 'month'){
              params.val = getYearVal(val);
            }
          }
          emit('ok', params)
        }else{
          let params = {
            field: selectedField.field,
            val: ''
          }
          emit('ok', params)
        }
      }
      
      function getYearVal(val){
        return dayjs(val).unix() * 1000
      }

      watchEffect(()=>{
        if(selectedField.field){
          selectedFieldChange();
        }
      });
      
      // QQYUN-4550【应用】批量修改日期的瞬间，输入框的值被清空了，让人诧异
      const clearTypes = ['org-role', 'link-record']
      function afterClose() {
        if(clearTypes.indexOf(selectedField.type)>=0){
          selectedField.val = ''
        }
      }

      return {
        registerModal,
        updateType,
        handleOk,
        showPop,
        filterValue,
        isFilterItem,
        onSelectField,
        goSelectField,
        fieldSelectOptions,
        getSchema,
        selectedField,
        setFormModel,
        getFieldValSchema,
        validator,
        afterClose
      };
    },
  });
</script>

<style scoped lang="less">
  .validate-error{
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
  }
  .component-val{
    margin-left: 100px; 
    margin-top: 5px;
    width: 400px;
    :deep(.ant-select){
      width: 100% !important;
    }
  }
</style>
