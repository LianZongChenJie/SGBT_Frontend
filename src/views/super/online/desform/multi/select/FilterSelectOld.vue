<template>
  <div class="jee-filter-select-container">
    <a-popover v-model:open="visible" placement="bottomLeft" trigger="click" overlayClassName="jee-filter-select-pop">
      <template #title>
        <div class="pop-title">
          筛选
          <span class="right-icon">
            <PlusOutlined v-if="!showAdding" title="添加" @click="handleAdd" />
          </span>
        </div>
      </template>
      <template #content>
        <!-- 正在添加的数据 -->
        <div class="ant-modal-content"></div>
        <div class="inner-content filter-select-adding" v-if="showAdding">
          <div class="title">自定义筛选</div>
          <FilterFiledList :columnList="columnList" @save="beforeSaveFiledList" :clear="showAdding" />
        </div>

        <div :class="mySelfFilter.selected ? 'myself selected' : 'myself'" @click="selectMyCreate">
          <CheckOutlined v-if="mySelfFilter.selected" style="margin-right: 8px" />
          <span>我创建的</span>
        </div>

        <template v-if="filterList && filterList.length > 0">
          <hr />
          <div style="color: #9e9e9e; font-size: 12px; padding: 6px 20px"> 我的筛选 </div>
          <a-collapse v-model:activeKey="activeFilterKey" expand-icon-position="right" ghost accordion class="filter-list">
            <a-collapse-panel v-for="(filter, index) in filterList" :key="index">
              <template #header>
                <div :class="filter.selected ? 'header-content selected' : 'header-content'" @click="(e) => handleSelect(e, filter)">
                  <CheckOutlined v-if="filter.selected" />
                  <span>{{ filter.title }}</span>
                </div>
              </template>

              <template #extra>
                <div v-if="showOperation(index)" style="margin-right: 10px; height: 38px; line-height: 38px; font-size: 18px">
                  <FilterOperation @opt="(type) => handleFilterOperation(type, filter, index)" />
                </div>
              </template>

              <div class="inner-content filter-select-adding" style="padding-top: 1px">
                <FilterFiledList
                  :columnList="columnList"
                  @save="(data) => saveInfo(filter, data)"
                  @copy="(data) => copyInfo(filter, data)"
                  :info="filter"
                  :saveButton="false"
                />
              </div>
            </a-collapse-panel>
          </a-collapse>
        </template>
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
  import { computed, defineComponent, reactive, ref, toRaw } from 'vue';
  import { FilterOutlined, PlusOutlined, CheckOutlined, CloseOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
  import { createLocalStorage } from '/@/utils/cache';
  import { useRoute } from 'vue-router';
  import FilterFiledList from './FilterFiledList.vue';
  import { useUserStore } from '/@/store/modules/user';
  import FilterOperation from './FilterOperation.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs from 'dayjs';

  interface FilterInfo {
    selected?: boolean;
    title?: string;
    content?: string;
    conditionType?: string;
    conditions?: QueryField[];
    isMyself?: boolean;
    emitChange?: string;
    index?: number;
  }

  interface QueryField {
    field?: string;
    rule?: string;
    val?: string;
    type?: string;
    dbType?: string;
  }

  // 查询条件存储编码前缀
  const SAVE_CODE_PRE = 'JSuperFilter_';

  export default defineComponent({
    name: 'FilterSelect',
    components: {
      FilterOutlined,
      PlusOutlined,
      CheckOutlined,
      CloseOutlined,
      EllipsisOutlined,
      FilterFiledList,
      FilterOperation,
    },
    props: {
      // 表单设计器默认的列
      columnList: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['selected', 'filter'],
    setup(_props, { emit }) {
      const visible = ref(false);
      // 筛选记录
      const filterList = ref<FilterInfo[]>([]);
      const activeFilterKey = ref('-1');
      const { userInfo } = useUserStore();

      // 我创建的
      const mySelfFilter = reactive({
        selected: false,
      });
      // 筛选条件的标题
      const filterTitle = computed(() => {
        if (mySelfFilter.selected === true) {
          return '我创建的';
        } else {
          let arr = filterList.value.filter((item) => item.selected === true);
          if (arr.length > 0) {
            return arr[0].title;
          }
        }
        return '';
      });

      // 本地缓存
      const $ls = createLocalStorage();
      const route = useRoute();
      // 缓存编码
      const cacheCode = SAVE_CODE_PRE + route.fullPath;
      // 从本地缓存中获取数据
      function initListFromCache() {
        let list = $ls.get(cacheCode);
        if (list && list instanceof Array) {
          let arr: FilterInfo[] = [];
          for (let item of list) {
            if (item.isMyself === true) {
              mySelfFilter.selected = item.selected;
            } else {
              arr.push({
                ...item,
              });
            }
          }
          filterList.value = arr;
        }
      }
      initListFromCache();

      /**
       * 点击选中tab,执行该tab下的查询条件
       */
      function handleSelect(e, filter) {
        e && prevent(e);
        mySelfFilter.selected = false;
        let arr = filterList.value;
        for (let item of arr) {
          item.selected = false;
          if (item.title == filter.title) {
            item.selected = true;
          }
        }
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
      function myClearFilter(e) {
        clearFilter(e);
        execFilter();
        cacheFilter();
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
      function handleModalSave() {
        let formRef = nameFormRef.value;
        formRef.validate().then(() => {
          if (nameModal.type == 'save') {
            clearFilter();
            let arr = filterList.value;
            let temp = {
              selected: true,
              title: nameModal.filterName,
              conditionType: waitSaveFilterInfo.conditionType,
              conditions: waitSaveFilterInfo.conditions,
              isMyself: false,
            };
            arr.push(temp);
            filterList.value = arr;
            // 新增保存之后立即执行查询
            execFilter();
            showAdding.value = false;
          } else if (nameModal.type == 'copy') {
            let arr = filterList.value;
            let temp = {
              selected: false,
              title: nameModal.filterName,
              conditionType: waitSaveFilterInfo.conditionType,
              conditions: waitSaveFilterInfo.conditions,
              isMyself: false,
            };
            arr.push(temp);
            filterList.value = arr;
          } else if (nameModal.type == 'rename') {
            let arr = filterList.value;
            for (let item of arr) {
              if (item.title == waitSaveFilterInfo.title) {
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

      /**
       * 将查询信息保存
       */
      function cacheFilter() {
        let arr = toRaw(filterList.value);
        if (mySelfFilter.selected === true) {
          arr.push({
            selected: true,
            isMyself: true,
          });
        }
        $ls.set(cacheCode, arr);
      }

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
            superQueryParams: encodeURI(JSON.stringify(arr)),
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
            if (temp[0].isMyself === true) {
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
                superQueryParams: encodeURI(JSON.stringify(arr)),
              };
              emit('filter', result);
            } else {
              if (!temp[0].conditions) {
                return;
              }
              let dataArray: any[] = temp[0].conditions;
              let arr: any[] = [];
              for (let item of dataArray) {
                let field = item.field;
                let val = item.val;
                if (val instanceof Array) {
                  val = val.join(',');
                }
                if (item.type == 'date' || item.type == 'datetime') {
                  if (val) {
                    val = dayjs(val).toDate().getTime();
                  }
                }
                arr.push({
                  ...item,
                  field,
                  val,
                });
              }
              console.log('查询条件', arr);

              let result = {
                matchType: temp[0].conditionType,
                superQueryParams: encodeURI(JSON.stringify(arr)),
              };
              emit('filter', result);
            }
          }
        }
      }

      /**
       * save/copy/rename/remove
       */
      function handleFilterOperation(type, filter, index) {
        if (type == 'save' || type == 'copy') {
          filter.emitChange = type;
        } else if (type == 'remove') {
          let arr = filterList.value;
          let selected = arr[index].selected;
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
        }
      }

      function saveInfo(filter, data) {
        filter.emitChange = '';
        filter.conditions = data.conditions;
        filter.conditionType = data.conditionType;
        if (filter.selected === true) {
          execFilter();
        }
        cacheFilter();
      }
      function copyInfo(filter, data) {
        filter.emitChange = '';
        waitSaveFilterInfo = data;
        nameModal.visible = true;
        nameModal.filterName = filter.title + '-复制';
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
      return {
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
      padding-top: 0px !important;
      padding-bottom: 0px !important;
      .header-content {
        width: 100%;
        padding: 8px 0;
        &.selected {
          color: #1e88e5;
        }
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
        color: #fff !important;
        background-color: #1e88e5 !important;
        .selected {
          color: #fff;
        }
      }
    }
  }
  .jee-filter-select-pop {
    width: 400px;
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
        line-height: 24px;
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
          font-size: 15px;
        }
      }
    }
  }

  .filter-select-adding {
    background-color: #fafafa;
    border-bottom: 1px solid #e0e0e0;
    padding: 10px 15px 10px 20px;
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
</style>
