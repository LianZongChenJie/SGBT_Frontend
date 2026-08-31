<template>
  <div class="jee-filter-select-container">
    <a-popover v-model:open="visible" placement="bottomLeft" trigger="click" overlayClassName="jee-filter-select-pop">
      <template #title>
      </template>
      <template #content>
        <!-- 正在添加的数据 -->
        <div class="ant-modal-content"></div>
      
        <FilterEdit
                v-if="isEditPage"
                :columnList="columnList" 
                :info="editFilterInfo"
                @save="saveInfo"
                @copy="copyInfo"
                @search="onlySearch"
                @back="editFilterOk"/>
        
        <a-tabs v-else v-model:activeKey="tabActive" centered class="filter-tab">
          <a-tab-pane key="1" tab="新的筛选" force-render>
            <div v-if="showAdding" class="inner-content filter-select-adding" style="padding:1px">
              <AdvancedFilter :columnList="columnList" @save="beforeSaveFiledList" @search="onlySearch" v-model:clear="showAdding"/>
            </div>

            <a-empty v-else :image="filterImage" :image-style="{margin: '0 auto', height: '160px', verticalAlign: 'middle',borderStyle: 'none'}">
              <template #description>
              <span>
                <div style="color: #9e9e9e">添加筛选条件，查询工作表数据</div>
              </span>
              </template>

              <div style="width: 100%;text-align:center;margin-bottom:10px">
                <a-button @click="handleAdd" type="primary" style="border-radius: 15px">
                  <PlusOutlined/>添加筛选条件
                </a-button>
              </div>
            </a-empty>
            
          </a-tab-pane>
          <a-tab-pane key="2" tab="已保存" force-render class="filter-list">
            
            <template v-if="filterList && filterList.length > 0">
              <div style="color: #9e9e9e; font-size: 12px; padding: 6px 20px"> 我的筛选 </div>
              <div v-for="(filter, index) in filterList" :class="getFilterItemClass(filter)">
           
                <div class="header-content" @click="(e) => handleSelect(e, filter)">
                  <FilterFilled style="margin-right:10px;color:rgb(153, 153, 153);" />
                  <span>{{ filter.title }}</span>
                </div>

                <div class="right-operation">
                  <FilterOperation @opt="(type) => handleFilterOperation(type, filter, index)" @iconVisible="(status)=>filter.iconVisible=status"/>
                </div>
              </div>
            </template>

            <a-empty v-else :image="filterImage" :image-style="{margin: '0 auto', height: '160px', verticalAlign: 'middle',borderStyle: 'none'}">
              <template #description>
              <span>
                <div style="color: #9e9e9e">没有保存的筛选条件</div>
              </span>
              </template>
            </a-empty>
            
          </a-tab-pane>
          <template #renderTabBar="{ DefaultTabBar, ...props }">
            <FilterTabBar v-bind="props" @active="onTabActiveChange"/>
          </template>
        </a-tabs>
        
        
      </template>
      <a-tooltip placement="bottom" title="筛选">
        <span v-if="filterTitle" class="has-filter">
          <filter-outlined />
          <span class="text">{{ filterTitle }}</span>
          <span class="icon">
            <CloseOutlined @click="myClearFilter" />
          </span>
        </span>
        <FilterOutlined v-else />
      </a-tooltip>
    </a-popover>

    <a-modal
      v-model:open="nameModal.visible"
      wrapClassName="filter-name-modal"
      :title="nameModalTitle"
      @ok="handleModalSave"
      :getContainer="getContainer"
    >
      <div style="display: flex; margin-top: 20px">
        <a-form :labelCol="{ span: 8 }" :wrapperCol="{ span: 16 }" ref="nameFormRef" :model="nameModal">
          <a-form-item label="名称" name="filterName" :rules="nameRules">
            <a-input v-model:value="nameModal.filterName" style="width: 300px" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, reactive, ref, toRaw, watch } from 'vue';
  import { FilterOutlined,FilterFilled, PlusOutlined, CheckOutlined, CloseOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
  import { createLocalStorage } from '/@/utils/cache';
  import { useRoute } from 'vue-router';
  import AdvancedFilter from './AdvancedFilter.vue';
  import { useUserStore } from '/@/store/modules/user';
  import FilterOperation from './FilterOperation.vue';
  import dayjs from 'dayjs';
  import FilterTabBar from './FilterTabBar.vue'
  import filterImage from '../img/filter.png';
  import FilterEdit from './FilterEdit.vue'
  import { useSuperQueryCurd } from '../ts/useSuperQueryCurd'
  

  interface FilterInfo {
    id?: string;
    code?:string;
    selected?: boolean;
    title?: string;
    content?: string;
    conditionType?: string;
    conditions?: QueryField[];
    myself?: boolean;
    emitChange?: string;
    index?: number;
    iconVisible?: boolean;
    conditionsGroup?: any;
  }

  interface QueryField {
    field?: string;
    rule?: string;
    val?: string;
    type?: string;
    dbType?: string;
    queryItems?:any;
  }

  // 查询条件存储编码前缀
  //const SAVE_CODE_PRE = 'JSuperFilter_';

  export default defineComponent({
    name: 'FilterSelect',
    components: {
      FilterOutlined,
      FilterFilled,
      PlusOutlined,
      CheckOutlined,
      CloseOutlined,
      EllipsisOutlined,
      AdvancedFilter,
      FilterOperation,
      FilterEdit,
      FilterTabBar
    },
    props: {
      // 表单设计器默认的列
      columnList: {
        type: Array,
        default: () => [],
      },
      routeCode:{
        type: String,
        default: ''
      }
    },
    emits: ['selected', 'filter'],
    setup(props, { emit }) {
      const visible = ref(false);
      // 筛选记录
      const filterList = ref<FilterInfo[]>([]);
      const tabActive = ref('1');
      const activeFilterKey = ref('-1');
      const { userInfo } = useUserStore();

      // 我创建的
      const mySelfFilter = reactive({
        selected: false,
      });
      // 新的筛选条件标题
      const newFilterTitle = ref('');
      // 筛选条件的标题
      const filterTitle = computed(() => {
        if (mySelfFilter.selected === true) {
          return '我创建的';
        } else {
          if (newFilterTitle.value) {
            return newFilterTitle.value;
          }
          let arr = filterList.value.filter((item) => item.selected === true);
          if (arr.length > 0) {
            return arr[0].title;
          }
        }
        return '';
      });

      // 本地缓存
      //const $ls = createLocalStorage();
     // const route = useRoute();
      // 缓存编码
      //const cacheCode = SAVE_CODE_PRE + route.fullPath;
      const {saveSuperQuery, updateSelected, removeSuperQuery, udapteSuperQueryTitle, copySuperQuery, querySuperQueryList } = useSuperQueryCurd(props);
      
      watch(()=>props.routeCode, async (val)=>{
        if(val){
          await initListFromCache();
          // QQYUN-3134【视图】筛选 选择已保存的筛选条件后，再重新刷新浏览器，表格数据重新刷新数据了，筛选条件未清空
          setTimeout(()=>{
            if(filterTitle.value){
              execFilter();
            }
          }, 300)
        }
      }, {immediate: true});
      // 从本地缓存中获取数据
      async function initListFromCache() {
        //let list = $ls.get(cacheCode);
        const list = await querySuperQueryList()
        if (list && list instanceof Array) {
          let arr: FilterInfo[] = [];
          for (let item of list) {
            if (item.myself === true) {
              mySelfFilter.selected = item.selected;
            } else {
              arr.push({
                ...item,
              });
            }
          }
          filterList.value = arr;
          // 判断是否有选中的，如果有则切换至已保存的tab
          let selected = arr.findIndex((item) => item.selected === true) !== -1;
          if (selected) {
            tabActive.value = '2';
          }
        }
      }
      

      /**
       * 点击选中tab,执行该tab下的查询条件
       */
      async function handleSelect(e, filter) {
        e && prevent(e);
        mySelfFilter.selected = false;
        let arr = filterList.value;
        for (let item of arr) {
          item.selected = false;
          if (item.title == filter.title) {
            item.selected = true;
          }
        }
        let params = {
          id: filter.id,
          selected: true,
        }
        newFilterTitle.value = '';
        await updateSelected(params);
        filterList.value = arr;
        //选完关闭pop
        visible.value = false;
        execFilter();
      }

      /**
       * 点击选中tab,执行条件：查询自己创建的
       */
      function selectMyCreate(e) {
        clearFilter(e);
        mySelfFilter.selected = true;
        //选完关闭pop
        visible.value = false;
        execFilter();
      }

      /**
       * 移除查询条件
       */
      async function myClearFilter(e?) {
        let arr = filterList.value;
        for (let item of arr) {
          if(item.selected === true){
            let params = {
              id: item.id,
              selected: false
            };
            await updateSelected(params);
          }
        }
        clearFilter(e);
        execFilter();
        cacheFilter();
        showAdding.value = false;
        newFilterTitle.value = '';
      }
      function clearFilter(e?) {
        e && prevent(e);
        mySelfFilter.selected = false;
        let arr = filterList.value;
        for (let item of arr) {
          item.selected = false;
        }
        filterList.value = arr;
      }

      /* ------------------------------------------弹窗 用于修改查询项的名称---------------------------------------------------- */
      const nameModal = reactive({
        visible: false,
        type: 'save',
        filterName: '',
        validateStatue: false,
      });
      const nameModalTitle = computed(() => {
        if (nameModal.type == 'save') {
          return '保存';
        } else if (nameModal.type == 'copy') {
          return '另存为';
        } else if (nameModal.type == 'rename') {
          return '重命名';
        }
        return '';
      });

      // 是否显示 新增tab
      const showAdding = ref(false);
      // 待保存的信息
      let waitSaveFilterInfo: FilterInfo = {};
      function handleAdd(e) {
        e && prevent(e);
        showAdding.value = true;
        waitSaveFilterInfo = {};
      }
      const nameFormRef = ref();
      async function handleModalSave() {
        let formRef = nameFormRef.value;
        formRef.validate().then(async () => {
          if (nameModal.type == 'save') {
            let arr = filterList.value;
            let temp:FilterInfo = {
              selected: true,
              title: nameModal.filterName,
              conditionType: waitSaveFilterInfo.conditionType,
              //update-begin---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：保存兼容新老数据---
              conditions: waitSaveFilterInfo.conditions?waitSaveFilterInfo.conditions:[],
              conditionsGroup: waitSaveFilterInfo.conditionsGroup?waitSaveFilterInfo.conditionsGroup:[],
              //update-begin---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：保存兼容新老数据---
              myself: false,
            };
            const { id, code } = await saveSuperQuery(temp);
            temp.id = id;
            temp.code = code;
            clearFilter();
            arr.push(temp);
            filterList.value = arr;
            // 新增保存之后立即执行查询
            execFilter();
            showAdding.value = false;
            tabActive.value = '2';
            newFilterTitle.value = '';
          } else if (nameModal.type == 'copy') {
            let arr = filterList.value;
            let temp:FilterInfo = {
              selected: false,
              title: nameModal.filterName,
              conditionType: waitSaveFilterInfo.conditionType,
              //update-begin---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：复制兼容新老数据---
              conditions: waitSaveFilterInfo.conditions?waitSaveFilterInfo.conditions:[],
              conditionsGroup: waitSaveFilterInfo.conditionsGroup?waitSaveFilterInfo.conditionsGroup:[],
              //update-end---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：复制兼容新老数据---
              myself: false,
              id: waitSaveFilterInfo.id
            };
            const { id, code } = await copySuperQuery(temp);
            temp.id = id;
            temp.code = code;
            arr.push(temp);
            filterList.value = arr;
            isEditPage.value = false;
          } else if (nameModal.type == 'rename') {
            let arr = filterList.value;
            for (let item of arr) {
              if (item.title == waitSaveFilterInfo.title) {
                const titleInfo = {
                  id: item.id,
                  title: nameModal.filterName
                }
                await udapteSuperQueryTitle(titleInfo);
                item.title = nameModal.filterName;
              }
            }
            filterList.value = arr;
          }
          nameModal.visible = false;
          cacheFilter();
          waitSaveFilterInfo = {};
        });
      }
      
      /**
       * 保存之前打开 modal
       */
      function beforeSaveFiledList(info) {
        nameModal.visible = true;
        nameModal.filterName = '自定义筛选';
        nameModal.type = 'save';
        console.log(info);
        waitSaveFilterInfo = info;
      }
      function validateOnly(value) {
        let arr = filterList.value;
        if (arr && arr.length > 0) {
          let temp = arr.filter((item) => item.title == value);
          if (temp && temp.length > 0) {
            return false;
          }
        }
        return true;
      }
      const validateFilterName = async () => {
        let value = nameModal.filterName;
        if (value === '') {
          return Promise.reject('请输入名称！');
        } else if (validateOnly(value) === true) {
          return Promise.resolve();
        } else {
          return Promise.reject('该名称已存在！');
        }
      };
      const nameRules = [{ required: true, validator: validateFilterName, trigger: 'change' }];
      /* ------------------------------------------弹窗 用于修改查询项的名称---------------------------------------------------- */

      function cacheFilter() {}

      /**
       * 最终需要将过滤信息抛出去，执行查询
       */
      function execFilter() {
        if (mySelfFilter.selected === true) {
          // 查询自己创建的
          let arr = [
            {
              field: 'create_by',
              rule: 'eq',
              val: userInfo?.username,
              type: 'input',
            },
          ];
          let result = {
            matchType: 'and',
            superQueryParams: arr,
          };
          emit('filter', result);
        } else {
          let list = filterList.value;
          if (list && list.length > 0) {
            let temp = list.filter((item) => item.selected === true);
            if (!temp || temp.length == 0) {
              emit('filter', {
                matchType: 'and',
                superQueryParams: '',
              });
              return;
            }
            if (temp[0].myself === true) {
              // 查询自己创建的
              let arr = [
                {
                  field: 'create_by',
                  rule: 'eq',
                  val: userInfo?.username,
                  type: 'input',
                },
              ];
              let result = {
                matchType: 'and',
                superQueryParams: arr,
              };
              emit('filter', result);
            } else {
              emitFilter(getConditions(temp[0]), temp[0].conditionType);
            }
          } else {
            emit('filter', { matchType: 'and', superQueryParams: '' });
          }
        }
      }

      /**
       * save/copy/rename/remove
       */
      async function handleFilterOperation(type, filter, index) {
        if (type == 'copy') {
          //filter.emitChange = type;
          let metaData = {
            conditionType: filter.conditionType,
            id: filter.id
          }
          //update-begin---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：保存数据兼容新老数据---
          let conditions = filter.conditions;
          if(Array.isArray(conditions) && conditions.length>0){
            metaData['conditions'] = conditions;
          }else{
            metaData['conditionsGroup'] = filter.conditionsGroup;
          }
          //update-end---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：保存数据兼容新老数据---
          copyInfo(index, metaData);
        } else if (type == 'remove') {
          let arr = filterList.value;
          let selected = arr[index].selected;
          await removeSuperQuery(filter.id);
          arr.splice(index, 1);
          filterList.value = arr;
          if (selected === true) {
            execFilter();
          }
          cacheFilter();
        } else if (type == 'rename') {
          waitSaveFilterInfo = { index, title: filter.title };
          nameModal.visible = true;
          nameModal.filterName = filter.title;
          nameModal.type = 'rename';
        } else if (type == 'edit') {
          let temp = {
            index,
            ...toRaw(filter)
          };
          isEditPage.value = true;
          editFilterInfo.value = temp;
        }
        filter.iconVisible = false
      }

      function saveInfo(index, data) {
        let arr = filterList.value;
        let filter = arr[index]
        filter.emitChange = '';
        filter.conditions = data.conditions;
        filter.conditionType = data.conditionType;
        filter.title = data.title;
        filter.conditionsGroup = data.conditionsGroup;
        filterList.value = arr;
        if (filter.selected === true) {
          execFilter();
        }
        cacheFilter();
        isEditPage.value = false;
      }
      function copyInfo(index, data) {
        let arr = filterList.value;
        let filter = arr[index]
        filter.emitChange = '';
        waitSaveFilterInfo = data;
        nameModal.visible = true;
        if(data.title){
          nameModal.filterName = data.title;
        }else{
          nameModal.filterName = filter.title + '-复制';
        }
        
        nameModal.type = 'copy';
      }

      function showOperation(index) {
        return activeFilterKey.value == index;
      }

      function getContainer() {
        return document.getElementsByClassName('jee-filter-select-pop')[0];
      }

      function prevent(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      
      function onTabActiveChange(key) {
        console.log('key', key)
        tabActive.value = key;
      }
      const isFirstAdd = ref(true);
      function onAddFilter() {
        isFirstAdd.value = false;
      }
      function getFilterItemClass(filter) {
        let str = 'ant-collapse-header'
        if(filter.selected===true){
          str+=' selected';
        }
        if(filter.iconVisible===true){
          str+=' icon-visible';
        }
        return str;
      }
      
      /*-------------------------编辑-------------------------*/
      const editFilterInfo = ref({});
      const isEditPage = ref(false)
      function editFilterOk(){
        showAdding.value = false;
        isEditPage.value=false;
      }

      
      function emitFilter(conditions, conditionType){
        if (!conditions || conditions.length==0) {
          emit('filter', {
            matchType: 'and',
            superQueryParams: '',
          });
          return;
        }
        let dataArray: any[] = conditions;
        let arr: any[] = [];
        //update-begin---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：兼容新老数据---
        let oldQuery = true;
        let oldQueryItem: any[] = [];
        for (let items of dataArray) {
          let subArr: any[] = [];
          //判断是否有queryItems,如果有说明是新版筛选
          if (items.queryItems) {
            for (const item of items.queryItems) {
              let field = item.field;
              let val = item.val;
              getValByType(val, item);
              subArr.push({
                ...item,
                field,
                val,
              });
            }
            arr.push({
              queryItems: subArr,
              matchType: items.matchType
            });
            oldQuery = false;
          } else {
            let field = items.field;
            let val = items.val;
            getValByType(val, items);
            oldQuery = true;
            oldQueryItem.push({
              ...items,
              field,
              val,
            });
          }
        }
        //如果是旧查询，需要给arr复值
        if(oldQuery){
          arr.push({
            queryItems: oldQueryItem,
            matchType: conditionType
          });
        }
        //update-end---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：兼容新老数据---
        console.log('高级查询条件>>', arr);

        let result = {
          matchType: conditionType,
          superQueryParams: arr,
        };
        emit('filter', result);
      }

      function onlySearch(info){
        const {conditionType} = info;
        let conditions = getConditions(info);
        emitFilter(conditions, conditionType)
        // 设置筛选标题
        if (tabActive.value === '1') {
          if (conditions.length === 0) {
            myClearFilter();
          } else {
            //update-end---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：列表显示数值兼容新老数据---
            let i = 0;
            for (const condition of conditions) {
              if(condition.queryItems && condition.queryItems.length>0){
                i+= condition.queryItems.length;
              }
            }
            if(i == 0){
              i = conditions.length;
            }
            newFilterTitle.value = `${i} 项`;
            //update-end---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：列表显示数值兼容新老数据---
          }
        } else {
          newFilterTitle.value = ''
        }
      }

      /**
       * 根据类型获取value值
       * @param val
       * @param item
       */
      function getValByType(val, item) {
        if (val instanceof Array) {
          val = val.join(',');
        }
        if (val) {
          if (item.type == 'date' || item.type == 'datetime' || item.type === 'year' || item.type === 'month') {
            const toDate = (date) => item.timestamp ? dayjs(date).toDate().getTime() : date;
            if (item.rule === 'range') {
              let dateArray = val.split(',');
              let d1 = toDate(dateArray[0])
              let d2 = toDate(dateArray[1])
              val = d1 + ',' + d2
            } else {
              val = toDate(val)
            }
          }
        }
        return val;
      }

      /**
       * 获取配置信息
       * @param config
       */
      function getConditions(config) {
        let conditions = config.conditions;
        if (Array.isArray(conditions) && conditions.length > 0 && conditions[0].field) {
          return conditions;
        } else {
          return config.conditionsGroup;
        }
      }
      
      return {
        tabActive,
        onTabActiveChange,
        isFirstAdd,
        filterImage,
        onAddFilter,
        getFilterItemClass,
        editFilterInfo,
        isEditPage,
        
        visible,
        handleSelect,
        filterList,
        selectMyCreate,
        mySelfFilter,
        filterTitle,
        myClearFilter,
        showAdding,
        nameModal,
        nameModalTitle,
        handleAdd,
        beforeSaveFiledList,
        handleModalSave,
        nameRules,
        activeFilterKey,
        showOperation,
        handleFilterOperation,
        saveInfo,
        copyInfo,
        nameFormRef,
        getContainer,
        editFilterOk,
        onlySearch
        
      };
    },
  });
</script>

<style lang="less">
  .filter-list {
    .ant-collapse-item {
      &.ant-collapse-item-active {
        .ant-collapse-header {
          background: #fafafa;
        }
        .ant-collapse-content-box {
          padding: 0;
          .inner-content {
            padding-top: 0;
          }
        }
        /* .ant-collapse-header{
                  background: #fafafa !important;
                  color: rgba(0, 0, 0, 0.85) !important;
              }*/
      }
    }
    .ant-collapse-header {
      cursor: pointer;
      padding-left: 16px;
      padding-top: 0px !important;
      padding-bottom: 0px !important;
      margin:0 2px;
      border-radius: 5px;
      display: flex;
      justify-content: space-between;
      .right-operation{
        visibility: hidden;
        margin-right: 16px; 
        height: 38px; 
        line-height: 52px; 
        .anticon-ellipsis{
          font-size: 24px;
          font-weight: bold;
        }
      }
      .header-content {
        width: 100%;
        padding: 8px 0;
      }
      .anticon-check {
        height: 22px;
        line-height: 22px;
        margin-right: 8px;
      }
      .anticon-right {
        padding: 8px;
      }
      &:hover {
        background: rgb(245, 245, 245);
        .right-operation{
          visibility: visible;
          &:hover{
            color: rgb(33, 150, 243) !important;
          }
        }
      }
      
      &.selected {
        background: rgb(229, 243, 254);
        color: rgb(33, 150, 243) !important;
        .anticon-filter{
          color: rgb(33, 150, 243) !important;
        }
      }
      
      &.icon-visible{
        .right-operation{
          visibility: visible;
        }
      }
    }
  }
  .jee-filter-select-pop {
    width: 450px;
    
    .ant-empty-image{
      img{
        margin: 0 auto;
      }
    }
    .ant-popover-title {
      padding-right: 0;
    }
    .pop-title {
      color: #333;
      font-size: 16px;
      line-height: 30px;
      padding: 0 0 0 10px;
      .right-icon {
        display: inline-block;
        width: calc(100% - 40px);
        text-align: right;
        cursor: pointer;
        .anticon-plus {
          padding: 8px 15px;
          &:hover {
            color: #0a8fe9;
          }
        }
      }
    }
    .ant-popover-inner-content {
      max-height: 547px;
      overflow: auto;
      padding: 1px;
      .myself {
        background-color: #fff !important;
        color: #333;
        cursor: pointer;
        font-size: 14px;
        line-height: 36px;
        padding: 0 20px;
        &.selected {
          color: #1e88e5;
        }
        &:hover {
          background-color: #1e88e5 !important;
          color: #fff;
        }
      }
      hr {
        border: none;
        border-top: 1px solid #e0e0e0;
        margin: 6px 0;

        box-sizing: content-box;
        height: 0;
        overflow: visible;
      }
    }
  }

  .jee-filter-select-container {
    height: 39px;
    display: flex;
    line-height: 39px;
    flex-direction: column;
    justify-content: center;
    padding: 0 10px;
    .has-filter {
      padding: 0 10px;
      background-color: #d3eafd;
      border-radius: 4px;
      cursor: pointer;
      height: 28px;
      vertical-align: middle;
      color: #2196f3;
      display: flex;
      > span.anticon-filter {
        line-height: 32px;
        font-size: 13px;
      }
      > span.text {
        font-size: 12px;
        margin-left: 3px;
        line-height: 28px;
      }
      > span.icon {
        margin-left: 6px;
        line-height: 28px;
        font-size: 16px;
        .anticon-close {
          font-size: 13px;
        }
      }
    }
  }

  .filter-select-adding {
    /*background-color: #fafafa;
    border-bottom: 1px solid #e0e0e0;
    padding: 10px 15px 10px 20px;*/
    .title {
      font-size: 14px;
      padding: 4px 0;
    }
  }

  .filter-name-modal {
    top: 100px;
    .ant-modal-header {
      padding: 10px;
    }
    .ant-modal-close-x {
      width: 50px;
      height: 36px;
      line-height: 36px;
    }
    .ant-modal-body {
      height: 75px;
    }
  }
  
  .filter-tab{
    padding: 10px 0;
  }
</style>
