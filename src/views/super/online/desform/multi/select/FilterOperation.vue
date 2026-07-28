<template>
  <span style="margin-left: 10px">
    <a-dropdown v-model:open="visible" :trigger="['click']" :overlayStyle="{ width: '130px' }" overlayClassName="filter-opts">
      <EllipsisOutlined @click="clickPrevent" />
      <!--<a @click.prevent><caret-down-outlined /></a>-->
      <template #overlay>
        <a-menu>
<!--          <a-menu-item key="1" @click.prevent="clickMenu('save')">
            <SaveOutlined style="font-size: 14px; margin-right: 7px" />
            <span>保存</span>
          </a-menu-item>-->
          
          <a-menu-item key="5" @click.prevent="clickMenu('edit')">
            <SettingOutlined style="font-size: 14px; margin-right: 7px" />
            <span>编辑</span>
          </a-menu-item>

          <a-menu-item key="2" @click.prevent="clickMenu('copy')">
            <CopyOutlined style="font-size: 14px; margin-right: 7px" />
            <span>复制</span>
          </a-menu-item>

          <a-menu-item key="3" @click.prevent="clickMenu('rename')">
            <EditOutlined style="font-size: 14px; margin-right: 7px" />
            <span>重命名</span>
          </a-menu-item>

          <a-menu-divider />
          <a-menu-item key="4" @click.prevent="clickMenu('remove')">
            <delete-outlined style="font-size: 14px; margin-right: 7px" />
            <span>删除</span>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </span>
</template>

<script lang="ts">
  import {
    EllipsisOutlined,
    SaveOutlined,
    CopyOutlined,
    EditOutlined,
    PlusOutlined,
    CalendarOutlined,
    SlidersOutlined,
    TableOutlined,
    CaretDownOutlined,
    SettingOutlined,
    SwapOutlined,
    DeleteOutlined,
  } from '@ant-design/icons-vue';
  import { propTypes } from '/@/utils/propTypes';
  import {ref, toRaw, watch} from 'vue'

  export default {
    name: 'FilterOperation',
    emits: ['opt', 'icon-visible'],
    components: {
      EllipsisOutlined,
      SaveOutlined,
      CopyOutlined,
      EditOutlined,

      PlusOutlined,
      CalendarOutlined,
      SlidersOutlined,
      TableOutlined,
      CaretDownOutlined,
      SettingOutlined,
      SwapOutlined,

      DeleteOutlined,
    },
    props: {
      def: propTypes.bool.def(true),
    },
    setup(_props, { emit }) {
      function clickMenu(flag) {
        visible.value = false;
        emit('opt', flag);
      }

      function clickPrevent(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const visible = ref(false);
      watch(visible, ()=>{
        let status = toRaw(visible.value);
        emit('icon-visible', status)
      });

      return { clickMenu, clickPrevent, visible };
    },
  };
</script>

<style lang="less">
  .filter-opts {
    .ant-dropdown-menu-item-active {
      background: #0a8fe9;
      color: #fff;
    }
  }
</style>
