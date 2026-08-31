<template>
    <div class="inner-content">
        <div class="title">排序</div>
        <div class="tip">选择此视图下的记录默认排序方式</div>
        <div class="config-detail" style="width:320px;padding-top: 0">
            <div class="order-config">
                
                <div class="order-item" v-for="(item, index) in orderList">
                    <div>
                        <a-select
                            v-model:value="item.field"
                            show-search
                            placeholder="请选择字段"
                            style="width: 120px;cursor: pointer"
                            :options="fieldOptions"
                            :filter-option="myFilter"
                            @change="handleChange" >
                        </a-select>
                    </div>
                    <div>
                        <a-select
                            v-model:value="item.type"
                            show-search
                            placeholder="请选择排序方式"
                            style="width: 120px;cursor: pointer"
                            :options="typeOptions"
                            @change="handleChange" >
                        </a-select>

                    </div>
                    <div class="right-icon">
                        <MinusCircleOutlined @click.prevent="onRemove(index)" title="移除" :class="orderList.length==1?'disabled':''"/>
                        <plus-circle-outlined @click.prevent="onAdd" title="新增"/>
                    </div>
                </div>
                
                <div style="margin: 10px 0 0 5px">
                    <a-button v-if="orderList.length>0" @click="saveCondition" style="border-radius: 20px" type="primary">
                        <SaveOutlined />保 存
                    </a-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

  import {ref, watch, defineComponent } from 'vue'
  import { systemFields,OrderItem } from '../ts/type.definition'
  import { pick } from 'lodash-es';
  import { PlusCircleOutlined, MinusCircleOutlined,SaveOutlined } from '@ant-design/icons-vue';
  
  export default defineComponent({
    name: "Paixu",
    components:{
      PlusCircleOutlined,
      MinusCircleOutlined,
      SaveOutlined
    },
    props: {
      // 表单设计器默认的列
      columnList: {
        type: Array,
        default: () => [],
      },
      // orders
      info:{
        type: Object,
        require: false,
        default: {},
      }
    },
    emits:['save'],
    setup(props, {emit}){
      const temp = ref('');
      // value label
      const fieldOptions = ref<any[]>([]);
      const myFilter = (input, option)=>{
        return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.label.indexOf(input) >= 0;
      }
      
  
      const orderList = ref<OrderItem[]>([{
        name: '',
        type: 'asc',
        field: ''
      }]);
      
      watch(()=>props.columnList, (list)=>{
        if(list){
          let arr:any[] = []
          for(let item of list){
            let temp:any = pick(item, 'name', 'model')
            arr.push({
              label: temp.name,
              value: temp.model
            })
          }
          for(let item of systemFields){
            arr.push({
              label: item.name,
              value: item.field
            })
          }
          fieldOptions.value = arr;
        }
      }, {immediate: true});
      
      watch(()=>props.info, (config)=>{
        let arr:OrderItem[] = [];
        if(config && config.orders){
          let list = config.orders;
          for(let item of list){
            let name = getNameByModel(item.field);
            arr.push({
              ...item,
              name
            })
          }
        }
        if(arr.length==0){
          orderList.value = [{
            name: '',
            type: 'asc',
            field: ''
          }]
        }else{
          orderList.value = arr;
        }
      }, {deep: true, immediate: true});
      
      function getNameByModel(field){
        let cList:any[] = props.columnList;
        let temp = ''
        for(let item of cList){
          if(item.model===field){
            temp = item.name; 
          }
        }
        if(!temp){
          //系统字段
          for(let item of systemFields){
            if(item.field===field){
              temp = item.name;
            }
          }
        }
        return temp;
      }
      
      
      const typeOptions = [{
        value: 'asc', label: '升序'
      },{
        value: 'desc', label: '降序'
      }];
      
    
      
      function onAdd(){
        let arr = orderList.value
        arr.push({
          name: '',
          type: 'asc',
          field: ''
        });
        orderList.value = arr;
      }

      function onRemove(index){
        let arr = orderList.value;
        if(arr.length==1){
          return;
        }
        arr.splice(index, 1);
        orderList.value = arr;
        // 保存数据 触发刷新事件-
      }

      const handleChange = (value: string) => {
        console.log(`selected ${value}`);
        console.log(orderList.value)
        // 保存数据 触发刷新事件-
        
      };
      
      function saveCondition(){
        let list = orderList.value;
        let arr = list.map(item=>{
          return {
            type: item.type,
            field: item.field
          }
        })
        emit('save', {
          orders: arr,
        });
      }

      
      return {
        temp,
        saveCondition,
        fieldOptions,
        typeOptions,
        myFilter,
        handleChange,
        orderList,
        onRemove,
        onAdd
      }
      
    }
  });
</script>

<style lang="less" scoped>
    @import "./common";
</style>