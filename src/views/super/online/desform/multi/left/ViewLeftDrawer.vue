<template>
  <a-drawer
    placement="left"
    :closable="false"
    maskClosable
    :width="280"
    :getContainer="getContainer"
    rootClassName="low-app-view-left-drawer"
    :open="visible"
    @close="onClose"
    :destroyOnClose="true"
    :rootStyle="drawerStyle"
  >
    <template #title> </template>
    <div style="height: 100%; overflow-y: hidden">
      <div class="search-div">
        <a-input :placeholder="viewList.length + '个视图'" class="my-input" v-model:value="filterValue">
          <template #prefix>
            <search-outlined style="color: #c0c0c0; font-size: 18px; margin-right: 5px" />
          </template>
        </a-input>
      </div>
      <div class="views-div">
        <draggable item-key="id" animation="300" group="tabView" tag="ul" v-model="viewList" dragClass="dragClass" @end="onDragEnd">
          <template #item="{ element }">
            <li v-if="isShowItem(element)" :class="getViewClass(element)" @click="(e) => onSelect(e, element)">
              <Icon icon="ant-design:holder-outlined" class="hold-icon" />
              <Icon :icon="getViewIcon(element)" :color="getViewIconColor(element)" style="font-size: 20px; margin: 0 7px 0 3px" />

              <span v-if="element.updateStatus" style="margin-right: 5px">
                <a-input v-model:value="element.name" @blur="onChangeViewName(element)" />
              </span>
              <span v-else style="flex: 1" class="ellipsis">
                {{ element.name }}
              </span>

              <a-dropdown v-model:open="element.action" :trigger="['click']" overlayClassName="drawer-view-actions-dropdown">
                <Icon icon="ant-design:ellipsis-outlined" style="font-size: 20px" class="hold-icon" @click.prevent />
                <template #overlay>
                  <a-menu @click="(e) => handleActionClick(e, element)">
                    <a-menu-item key="update">
                      <Icon icon="ant-design:edit-outlined" style="margin-right: 10px" />
                      <span class="label">重命名</span>
                    </a-menu-item>

                    <a-menu-item key="copy">
                      <Icon icon="ant-design:copy-outlined" style="margin-right: 10px" />
                      <span class="label">复制</span>
                    </a-menu-item>

                    <a-menu-divider />

                    <a-menu-item key="delete" class="delete-item">
                      <Icon icon="ant-design:delete-filled" style="margin-right: 10px" />
                      <span class="label">删除</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </li>
          </template>
        </draggable>
      </div>
    </div>
  </a-drawer>
</template>

<script lang="ts">
  import { ref, defineComponent, watch } from 'vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import draggable from 'vuedraggable';
  import { defHttp } from '/@/utils/http/axios';
  import { useWatchDesigner } from "../ts/useWatchDesigner";

  export default defineComponent({
    name: 'ViewLeftDrawer',
    props: {
      routeCode: {
        type: String,
        default: '',
      },
      viewConfigList: {
        type: Array,
        default: () => [],
      },
    },
    components: {
      SearchOutlined,
      draggable,
    },
    emits: ['ok', 'copy', 'delete', 'active', 'close'],
    setup(props, { emit }) {
      const visible = ref(false);
      const activeViewId = ref('');

      const bodyHeight = ref('200px');
      bodyHeight.value = window.innerHeight - 140 + 'px';
      const bodyStyle = {
        height: bodyHeight.value,
      };

      const drawerStyle = ref({
        height: bodyHeight.value,
        zIndex: 1000
      });

      // const zIndex = ref(1000);

      // 监听设计表单弹窗
      useWatchDesigner({ closeDrawer: onClose, getVisible: visible })

      function onClose() {
        visible.value = false;
        setTimeout(() => {
          drawerStyle.value.zIndex = -1;
          emit("close")
        }, 100);
      }

      function open(activeId) {
        visible.value = true;
        activeViewId.value = activeId;
        // update-begin--author:liaozhiyang---date:20231218---for：【QQYUN-6366】升级到antd4.x
        drawerStyle.value.zIndex = 1000;
        // update-end--author:liaozhiyang---date:20231218---for：【QQYUN-6366】升级到antd4.x
      }

      function getContainer() {
        return document.querySelector('#' + props.routeCode);
      }

      const filterValue = ref('');

      const viewList = ref<any[]>([]);
      watch(
        () => props.viewConfigList,
        (list) => {
          console.log('目前的list》》》》》》', list);
          initViewList(list);
        },
        { deep: true, immediate: true }
      );

      function initViewList(list) {
        let arr: any[] = [];
        if (list && list.length > 0) {
          for (let item of list) {
            arr.push({
              id: item.id,
              name: item.name,
              seq: item.seq,
              //base
              type: item.type,
              updateStatus: false,
              action: false,
            });
          }
        }
        arr.sort(function (a, b) {
          return a.seq - b.seq;
        });
        viewList.value = arr;
        /*     viewList.value = [
          {id: 1, name: '第一个视图', seq: 1, type: 'base'},
          {id: 2, name: '你好我是看板', seq: 5, type: 'card'},
          {id: 31, name: '日历视图aaa', seq: 3, type: 'calendar'},
          {id: 4, name: '第2个视图', seq: 1, type: 'base'},
        ]*/
      }

      async function resetOrder() {
        let arr = viewList.value;
        if (arr && arr.length > 0) {
          let list: any[] = [];
          for (let i = 0; i < arr.length; i++) {
            list.push({
              id: arr[i].id,
              seq: i + 1,
            });
          }
          let params = { list };
          const url = '/desform/view/resetOrder';
          await defHttp.post({ url, params });
          emit('ok');
        }
      }

      function onDragEnd() {
        resetOrder();
      }

      function isShowItem(item) {
        if (filterValue.value) {
          return item.name && item.name.indexOf(filterValue.value) >= 0;
        }
        return true;
      }

      function getViewIcon(item) {
        if (item.type === 'base') {
          return 'ant-design:table-outlined';
        } else if (item.type === 'card') {
          return 'ant-design:sliders-outlined';
        } else if (item.type === 'calendar') {
          return 'ant-design:calendar-outlined';
        }
        return '';
      }

      function getViewIconColor(item) {
        if (item.type === 'base') {
          return '#ffa515';
        } else if (item.type === 'card') {
          return '#4caf50';
        } else if (item.type === 'calendar') {
          return '#f54081';
        }
        return '';
      }

      function getViewClass(item) {
        let str = 'view-item';
        if (activeViewId.value == item.id) {
          str += ' active';
        }
        return str;
      }

      function onSelect(e, item) {
        e.preventDefault();
        e.stopPropagation();
        activeViewId.value = item.id;
        emit('active', item.id)
      }

      function handleActionClick(e, item) {
        let key = e.key;
        if (key == 'update') {
          item.updateStatus = true;
        } else if (key == 'copy') {
          emit('copy', { id: item.id });
          close();
        } else if (key == 'delete') {
          emit('delete', { id: item.id });
          close();
        }
        item.action = false;
      }

      async function onChangeViewName(item) {
        console.log('onChangeViewName', item.name);
        const url = '/desform/view/updateViewConfig';
        let params = {
          name: item.name,
          id: item.id,
        };
        await defHttp.put({ url, params });
        item.updateStatus = false;
        emit('ok');
      }

      return {
        visible,
        onClose,
        bodyStyle,
        getContainer,
        open,
        bodyHeight,
        filterValue,
        drawerStyle,
        // zIndex,
        viewList,
        onDragEnd,
        isShowItem,
        getViewIconColor,
        getViewIcon,
        getViewClass,
        onSelect,
        handleActionClick,
        onChangeViewName,
      };
    },
  });
</script>

<style lang="less">
  .low-app-view-left-drawer {
    position: absolute;
    top: 50px;

    &.negative-z-index {
      z-index: -1 !important;
    }

    .ant-drawer-header {
      padding: 0;
    }
    .ant-drawer-body {
      padding: 6px 8px;
    }
    .views-div {
      height: calc(100% - 45px);
      overflow-y: auto;
      & > ul {
        pointer-events: bounding-box;
        list-style-type: none;
        margin: 0;
        padding: 0;
      }

      .view-item {
        align-items: center;
        background-color: #fff;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        font-size: 13px;
        padding: 9px 15px 9px 3px;
        position: relative;
        list-style: none;
        &.active {
          background: #e0f4ff;
        }
        &:hover {
          background: rgba(0, 0, 0, 0.04) !important;
          .hold-icon {
            opacity: 1;
          }
        }

        .ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: top;
          white-space: nowrap;
        }

        .hold-icon {
          opacity: 0;
        }
      }
    }
    .search-div {
      align-items: center;
      color: #333;
      display: flex;
      height: 36px;
      margin-bottom: 6px;
      padding-left: 8px;
      .my-input {
        width: calc(100% - 2px);
        box-shadow: none;
        outline: none !important;
        border: none !important;
        background: none;
        input {
          background: none;
          text-align: left;
        }
      }
    }
  }

  .drawer-view-actions-dropdown {
    width: 180px;
    .ant-dropdown-menu-item {
      padding: 0 12px;
      height: 36px;
      line-height: 36px;
      .anticon {
        color: #9e9e9e;
      }
      &.delete-item {
        color: #f44338;
        .anticon {
          color: #9e9e9e;
        }
        &:hover {
          .anticon {
            color: #f44338;
          }
        }
      }
    }
  }
</style>
