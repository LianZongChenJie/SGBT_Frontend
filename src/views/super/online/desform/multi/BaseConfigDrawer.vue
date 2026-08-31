<template>
    <BasicDrawer :mask="false" :push="false" :closable="false" :rootClassName="getDrawerClass()" @register="register" :width="640" :headerStyle="{padding: '10px 20px'}">
        <template #title>
            <span><TableOutlined style="color: #ffa515; font-size: 16px"/></span>
            <span class="drawer-title-input">
                <a-input v-model:value="title" @blur="onChangeTitle"/>
            </span>
            <span class="title-close-icon" title="关闭">
                <CloseOutlined @click="closeDrawer"/>
            </span>
        </template>


        <div class="view-config-container" :style="{height: myHeight + 'px'}">
            <div class="left-list">
                <div class="between-padding bottom-border">
                    <div i-flag="bgsz" @click="handleClickItem" :class="activeKey=='bgsz'?'item-active left-list-item':'left-list-item' ">
                        <TableOutlined/> 表格设置
                    </div>
                </div>
                <div class="between-padding bottom-border top-padding">
                    <p>数据设置</p>
                    <div i-flag="sjgl" @click="handleClickItem" :class="activeKey=='sjgl'?'item-active left-list-item':'left-list-item' ">
                        <filter-outlined /> 数据过滤
                    </div>
                    <div i-flag="px" @click="handleClickItem" :class="activeKey=='px'?'item-active left-list-item':'left-list-item' ">
                        <ordered-list-outlined /> 排序
                    </div>
                    <div i-flag="xszd" @click="handleClickItem" :class="activeKey=='xszd'?'item-active left-list-item':'left-list-item' ">
                        <eye-outlined />显示字段
                    </div>
                </div>
                <div class="between-padding bottom-border top-padding">
                    <p>用户操作</p>
                    <div i-flag="kssx" @click="handleClickItem" :class="activeKey=='kssx'?'item-active left-list-item':'left-list-item' ">
                        <search-outlined /> 快速筛选
                    </div>
                    <div i-flag="sxlb" @click="handleClickItem" :class="activeKey=='sxlb'?'item-active left-list-item':'left-list-item' ">
                        <control-outlined /> 筛选列表
                    </div>
                    <div v-if="isLowApp==true" i-flag="zdyan" @click="handleClickItem" :class="activeKey=='zdyan'?'item-active left-list-item':'left-list-item' ">
                        <ApiOutlined /> 自定义按钮
                    </div>
                </div>
                
            </div>
            <div ref="rightRef" class="right-container">
                <!-- 表格设置 -->
                <Biaogeshezhi v-if="activeKey=='bgsz'" :columnList="columnList" :info="config.bgsz" @save="saveBase"/>

                <!-- 数据过滤 -->
                <MultipleQueryFilter v-if="activeKey=='sjgl'" :desformCode="designFormCode" :columnList="columnList" :info="config.sjgl" :scrollContainer="$refs.rightRef" @save="saveFilterData"/>

                <!-- 排序 -->
                <paixu v-if="activeKey=='px'" :columnList="columnList" :info="config.px" @save="saveFilterData"/>

                <!-- 显示字段 -->
                <xianshiziduan v-if="activeKey=='xszd'" :columnList="columnList" :info="config.xszd" :config="config" @save="saveBase"></xianshiziduan>

                <!-- 快速筛选 -->
                <kuaisushaixuan v-if="activeKey=='kssx'" :columnList="columnList" :info="config.kssx" @save="saveFilterData"/>

                <!-- 筛选列表 -->
                <shaixuanliebiao v-if="activeKey=='sxlb'" :columnList="columnList" :info="config.sxlb" @save="saveFilterData" />

                <!-- 自定义按钮 -->
                <zidingyianniu v-if="activeKey=='zdyan'" :isLowApp="isLowApp" :info="config.zdyan" @refresh="refreshView" :viewId="ID" :designFormName="designFormName" :code="designFormCode"/>
            </div>
        </div>
    </BasicDrawer>
</template>

<script>
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref, reactive, watch } from 'vue'
  import { ApiOutlined, CloseOutlined, OrderedListOutlined, TableOutlined, FilterOutlined, EyeOutlined, SearchOutlined, ControlOutlined, AppstoreOutlined } from '@ant-design/icons-vue';
  import draggable from 'vuedraggable';
  import Biaogeshezhi from './config/Biaogeshezhi.vue'
  import {MultipleQueryFilter} from './config'
  import Paixu from './config/Paixu.vue'
  import Xianshiziduan from './config/Xianshiziduan.vue'
  import Kuaisushaixuan from './config/Kuaisushaixuan.vue'
  import Shaixuanliebiao  from './config/Shaixuanliebiao.vue'
  import Zidingyianniu from "./config/Zidingyianniu.vue";
  import { defHttp } from '/@/utils/http/axios';
  import Bgsz from './model/Bgsz';
  import Sjgl from './model/Sjgl';
  import Px from './model/Px';
  import Xszd from './model/Xszd';
  import Kssx from './model/Kssx'
  import Sxlb from  './model/Sxlb'
  import Zdyan from "./model/Zdyan";
  import { useDrawerTop } from './ts/useViewTabs'
  import { useWatchDesigner } from "./ts/useWatchDesigner";

  export default {
    name: "BaseConfigDrawer",
    components:{
      TableOutlined,
      FilterOutlined,
      EyeOutlined,
      CloseOutlined,
      OrderedListOutlined,
      SearchOutlined,
      AppstoreOutlined,
      ControlOutlined,
      BasicDrawer,
      MultipleQueryFilter,
      Biaogeshezhi,
      Xianshiziduan,
      Paixu,
      Kuaisushaixuan,
      Shaixuanliebiao,
      ApiOutlined,
      Zidingyianniu
    },
    emits:['reload', 'register'],
    props:{
      dbConfig: {
        type: Object,
        default: ()=>{}
      },
      isLowApp:{
        type: Boolean,
        default: false,
      }
    },
    setup(props, {emit}){
      const ID = ref('');
      const designFormCode = ref('');
      const designFormName = ref('')
      const title = ref('');
      const columnList = ref([]);
      const config = reactive({
        bgsz: '',
        sjgl: '',
        px: '',
        xszd: '',
        kssx: '',
        sxlb: '',
        zdyan:''
      });
      
      // 弹窗
      const [register, { closeDrawer, getVisible }] = useDrawerInner((data) => {
        console.log('data', data);
        title.value = data.myTitle;
        columnList.value = data.columnList;
        ID.value = data.id;
      });

      // 监听设计表单弹窗
      useWatchDesigner({ closeDrawer, getVisible })

      watch(()=>props.dbConfig, (data)=>{
        if(data && data.id){
          initConfig(data);
          designFormCode.value = data.desform_code;
          designFormName.value = data.desformName;
          if(data.designFormTitleField){
            if(config.zdyan){
              config.zdyan.setFormTitleField(data.designFormTitleField);
            }
          }
        }
      }, {deep: true});
      
      function initConfig(data){
        config.bgsz = new Bgsz(data);
        config.sjgl = new Sjgl(data);
        config.px = new Px(data);
        config.xszd = new Xszd(data);
        config.kssx = new Kssx(data);
        config.sxlb = new Sxlb(data);
        config.zdyan = new Zdyan(data);
      }

      const { myHeight, getDrawerClass } = useDrawerTop(props);
      
      const activeKey = ref('bgsz');
      function handleClickItem(e){
        e.preventDefault();
        e.stopPropagation();
        let temp = e.target.getAttribute('i-flag');
        if(temp){
          activeKey.value = temp;
        }
      }

      /**
       * 刷新列表配置且数据
       * @param data
       * @returns {Promise<void>}
       */
      async function saveFilterData(data){
        let params = {
          id: ID.value,
          ...data
        }
        await updateViewConfig(params, true)
      }

      /**
       * 只刷新列表配置
       * @param data
       * @returns {Promise<void>}
       */
      async function saveBase(data){
        let params = {
          id: ID.value,
          ...data
        }
        await updateViewConfig(params, true)
      }
      
      async function updateViewConfig(params, reloadData){
        const url = '/desform/view/updateViewConfig'
        //const data = await defHttp.put({ url, params });
        defHttp.put({ url, params }, { isTransformResponse: false }).then((res) => {
          if(res.success){
            if(reloadData===true){
              //刷新页面效果和数据
              //update-begin---author:wangshuai ---date:20230816  for：【QQYUN-5514】数据过滤新增筛选组------------
              emit('reload', ID.value, params)
              //update-end---author:wangshuai ---date:20230816  for：【QQYUN-5514】数据过滤新增筛选组------------
            }else{
              //刷新页面效果
              emit('reload')
            }
          }else{
            console.error(res.message)
          }
        });
        console.log('updateViewConfig', params)
      }
      
      function refreshView() {
          emit('reload')
      }

      function onChangeTitle(e){
        let name = e.target.value;
        let params = {
          id: ID.value,
          name
        };
        updateViewConfig(params)
      }
      
      return {
        register,
        myHeight,
        title,
        activeKey,
        handleClickItem,
        columnList,
        saveFilterData,
        closeDrawer,

        onChangeTitle,
        saveBase,
        config,
        designFormCode,
        ID,
        refreshView,
        getDrawerClass,
        designFormName
      }
    }
  }
</script>

<style lang="less" >

    .drawer-title-input {
        display: inline-block;
        width: 400px;
        margin-left: 10px;
        .ant-input{
            border:none;
            font-size: 16px;
        }
    }

    .view-config-container{
        display: flex;height:100%;
        .left-list{
            width: 200px;background: #fafafa;border-bottom: 1px solid #eaeaea;font-size: 13px;
            .between-padding{
                padding-left: 24px;
                padding-right: 24px;
            }
            .top-padding{
                padding-top: 12px;
                p{
                    color: #9e9e9e;
                    font-size: 13px;
                    font-weight: 600;
                    line-height: 1;
                    margin: 12px 0 10px;
                }
            }
            .bottom-border{
                /* border-bottom: 1px solid #ededed;*/
                &::after{
                    border-bottom: 1px solid #ededed;
                    content: " ";
                    display: block;
                    padding-bottom: 6px;
                    width: 100%;
                }
            }
            .left-list-item{
                line-height: 48px;
                cursor: pointer;
                &:hover{
                    color: #2196f3;
                }
                &.item-active{
                    color: #2196f3;
                }
            }
            .anticon{margin-right: 12px}
        }

        .right-container {
          width: 100%;
          flex: 1;
          position: relative;
          overflow-y: auto
        }

        .right-content{
            width: 100%;
            flex:1;
            position:relative;

        }
    }
</style>
