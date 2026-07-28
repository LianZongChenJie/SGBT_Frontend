<template>
    <div class="inner-content">
      <div v-if="queryList.length>0">
          <div class="title">快速筛选</div>
          <div class="tip">选择字段作为快速筛选器平铺显示在视图中，以帮助用户快速查询记录。</div>
          <div class="config-detail" style="width:320px;padding-top: 0">
              
              <div class="query-field-list">
                  <draggable item-key="name" animation="300" v-model="queryList" dragClass="dragClass" @end="onDragEnd">
                      <template #item="{ element, index }">
                          <div class="query-field-item">
                              <div style="width: 30px;padding-left: 5px">
                                  <OrderedListOutlined title="调整顺序"/>
                              </div>
                              <div style="flex: 1">
                          <component-icon :type="element.type"/>
                          <span class="ellipsis">
                              {{element.name}}
                          </span>
                              </div>
                              <div class="right-icon">
                                  <EditOutlined title="编辑" @click.prevent="onEdit(element, index)"/>
                                  <DeleteOutlined title="删除" @click.prevent="onRemove(index)"/>
                              </div>
                          </div>
                      </template>
                  </draggable>
              </div>
              <div style="width: 100%">
                  <a-popover overlayClassName="view-pop-field-select" v-model:open="showPop" trigger="click">
                      <template #content>
                          <div class="field-list">
                              <template v-for="item in selectList">
                                  <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
                                      <div><component-icon :type="item.type"/>{{item.name}}</div>
                                  </div>
                              </template>
                          </div>
                      </template>
                      <template #title>
                          <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
                              <template #prefix>
                                  <SearchOutlined style="color: #c0c0c0" />
                              </template>
                          </a-input>
                      </template>

                      <a-button block @click="onAdd">
                          <PlusOutlined/>
                          <span style="margin-left: 10px">选择字段</span>
                      </a-button>
                  </a-popover>
              </div>

              <div style="color: #333!important;margin-top: 32px!important;font-weight: 700!important; ">
                  设置
              </div>
              <div style="margin-top:13px">
                  <a-checkbox v-model:checked="queryButton" @change="handleChangeStatus" :disabled="queryButtonDisabled">启用查询按钮</a-checkbox>
                  <a-tooltip title="启用按钮后，点击查询按钮执行筛选。当筛选字段超过3个时必须启用。">
                      <QuestionCircleFilled style="color: #9e9e9e"/>
                  </a-tooltip>
              </div>
              <div style="margin-top:13px">
                  <a-checkbox v-model:checked="waitQuery" @change="handleChangeStatus">在执行查询后显示数据</a-checkbox>
                  <a-tooltip title="勾选后，进入视图初始不显示数据，查询后显示符合筛选条件的数据。">
                      <QuestionCircleFilled style="color: #9e9e9e"/>
                  </a-tooltip>
              </div>
          </div>
      </div>

        <a-empty v-else class="no-data" :image="noDataImage" :image-style="{height: '222px', marginTop: '50px'}">
            <template #description>
              <span>
                <h6>
                    快速筛选
                </h6>
                <div class="tip">选择字段作为快速筛选器平铺显示在视图中，以帮助用户快速查询记录。</div>
              </span>
            </template>

            <a-popover overlayClassName="view-pop-field-select" v-model:open="showPop" trigger="click">
                <template #content>
                    <div class="field-list">
                        <template v-for="item in selectList">
                            <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
                                <div><component-icon :type="item.type"/>{{item.name}}</div>
                            </div>
                        </template>
                    </div>
                </template>
                <template #title>
                    <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
                        <template #prefix>
                            <SearchOutlined style="color: #c0c0c0" />
                        </template>
                    </a-input>
                </template>

                <a-button @click="onAdd" type="primary" style="border-radius: 15px">
                    <PlusOutlined/>选择字段
                </a-button>
            </a-popover>
            
        </a-empty>
    </div>

    <ks-shaixuan-drawer @register="registerDrawer" @ok="editOk" :columnList="columnList"></ks-shaixuan-drawer>
</template>

<script lang="ts">
    import {ref, defineComponent, computed, watchEffect } from 'vue'
    import { pick } from 'lodash-es';
    import { PlusOutlined,SearchOutlined, OrderedListOutlined, DeleteOutlined, EditOutlined,QuestionCircleFilled } from '@ant-design/icons-vue';
    import noDataImage from '../img/kuaisushaixuan.png';
    import draggable from 'vuedraggable';
    import KsShaixuanDrawer from './KsShaixuanDrawer.vue'
    import { useDrawer } from '/@/components/Drawer';
    import {QueryItem} from '../model/Kssx';
    import { useComponentCondition } from '../ts/useFilterField';
    import {dontShowTypes, systemFields} from "../ts/type.definition";
    import ComponentIcon from "/@/components/jeecg/super/desform/ComponentIcon.vue";
    
    export default defineComponent({
    name: "Kuaisushaixuan",
    props: {
      // 表单设计器默认的列
      columnList: {
        type: Array,
        default: () => [],
      },
      //
      info:{
        type: Object,
        require: false,
        default: {},
      }
    },
    components:{
      PlusOutlined,
      SearchOutlined,
      OrderedListOutlined,
      EditOutlined,
      DeleteOutlined,
      draggable,
      KsShaixuanDrawer,
      QuestionCircleFilled,
      ComponentIcon
    },
    emits:['save'],
    setup(props, {emit}){
      const queryList = ref<QueryItem[]>([]);
      const { getDefaultRule } = useComponentCondition()
      const [registerDrawer, { openDrawer }] = useDrawer();
      
      const showPop = ref(false);
      const filterValue = ref('')
      function isFilterItem(item){
        let temp = filterValue.value;
        if(!temp){
          return true;
        }
        if(!item){
          return false;
        }
        return item.name.indexOf(temp)>=0
      }

      function onSelectField(item){
        let field = item.field||item.model;
        let arr = queryList.value;
        let queryType = getDefaultRule(item.type)
        arr.push({
          field,
          type: item.type,
          name: item.name,
          seq: 99,
          queryType
        });
        queryList.value = arr;
        showPop.value = false
        onChangeQueryList();
      }

      const onAdd = ()=>{
        showPop.value = true
      };
      
      const selectList = computed(()=>{
        let clist:any[] = props.columnList;
        if(!clist || clist.length==0){
          return []
        }
        let list = clist.filter(item=>dontShowTypes.indexOf(item.type)<0)
        let arr:any[] = [];
        let existList = queryList.value.map(item=>item.field);
        for(let item of list){
          if(existList && existList.indexOf(item.model)>=0){
          }else{
            arr.push({
              field: item.model,
              type: item.type,
              name: item.name
            })
          }
        }
        for(let item of systemFields){
          if(existList && existList.indexOf(item.field)>=0){
          }else{
            arr.push({
              field: item.field,
              type: item.type,
              name: item.name
            })
          }
        }
        return arr;
      });
      
      function onDragEnd(){
        // 拖动完毕 改变查询控件的顺序
        onChangeQueryList();
      }
      
      function onRemove(index){
        let arr = queryList.value;
        arr.splice(index, 1);
        queryList.value = arr;
        onChangeQueryList();
      }
      
      let editIndex = -1;
      function onEdit(item, index){
        console.log('onEdit', item);
        editIndex = index;
        openDrawer(true, {
          record: item
        })
      }
      function editOk(obj){
        let list = queryList.value;
        if(editIndex<0){
          console.error('不知道为什么会进入此逻辑')
          return;
        }
        let item = list[editIndex];
        if(obj.field){
          item.field = obj.field;
          item.queryType = obj.queryType;
          item.type = obj.type;
          item.name = obj.name;
        }else{
          item.queryType = obj.queryType;
        }
        queryList.value = list;
        onChangeQueryList();
      }

      const queryButton = ref(true)
      const waitQuery = ref(false)
      //改变checkbox 状态值触发
      function handleChangeStatus(){
        emit('save', {
          queryButton: queryButton.value,
          waitQuery: waitQuery.value
        })
      }
      
      const queryButtonDisabled = ref(false)

      /**
       * 选中添加字段，移除字段, 编辑字段，改变字段查询方式，调整字段顺序时都会触发
       */
      function onChangeQueryList(){
        let list = queryList.value;
        let arr:any[] = []
        if(list && list.length>0){
          for(let i=0;i<list.length;i++){
            let temp = pick(list[i], 'field', 'queryType', 'type')
            arr.push({
              ...temp,
              seq: i
            })
          }
        }
        
        let emitParams: any = {
          queryList: arr,
          queryButton: queryButton.value,
          waitQuery: waitQuery.value
        };
        
        if(!list || list.length<4){
          queryButtonDisabled.value = false
        }else{
          queryButtonDisabled.value = true;
          queryButton.value = true;
          emitParams.queryButton = true;
        }
        emit('save', emitParams);
      }

      function getName(field, list){
        let arr = list.filter(item=>item.model == field)
        if(arr && arr.length>0){
          return arr[0].name;
        }
        let arr2 = systemFields.filter(item=>item.field == field)
        if(arr2 && arr2.length>0){
          return arr2[0].name;
        }
        return ''
      }
      
      watchEffect(()=>{
        let arr:QueryItem[] = []
        let cList:any[] = props.columnList;
        let temp = props.info;
        if(cList && cList.length>0){
          if(temp && temp.queryList){
            for(let item of temp.queryList){
              let name = getName(item.field, cList);
              arr.push({
                name,
                field: item.field,
                type: item.type,
                queryType: item.queryType,
                seq: 1
              });
            }
          }
        }
        queryList.value = arr;
        
        if(temp){
          if(temp.hasOwnProperty('queryButton')){
            queryButton.value = temp.queryButton
          }
          if(temp.hasOwnProperty('waitQuery')){
            waitQuery.value = temp.waitQuery
          }
        }
      });
      
      return {
        queryList,
        noDataImage,
        onAdd,
        showPop,
        filterValue,
        isFilterItem,
        onSelectField,
        selectList,
        onDragEnd,
        onRemove,
        onEdit,
        editOk,
        registerDrawer,

        queryButton,
        waitQuery,
        handleChangeStatus,
        queryButtonDisabled
      }
      
    }
  })
</script>

<style scoped lang="less">
    @import "./common";
</style>
