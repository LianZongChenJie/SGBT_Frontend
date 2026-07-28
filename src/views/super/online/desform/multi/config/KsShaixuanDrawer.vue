<template>
    <BasicDrawer getContainer="body" v-bind="$attrs" title="筛选设置" drawerClass="view-config-drawer" @register="register" width="400" :headerStyle="{padding: '10px 20px'}">
        <div style="padding: 0px 24px">
            <div style="padding-top: 24px;font-weight: bold;font-size: 13px;padding-left:2px">
                筛选字段:
            </div>
            <div style="cursor: pointer;margin-top:8px">
                <a-select
                    v-model:value="queryField"
                    show-search
                    placeholder="请选择字段"
                    style="width: 100%"
                    :options="selectFieldList"
                    :filter-option="myFilter"
                    @change="handleChangeField" >
                </a-select>
            </div>

            <div style="padding-top: 24px;font-weight: bold;font-size: 13px;padding-left:2px">
                筛选方式:
            </div>
            <div style="cursor: pointer;margin-top:8px">
                <a-select
                    v-model:value="queryType"
                    style="width: 100%"
                    @change="handleChangeQueryType"
                    :options="queryTypeList">
                </a-select>
            </div>
        </div>
        
        
    </BasicDrawer>
</template>

<script>
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import {ref} from 'vue'
  import {useFieldSelect} from '../ts/useFieldSelect'
  
  
  export default {
    name: "KsShaixuanDrawer",
    props:{
      columnList: {
        type: Array,
        default: () => [],
      },
    },
    components:{
      BasicDrawer
    },
    emits:['register', 'ok'],
    setup(props, {emit}) {
      const title = ref('');
      const columnList = ref([]);
      const { selectFieldList,myFilter,getColumnInfo } = useFieldSelect(props);
      const queryField = ref('');
      const queryType = ref('like');
      
      
      function handleChangeField(value){
        console.log('handleChange', value)
        let column = getColumnInfo(value);
        console.log(column)
        // 判断类型是否选择
/*        key: "1663417677553_363928"
        model: "checkbox_1663417677553_363928"
        name: "多选框组"
        type: "checkbox"*/
        emit('ok', {
          field: column.model,
          type: column.type,
          name: column.name,
          queryType: queryType.value,
        })
      }
      
      function handleChangeQueryType(){
        emit('ok', {
          queryType: queryType.value
        })
      }
      
      // 弹窗
      const [register, { closeDrawer }] = useDrawerInner((data) => {
        console.log('data', data);
        queryField.value = data.record.field;
        queryType.value = data.record.queryType || 'like';
      });
      
      const queryTypeList = [{
        value: 'like', label: '模糊搜索'
      },{
        value: 'eq', label: '精准搜索'
      },{
        value: 'elemMatch', label: '多词匹配'
      },{
          value: 'range', label: '范围查询'
      }];
      
      return {
        selectFieldList,
        queryTypeList,
        myFilter,
        register,
        handleChangeQueryType,
        handleChangeField,
        
        queryField,
        queryType
      }
    }
  }
</script>

<style scoped>

</style>