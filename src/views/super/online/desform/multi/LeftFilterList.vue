<template>
  <div style="padding-top: 10px" :class="expandLeft ? 'tree-div-expand' : 'tree-div-unexpand'">
    <div class="left-top-search" v-if="expandLeft">
      <div>
        <a-input-search v-model:value="treeKeyWord" placeholder="输入后回车搜索" class="myinput" @search="onSearch">
          <!--  <template #prefix>
            <search-outlined style="color: #c0c0c0" />
          </template>-->
        </a-input-search>
      </div>
      <div class="icon-div">
        <double-left-outlined @click.prevent="onChange(false)" title="折叠" />
      </div>
    </div>
    <div class="left-tree-content" :style="{ height: listHeight + 'px' }" v-if="expandLeft">
      <a-tree v-if="isTree" :tree-data="treeData" :load-data="asyncLoadTreeData" @select="onSelectTree" />

      <a-list v-else :data-source="dataList">
        <template #renderItem="{ item }">
          <a-list-item v-if="showListItem(item)" @click="(e) => handleSelectItem(e, item)" :class="item.value == activeValue ? 'active' : ''">
            <div>{{ item.text }}</div>
            <div>{{ item.count || '' }}</div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div class="left-top-search" v-else>
      <div class="icon-div">
        <double-right-outlined @click.prevent="onChange(true)" title="展开" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { ref, computed, watch, unref, reactive } from 'vue';
  import { SearchOutlined, DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue';
  import { initDictOptions } from '/@/utils/dict/index';
  import { defHttp } from '/@/utils/http/axios';

  interface LeftFilterOptions {
    //筛选字段
    field: string;
    // 模式: all,part,exist
    mode: string;
    // 字典编码
    dictTable?: string;
    dictCode?: string;
    dictText?: string;
    partValue?: string[];
  }

  const treeUrl = '/sys/dict/loadTreeData';

  export default {
    name: 'LeftFilterList',
    components: {
      SearchOutlined,
      DoubleLeftOutlined,
      DoubleRightOutlined,
    },
    props: {
      //展开状态
      status: {
        type: Boolean,
        default: true,
      },
      options: {
        type: Object,
        default: () => {},
      },
      //新增配置
      dynamicConfig: {
        type: Object,
        default: () => {},
      },
      isLowApp: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['expand', 'load'],
    setup(props, { emit }) {
      const expandLeft = ref(true);
      const treeKeyWord = ref('');
      const isTree = ref(false);
      const treeModel = reactive({
        table: '',
        label: '',
        store: '',
        idField: '',
        pidField: '',
        conditionField: '',
        pidValue: '',
      });
      //树形下拉数据
      const treeData = ref<any[]>([]);

      watch(
        () => props.status,
        (flag) => {
          expandLeft.value = flag;
        },
        { immediate: true }
      );

      function onChange(flag) {
        emit('expand', flag);
      }

      const dataList = ref<any[]>([]);
      watch(
        () => props.dynamicConfig,
        async (config) => {
          if (config) {
            if (config.treeModel && config.treeModel.table) {
              //树
              Object.keys(config.treeModel).map((k) => {
                treeModel[k] = config.treeModel[k];
              });
              await getTreeRootData();
              isTree.value = true;
            } else {
              // 列表
              getListData(config);
              isTree.value = false;
            }
          }
        },
        { immediate: true, deep: true }
      );

      function getListData(config) {
        if (config.dictCountList && config.dictCountList.length > 0) {
          //左侧列表数据
          let arr: any[] = [
            {
              value: '',
              text: '全部',
              count: props.dynamicConfig.total,
            },
          ];
          for(let item of config.dictCountList){
            if(item.value){
              arr.push({...item});
            }
          }
          dataList.value = arr;
        }
      }

      function getTreeDataParams() {
        let params = {
          pidField: treeModel.pidField,
          tableName: treeModel.table,
          text: treeModel.label,
          code: treeModel.store,
          hasChildField: '1',
        };
        return params;
      }

      async function getTreeRootData(hasCondition) {
        let params = getTreeDataParams();
        params['pid'] = treeModel.pidValue;
        if (hasCondition === true) {
          params['condition'] = JSON.stringify({
            [treeModel.label]: treeKeyWord.value,
          });
        } else {
          params['condition'] = '{}';
        }

        /*  params['condition'] = JSON.stringify({
          [treeModel.conditionField]: treeModel.conditionValue
        })*/
        let res = await defHttp.get({ url: treeUrl, params }, { isTransformResponse: false });
        if (res.success && res.result) {
          for (let i of res.result) {
            i.value = i.key;
            i.isLeaf = !!i.leaf;
          }
          treeData.value = [...res.result];
        } else {
          console.log('根节点查询结果异常', res);
        }
      }

      /**
       * 异步加载数据
       */
      async function asyncLoadTreeData(treeNode) {
        if (treeNode.dataRef.children) {
          return Promise.resolve();
        }
        let pid = treeNode.dataRef.key;
        let params = getTreeDataParams();
        params['pid'] = pid;
        params['condition'] = '{}';
        let res = await defHttp.get({ url: treeUrl, params }, { isTransformResponse: false });
        if (res.success) {
          for (let i of res.result) {
            i.value = i.key;
            i.isLeaf = !!i.leaf;
          }
          //添加子节点
          addChildren(pid, res.result, treeData.value);
          treeData.value = [...treeData.value];
        }
        return Promise.resolve();
      }

      /**
       * 加载子节点
       */
      function addChildren(pid, children, treeArray) {
        if (treeArray && treeArray.length > 0) {
          for (let item of treeArray) {
            if (item.key == pid) {
              if (!children || children.length == 0) {
                item.isLeaf = true;
              } else {
                item.children = children;
              }
              break;
            } else {
              addChildren(pid, children, item.children);
            }
          }
        }
      }

      const listHeight = ref();
      // update-begin--author:liaozhiyang---date:20240531---for：【TV360X-672】当有筛选列表时小屏幕上会右侧出现滚动条
      listHeight.value = window.innerHeight - (props.isLowApp ? 220 : 240);
      // update-end--author:liaozhiyang---date:20240531---for：【TV360X-672】当有筛选列表时小屏幕上会右侧出现滚动条
      const activeValue = ref('');
      function handleSelectItem(e, item) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        activeValue.value = item.value;
        emit('load', item.value);
      }

      function showListItem(item) {
        if (item.value === '') {
          return true;
        }
        let temp = treeKeyWord.value;
        return item.text.indexOf(temp) >= 0;
      }

      function onSelectTree(arr) {
        emit('load', arr[0]);
      }

      function onSearch(value) {
        treeData.value = [];
        if (value) {
          getTreeRootData(true);
        } else {
          getTreeRootData(false);
        }
      }

      return {
        expandLeft,
        treeKeyWord,
        onChange,
        listHeight,
        handleSelectItem,
        dataList,
        activeValue,
        showListItem,

        isTree,
        treeData,
        getTreeRootData,
        asyncLoadTreeData,
        onSelectTree,
        onSearch,
      };
    },
  };
</script>

<style lang="less">
  .tree-div-unexpand {
    width: 30px;
    border-right: 1px solid #eee;
  }
  .tree-div-expand {
    width: 220px;
    border-right: 1px solid #eee;
    .myinput {
      width: 190px;
    }
  }
  .left-top-search {
    display: flex;
    flex-direction: row;
    .icon-div {
      height: 32px;
      line-height: 32px;
      cursor: pointer;
      margin: 0 5px;
      font-size: 16px;
      color: #c0c0c0;
      &:hover {
        color: #0a8fe9;
      }
    }
  }

  .left-tree-content {
    overflow-y: auto;
    margin-top: 5px;
    .ant-list-item {
      justify-content: space-between;
      padding: 5px 5px;
      margin-right: 2px;
      cursor: pointer;
      &:hover {
        background-color: #f5f5f5;
      }
      &.active {
        background-color: #0a8fe9;
        color: #fff;
      }
    }
  }
</style>
