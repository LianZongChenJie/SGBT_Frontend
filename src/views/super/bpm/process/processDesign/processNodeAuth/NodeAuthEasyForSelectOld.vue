<template>
  <div>
    <div class="search">
      <span class="content">字段权限 <span style="color: red"> *</span></span>
      <a-input-search v-model:value="searchValue" placeholder="请输入字段名搜索" @search="onSearch" />
    </div>

    <!-- 权限字段配置 -->
    <JVxeTable ref="fieldTableRef" :maxHeight="450" :dataSource="dataSource" :columns="columns">

      <!-- 定义插槽开始了 -->
      <template #begin="props">
        <a-switch
                size="default"
                v-model:checked="props.value"
                @change="(value) => handleChangeBegin(value, props)"
                checkedValue="1"
                unCheckedValue="0"
                checked-children="开启"
                un-checked-children="关闭"
        />
      </template>
    </JVxeTable>
  </div>
</template>

<script lang="ts">
  /**
   * 设计器/online 流程节点权限配置
   */
  import {ref, watch, defineComponent} from 'vue'
  import { getOnlineFields, getDesignFields} from './node.auth.api';
  import { JVxeTypes } from '/@/components/jeecg/JVxeTable/types';

  export default defineComponent({
    name: 'NodeAuthEasyForSelect',
    props:{
      activeTableName:{
        type: String,
        default: ''
      },
      activeFormType:{
        type: String,
        default: ''
      },
      dbAuthDataList: {
        type: Array,
        default: []
      },
      processId:{
        type: String,
        default: ''
      },
      processNodeCode:{
        type: String,
        default: ''
      }
    },
    setup(props){
      const fieldTableRef = ref();
      const dataSource = ref([]);
      const searchValue = ref('');
      function onSearch(value) {
        console.log(value);
        const $table = fieldTableRef.value.gridRef;
        if (!value) {
          $table.clearFilter();
        } else {
          const column = $table.getColumnByField('ruleName');
          if (column) {
            // 修改筛选列表，并默认设置为选中状态
            $table.setFilter(column, [{ label: '', value: '', checked: true }]);
            $table.updateData();
          }
        }
      }

      // 筛选数据
      function filterRuleName({ row }) {
        // VUEN-1673【流程节点】搜索同时支持字段和权限编码查询
        return row.ruleName.indexOf(searchValue.value) >= 0 || row.ruleCode.indexOf(searchValue.value) >= 0;
      }

      function handleChangeBegin(value, { triggerChange }) {
        triggerChange(value);
      }

      watch(()=>props.activeTableName, (val)=>{
        if (val) {
          if (props.activeFormType == '1') {
            handleOnlineFields(val);
          }
          if (props.activeFormType == '2') {
            handleDesignFields(val);
          }
        }
      });

      // 获取online字段
      async function handleOnlineFields(tableName) {
        let tableValues: any = [];
        let onlineFields = await getOnlineFields(tableName);
        console.log('onlineFields', onlineFields);
        if (onlineFields) {
          for (let i = 0; i < onlineFields.length; i++) {
            tableValues.push({
              id: i,
              ruleName: onlineFields[i].title,
              show: 'Y',
              editable: 'Y',
              ruleCode: 'online:' + onlineFields[i].tableName + ':' + onlineFields[i].code,
              begin: '0'
            });
          }
        }
        dataSource.value = getAuthDataSource(tableValues);
      }

      // 获取设计器字段
      async function handleDesignFields(tableName) {
        let tableValues: any = [];
        let allFields = await getDesignFields(tableName);
        console.log('designFields', allFields);
        if (allFields) {
          for (let i = 0; i < allFields.length; i++) {
            let item = allFields[i];
            if (item.subTable) {
              item.authField = item.subKey + '::' + item.authField;
              item.authTitle = item.subTitle + '::' + item.authTitle;
            }
            tableValues.push({
              id: i,
              ruleName: item.authTitle,
              show: 'Y',
              editable: 'Y',
              ruleCode: item.authField,
              begin: '0',
              authComKey: item.authComKey,
            });
          }
        }
        dataSource.value = getAuthDataSource(tableValues);
      }

      //获取字段列表需要的数据结构
      function getAuthDataSource(tableValues) {
        let existAuthList: any[] = props.dbAuthDataList;
        let myFormType = props.activeFormType;
        //ruleName ruleCode formType ruleType status
        // && it.formBizCode == props.activeTableName  获取上次配置的权限数据，为避免配置多个online表单，且字段冲突，应该加上左侧筛选条件，但实际不能加这个条件，否则导致子表数据无法回显
        let tempAuthList = existAuthList.filter((it) => it.formType == myFormType);
        console.log('tempAuthList', tempAuthList);
        if (tempAuthList && tempAuthList.length > 0) {
          for (let temp of tempAuthList) {
            let { ruleCode, ruleType, status } = temp;
            for (let i = 0; i < tableValues.length; i++) {
              let table = tableValues[i];
              if (table.ruleCode === ruleCode) {
                if(temp.ruleName){
                  table.ruleName = temp.ruleName
                }
                table.begin = '1';
                //显示：1  禁用：2
                if (ruleType == '1') {
                  //正向1 反向0
                  if (status == '1') {
                    table.show = 'Y';
                  } else {
                    table.show = 'N';
                  }
                } else if (ruleType == '2') {
                  if (status == '1') {
                    table.editable = 'N';
                  } else {
                    table.editable = 'Y';
                  }
                }
                break;
              }
            }
          }
        }
        return tableValues;
      }

      function getData(){
        const ds = fieldTableRef.value.getTableData();
        if (!ds || ds.length == 0) {
          return []
        }
        return getSubmitData(ds);
      }

      function getSubmitData(ds) {
        let arr:any[] = [];
        //将数据转化成数据库的结构, 每次后台先执行删除 再执行批量新增
        for (let item of ds) {
          if (item.begin === '1') {
            //只有开启的才需要执行新增操作
            let formCode = props.activeTableName
            if(props.activeFormType=='1'){
              // 如果是online表  需要获取实际的表名。子表不能使用主表的表名
              formCode = getRealTableName(formCode, item.ruleCode)
            }
            let temp = {
              formType: props.activeFormType,
              formBizCode: formCode,
              processId: props.processId,
              processNodeCode: props.processNodeCode,
              ruleCode: item.ruleCode,
              ruleName: item.ruleName,
            };
            if (props.activeFormType == '1') {
              //online
              temp['onlineTableName'] = props.activeTableName;
            } else {
              //设计器
              temp['desformComKey'] = item.authComKey;
            }
            //显示权限判断
            if (item.show === 'Y') {
              //显示的 正向的
              let record = Object.assign({ ruleType: '1', status: '1' }, temp);
              arr.push(record);
            } else {
              //显示的 反向的
              let record = Object.assign({ ruleType: '1', status: '0' }, temp);
              arr.push(record);
            }

            // 禁用权限判断
            if (item.editable === 'N') {
              //禁用的 正向的
              let record = Object.assign({ ruleType: '2', status: '1' }, temp);
              arr.push(record);
            } else {
              //禁用的 反向的
              let record = Object.assign({ ruleType: '2', status: '0' }, temp);
              arr.push(record);
            }
          }
        }
        return arr;
      }

      /**
       * 获取实际的表名
       * @param formCode
       * @param ruleCode
       */
      function getRealTableName(formCode, ruleCode){
        if(ruleCode){
          if(ruleCode.indexOf('online')>=0){
            let begin = ruleCode.indexOf(":")
            let end = ruleCode.lastIndexOf(":")
            let tableName = ruleCode.substring(begin+1, end)
            console.log(tableName)
            return tableName
          }
        }
        return formCode;
      }

      const columns = [
        {
          title: 'ID',
          key: 'id',
          type: JVxeTypes.hidden,
        },
        {
          title: '启用',
          key: 'begin',
          width: '150px',
          fixed: 'left',
          align: 'center',
          type: JVxeTypes.slot,
          slotName: 'begin',
        },
        {
          title: '字段',
          key: 'ruleName',
          align: 'center',
          type: JVxeTypes.input,
          width: '210px',
          filters: [],
          filterMethod: filterRuleName,
        },
        {
          title: '权限编码',
          key: 'ruleCode',
          align: 'center',
          type: JVxeTypes.hidden,
          width: '250px',
        },
        {
          title: '可见',
          key: 'show',
          type: JVxeTypes.checkbox,
          customValue: ['Y', 'N'],
          align: 'center',
          width: '150px',
        },
        {
          title: '可编辑',
          key: 'editable',
          type: JVxeTypes.checkbox,
          align: 'center',
          customValue: ['Y', 'N'],
          width: '150px',
        },
      ];

      return {
        fieldTableRef,
        searchValue,
        onSearch,
        columns,
        dataSource,
        handleChangeBegin,
        getData
      }

    }
  });
</script>

<style scoped></style>
