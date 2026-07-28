<template>
    <div class="inner-content">
        <div v-if="leftFilterField">
            <div class="title">{{title}}</div>
            <div class="tip">{{tip}}</div>
            <div class="config-detail" style="width:320px;padding-top:20px">
                <div>
                    <div class="label" style="display: flex;justify-content: space-between">
                        <div>筛选字段</div>
                        <div @click="onRemoveField" class="clear-text"></div>
                    </div>
                    <div class="config-item">
                        <a-select 
                            show-search
                            ref="selectRef"
                            placeholder="请选择字段"
                            style="width: 100%"
                            :options="selectFieldList"
                            :filter-option="myFilter"
                            mode="tags"
                            @change="handleChange"
                            v-model:value="leftFilterField">
                            <template #option="{ label, type }">
                                <component-icon :type="type"/>
                                {{ label }}
                            </template>
                            <template #tagRender="{ label, option }">
                                <component-icon :type="option.type" style="margin:0 5px"/>
                                {{ label }}
                            </template>
                        </a-select>
                    </div>

                    <div class="label" v-if="showDataFilterConfig">显示项  </div>
                    <div class="config-item" v-if="showDataFilterConfig">
                        <a-select style="width: 100%" :options="dataFilterOptions" v-model:value="leftFilterData" @change="onChange"></a-select>
                        
                        <div style="margin-top: 5px;width: 100%" v-if="leftFilterData=='part'" >
                            <a-select
                                    v-model:value="partCondition"
                                    show-search
                                    :maxTagCount="3"
                                    mode="multiple"
                                    placeholder="请选择字段"
                                    style="width: 100%;cursor: pointer"
                                    :options="selectPartDataList"
                                    :filter-option="myFilter"
                                     >
                            </a-select>
                        </div>
                    </div>
                    
                    

                    <div class="label" v-if="showDataFilterConfig">排序方式  </div>
                    <div class="config-item" v-if="showDataFilterConfig">
                        <a-select style="width: 100%" :options="orderOptions" v-model:value="leftFilterOrder"></a-select>
                    </div>

                    <div class="label" >设置</div>
                    <div class="config-item">
                        <a-checkbox v-model:checked="addFormDefaultStatus">创建记录时，以选中列表作为默认值</a-checkbox>
                        <a-tooltip title="如：在商品表中以商品类型（生鲜、副食、饮料等）作为筛选列表时，如果当前选中了饮料分类，则创建记录时商品类型默认为饮料。">
                            <QuestionCircleFilled style="color: #9e9e9e"/>
                        </a-tooltip>
                    </div>
                    
                </div>

                <div style="margin: 10px 0 0 5px">
                    <a-button @click="saveCondition" style="border-radius: 20px" type="primary">
                        <SaveOutlined />保 存
                    </a-button>

                    <a-button @click="onRemoveField" style="border-radius: 20px;margin-left: 20px">
                        <DeleteOutlined />清除
                    </a-button>
                </div>
                
            </div>
        </div>

        <a-empty v-else class="no-data" :image="noDataImage" :image-style="{height: '222px', marginTop: '50px'}">
            <template #description>
              <span>
                <h6>
                    {{title}}
                </h6>
                <div class="tip">{{tip}}</div>
              </span>
            </template>
            <a-popover overlayClassName="view-pop-field-select" v-model:open="showPop" trigger="click">
                <template #content>
                    <div class="field-list">
                        <template v-for="item in selectFieldList">
                            <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
                                <div><component-icon :type="item.type"/>{{item.label}}</div>
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

                <a-button type="primary" style="border-radius: 15px">
                    <PlusOutlined/>选择字段
                </a-button>
            </a-popover>
        </a-empty>
        
    </div>
</template>

<script lang="ts">
  import { ref, reactive, defineComponent, toRefs, toRaw, watch, computed } from 'vue';
  import Sxlb from '../model/Sxlb';
  import {useFieldSelect} from '../ts/useFieldSelect'
  import noDataImage from '../img/shaixuanliebiao.png';
  import { ApartmentOutlined, DeleteOutlined, SaveOutlined, DownSquareOutlined, PlusOutlined,SearchOutlined, QuestionCircleFilled } from '@ant-design/icons-vue';
  import { initDictOptions } from '/@/utils/dict/index';
  import ComponentIcon from "/@/components/jeecg/super/desform/ComponentIcon.vue";
  import { pageApi } from '../../auto/auto.desform.api';
  /**
   * 筛选字段
   */
  export default defineComponent({
    name: "Shaixuanliebiao",
    props:{
      columnList: {
        type: Array,
        default: () => [],
      },
      info:{
        type: Object,
        require: false,
        default: {},
      }
    },
    components:{
      PlusOutlined,
      SearchOutlined,
      DownSquareOutlined,
      ApartmentOutlined,
      SaveOutlined,
      DeleteOutlined,
      QuestionCircleFilled,
      ComponentIcon
    },
    emits:['save'],
    setup(props, {emit}){
      const base = {
        title: '筛选列表',
        tip: '将所选字段选项以列表的形式显示在视图左侧，帮助用户快速查看记录，支持下拉、关联记录和下拉树字段。'
      };
      
      const config = reactive<Sxlb>({
        leftFilterField:'',
        leftFilterData: 'all',
        leftFilterCondition: '',
        leftFilterOrder: 'desc',
        addFormDefaultStatus: false
      });
      const partCondition = computed({
        get(){
          if(config.leftFilterCondition){
            return config.leftFilterCondition.split(',')
          }
          return []
        },
        set(arr){
          if(arr.length>0){
            config.leftFilterCondition = arr.join(',')
          }else{
            config.leftFilterCondition = ''
          }
        }
      });
      
      const selectDictInfo = reactive({
        dictCode: '',
        dictTable: '',
        dictText: '',
        staticOptions: [],
        type: ''
      });
      
      // part 的选项
      const selectPartDataList = ref<any[]>([]);
      
      const isTreeField = ref(false)
      const showDataFilterConfig = computed(()=>{
        if(isTreeField.value==true){
          return false;
        }
        return true
      });
      
      watch(()=>props.info, (temp)=>{
        Object.keys(config).map(k=>{
          config[k] = temp[k];
        });
        if(temp.leftFilterField){
          if(props.columnList){
            let arr:any[] = props.columnList.filter(i=>i.model==temp.leftFilterField)
            if(arr.length>0){
              let item = arr[0];
              let staticOptions = item.options;
              if(staticOptions){
                getDictInfo({
                  ...item,
                  staticOptions
                })
              }else{
                getDictInfo({
                  ...item
                })
              }
            }
          }
        }
      }, {immediate: true, deep: true})

      const compTypes = 'link-record,table-dict,radio,select,select-tree';
      const { selectFieldList, getColumnInfo, filterValue, isFilterItem, showPop, myFilter } = useFieldSelect(props, {type: compTypes, remote: false});
      function onSelectField(item){
        console.log(item);
        config.leftFilterField = item.value;
        getDictInfo(item);
      }
      function onAdd(){
        
      }
      
      function getDictInfo(item){
        console.log('item', item)
        isTreeField.value = item.type=='select-tree'
        if(item.type==='link-record'){
          selectDictInfo.dictText = item.titleField;
          selectDictInfo.dictTable = item.code;
        }else{
          selectDictInfo.dictText = item.dictText;
          selectDictInfo.dictTable = item.dictTable;
          selectDictInfo.dictCode = item.dictCode;
          selectDictInfo.staticOptions = item.staticOptions;
        }
        selectDictInfo.type = item.type;
      }

      watch(selectDictInfo, async (info)=>{
        // 字典信息改变 需要改变字典数据
        if(info.type === 'link-record'){
          let list = await getLinkRecordDictData(info.dictTable, info.dictText);
          console.log('关联记录字典数据', list)
          selectPartDataList.value = list;
        }else{
          if(info.dictTable && info.dictText && info.dictCode){
            let code = `${info.dictTable},${info.dictText},${info.dictCode}`;
            let list = await initDictOptions(code);
            console.log('表字典数据', list)
            selectPartDataList.value = list;
          }else if(info.dictCode){
            let list = await initDictOptions(info.dictCode);
            console.log('数据字典', list)
            selectPartDataList.value = list;
          }else{
            if(info.staticOptions&&info.staticOptions.length>0){
              let list:any[] = []
              let arr:any[] = info.staticOptions
              for(let item of arr){
                list.push({
                  value: item.value,
                  label: item.value
                })
              }
              selectPartDataList.value = list;
            }else{
              selectPartDataList.value = [];
            }
          }
        }
      }, {deep: true, immediate: true})
      
      function handleChange(arr){
        if(arr.length>0){
          let str = arr[arr.length-1];
          //let list = selectFieldList.value;
          //let temp = list.filter(i=>i.value==str);
          let temp = props.columnList.filter(it=>it.model === str||it.key === str)
          if(temp.length>0){
            getDictInfo(temp[0]);
          }
          config.leftFilterField = str;
        }else{
          config.leftFilterField = '';
        }
        selectRef.value.blur();
      }
      const selectRef = ref();
      function onRemoveField(){
        config.leftFilterField = '';
        //数据库置空
        let data = toRaw(config);
        Object.keys(data).map(k=>{
          data[k] = ''
        });
        data.addFormDefaultStatus = true;
        emit('save', {
          ...data
        })
      }
      
      const dataFilterOptions = [
        {value:'all', label:'全部'},
        {value:'exist', label:'显示有数据的项'},
        {value:'part', label:'显示指定的项'}
      ];
      
      const orderOptions = [
        {value:'asc', label:'升序'},
        {value:'desc', label:'降序'}
      ];
      
      function saveCondition(){
        let data = toRaw(config);
        console.log('筛选列表条件', data);
        emit('save', {
          ...data
        })
      }
      
      function onChange(value) {
        if(value=='part'){
          
        }
      }

      /**
       * 获取关联记录表 的数据
       * @param code
       * @param titleField
       */
      async function getLinkRecordDictData(code, titleField) {
        let res = await pageApi.list({
          pageSize: 100,
          desformCode: code
        });
        let dataSource: any[] = [];
        res.result.records.forEach((item) => {
          let data = JSON.parse(item.desformDataJson);
          dataSource.push({
            value: item.id,
            label: data[titleField]
          });
        });
        console.log('return dataSource;', dataSource )
        return dataSource;
      }
      
      return {
        ...toRefs(config),
        ...base,

        selectRef,
        filterValue,
        isFilterItem,
        showPop,
        selectFieldList,
        getColumnInfo,
        onSelectField,
        onAdd,
        saveCondition,
        myFilter,
        handleChange,
        noDataImage,
        dataFilterOptions,
        orderOptions,
        onRemoveField,
        selectPartDataList,
        onChange,
        partCondition,
        showDataFilterConfig,
        isTreeField
      }
      
      
      
    }
    
  });
</script>

<style scoped lang="less">
    @import "./common";
</style>
