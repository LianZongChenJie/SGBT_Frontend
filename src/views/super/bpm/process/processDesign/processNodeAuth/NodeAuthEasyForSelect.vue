<template>
  <div>
    <div class="search">
      <span class="content">字段权限 <span style="color: red"> *</span></span>
      <a-input-search style="width: 200px" v-model:value="searchValue" placeholder="请输入字段名搜索" @search="onSearch" />
    </div>

    <!-- 权限字段配置 -->
    <BasicTable :dataSource="showDataList" @register="registerTable" :maxHeight="450">
      <template v-slot:bodyCell="{ column, text, record }">
        <div v-if="column.dataIndex === 'useStatus'" >
          <a-switch v-model:checked="record['useStatus']" checked-children="开启" un-checked-children="关闭"/>
        </div>

        <div v-else-if="column.dataIndex === 'showStatus'" >
          <a-checkbox v-model:checked="record['show']"/>
        </div>

        <div v-else-if="column.dataIndex === 'updateStatus'" >
          <a-checkbox v-model:checked="record['editable']"/>
        </div>
      </template>
    </BasicTable>
    
  </div>
</template>

<script lang="ts">
  /**
   * 设计器/online 流程节点权限配置
   */
  import {ref, watch, defineComponent, computed } from 'vue'
  import { getOnlineFields, getDesignFields} from './node.auth.api';
  import {BasicColumn, BasicTable} from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  
  export default defineComponent({
    name: 'NodeAuthEasyForSelect',
    components:{
      BasicTable
    },
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
      }
      const showDataList = computed(()=>{
        let list:any[] = dataSource.value;
        let text = searchValue.value;
        if(!text){
          return list
        }
        // VUEN-1673【流程节点】搜索同时支持字段和权限编码查询
        let arr = list.filter(row=>row.ruleName.indexOf(searchValue.value) >= 0 || row.ruleCode.indexOf(searchValue.value) >= 0);
        return arr;
      });
      
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
            let field = onlineFields[i];
            let ruleName = field.isMain?field.title:(field.tableNameTxt+'::'+field.title);
            tableValues.push({
              id: i,
              ruleName: ruleName,
              show: true,
              editable: true,
              ruleCode: 'online:' + onlineFields[i].tableName + ':' + onlineFields[i].code,
              useStatus: false
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
              show: true,
              editable: true,
              ruleCode: item.authField,
              useStatus: false,
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
                table.useStatus = true
                //显示：1  禁用：2
                if (ruleType == '1') {
                  //正向1 反向0
                  if (status == '1') {
                    table.show = true
                  } else {
                    table.show = false
                  }
                } else if (ruleType == '2') {
                  if (status == '1') {
                    table.editable = false
                  } else {
                    table.editable = true
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
        return getSubmitData(dataSource.value);
      }

      function getSubmitData(ds) {
        let arr:any[] = [];
        //将数据转化成数据库的结构, 每次后台先执行删除 再执行批量新增
        for (let item of ds) {
          if (item.useStatus === true) {
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
            if (item.show === true) {
              //显示的 正向的
              let record = Object.assign({ ruleType: '1', status: '1' }, temp);
              arr.push(record);
            } else {
              //显示的 反向的
              let record = Object.assign({ ruleType: '1', status: '0' }, temp);
              arr.push(record);
            }

            // 禁用权限判断
            if (item.editable === false) {
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

      const tableColumns: BasicColumn[] = [
        { title: '启用', dataIndex: 'useStatus', width: 120, align: 'center' },
        { title: '字段', dataIndex: 'ruleName', width: 200, align: 'center' },
       /* { title: '权限编码', dataIndex: 'ruleCode', width: 100, align: 'center' },*/
        { title: '可见', dataIndex: 'showStatus', width: 100, align: 'center' },
        { title: '可编辑', dataIndex: 'updateStatus', width: 100, align: 'center' },
      ];

      // 列表页面公共参数、方法
      const { tableContext } = useListPage({
        designScope: 'flow-node-auth-table',
        pagination: false,
        tableProps: {
          columns: tableColumns,
          pagination: false,
          showTableSetting: false,
          showActionColumn: false,
          useSearchForm: false,
          showIndexColumn: false,
          rowKey: 'id',
        },
      });
      const [registerTable, { reload }] = tableContext;

      return {
        fieldTableRef,
        registerTable,
        reload,
        searchValue,
        onSearch,
        dataSource,
        getData,
        showDataList
      }
      
    }
  });
</script>

<style scoped></style>
