<template>
  <div>
    <div class="search">
      <span class="content">字段权限配置 <span style="color: red"> * </span>  
        <a href="https://www.kancloud.cn/zhangdaiscott/jeecgboot_business/3123294" target="_blank"><Icon icon="ant-design:question-circle-outlined" :size="14"/></a>
      </span>
    </div>
    <!-- 权限字段配置 -->
    <JVxeTable ref="fieldTableRef" toolbar rowSelection :maxHeight="450" :dataSource="dataSource" :columns="columns">
      <!-- 定义插槽开始了 -->
      <template #action="props">
        <a-button type="link" size="small">删除</a-button>
      </template>
    </JVxeTable>
  </div>
</template>

<script lang="ts">
  /**
   * 设计器/online 流程节点权限配置
   */
  import {ref, watch, defineComponent} from 'vue'
  import { PlusOutlined,MinusOutlined } from '@ant-design/icons-vue';
  import { JVxeTypes } from '/@/components/jeecg/JVxeTable/types';

  export default defineComponent({
    name: 'NodeAuthEasyForInput',
    components:{
      PlusOutlined,
      MinusOutlined
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

      watch(()=>props.activeTableName, (val)=>{
        dataSource.value = []
        if (val) {
          console.log(11234, val, )
          let arr:any[] = props.dbAuthDataList;
          if(arr && arr.length>0){
            let tableValues: any = [];
            let thisFormTypeFields = arr.filter(item=>item.formType == props.activeFormType && item.formBizCode == props.activeTableName)
            let tempArray:any[] = []
            for (let i = 0; i < thisFormTypeFields.length; i++) {
              let tempCode = thisFormTypeFields[i].ruleCode
              if(tempArray.indexOf(tempCode)<0){
                tempArray.push(tempCode);
                
                tableValues.push({
                  id: i,
                  ruleName: thisFormTypeFields[i].ruleName,
                  show: 'Y',
                  editable: 'Y',
                  ruleCode: tempCode,
                  begin: '1'
                });
              }
            }
            dataSource.value = getAuthDataSource(tableValues);
          }
 /*         createBy: "admin"
          createTime: "2022-06-21 20:40:11"
          desformComKey: null
          formBizCode: ""
          formType: "3"
          id: "1539226671278211073"
          processId: "1533692855428096002"
          processNodeCode: "Task_0i5cnbc"
          ruleCode: "555"
          ruleName: "252"
          ruleType: "1"
          status: "1"
          updateBy: null
          updateTime: null*/
          
        }
      });

      //获取字段列表需要的数据结构
      function getAuthDataSource(tableValues) {
        let existAuthList: any[] = props.dbAuthDataList;
        let myFormType = props.activeFormType;
        //ruleName ruleCode formType ruleType status
        let tempAuthList = existAuthList.filter((it) => it.formType == myFormType && it.formBizCode == props.activeTableName);
        console.log('tempAuthList', tempAuthList);
        if (tempAuthList && tempAuthList.length > 0) {
          for (let temp of tempAuthList) {
            let { ruleCode, ruleType, status } = temp;
            for (let i = 0; i < tableValues.length; i++) {
              let table = tableValues[i];
              if (table.ruleCode === ruleCode) {
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
      //update-begin-author:liusq---date:2024-06-17--for: TV360X-990 代码生成的权限设置的小问题
      async function getData() {
        let errMap = await fieldTableRef.value?.validateTable();
        if (!errMap) {
          const ds = fieldTableRef.value.getTableData();
          if (!ds || ds.length == 0) {
            return [];
          }
          return getSubmitData(ds);
        } else {
          return null;
        }
      }
      //update-end-author:liusq---date:2024-06-17--for: TV360X-990 代码生成的权限设置的小问题
      function getSubmitData(ds) {
        let arr:any[] = [];
        //将数据转化成数据库的结构, 每次后台先执行删除 再执行批量新增
        for (let item of ds) {
          //只有开启的才需要执行新增操作
          let temp = {
            formType: props.activeFormType,
            formBizCode: props.activeTableName,
            processId: props.processId,
            processNodeCode: props.processNodeCode,
            ruleCode: item.ruleCode,
            ruleName: item.ruleName,
          };
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
        return arr;
      }

      const columns = [
        {
          title: 'ID',
          key: 'id',
          type: JVxeTypes.hidden,
        },
        {
          title: '权限说明',
          key: 'ruleName',
          align: 'center',
          type: JVxeTypes.textarea,
          width: '150px'
        },
        {
          title: '权限编码',
          key: 'ruleCode',
          align: 'center',
          type: JVxeTypes.textarea,
          width: '250px',
          validateRules: [
            {
              required: true, // 必填
              message: '请输入${title}', // 显示的文本
            },
          ],
        },
        {
          title: '可见',
          key: 'show',
          type: JVxeTypes.checkbox,
          customValue: ['Y', 'N'],
          align: 'center',
          width: '90px',
        },
        {
          title: '可编辑',
          key: 'editable',
          type: JVxeTypes.checkbox,
          align: 'center',
          customValue: ['Y', 'N'],
          width: '90px',
        },
  /*      {
          title: '操作',
          key: 'action',
          width: '100px',
          align: 'center',
          type: JVxeTypes.slot,
          slotName: 'action',
        },*/
      ];

      return {
        fieldTableRef,
 
        columns,
        dataSource,
        getData
      }

    }
  });
</script>

<style scoped></style>

