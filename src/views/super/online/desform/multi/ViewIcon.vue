<template>
  <span class="design-view-right-icon">
    <a-dropdown v-model:open="dropdownVisible" :trigger="['click']" overlayClassName="design-view-menu">
      <caret-down-outlined />
      <!--<a @click.prevent><caret-down-outlined /></a>-->
      <template #overlay>
        <a-menu v-if="isLowApp()" ref="menuRef" @click="onClickMenu">
          <template v-if="hasAdminAuth && buttonsAuth.customColumn">
            <a-menu-item key="0" @click.prevent="clickMenu(1)">
              <setting-outlined style="" />
              <span>配置视图</span>
            </a-menu-item>
  
            <a-sub-menu key="sub1" class="design-sub-menu" v-if="hasAdminAuth && buttonsAuth.customColumn">
              <template #title>
                <swap-outlined style=""/>
                <span>更改视图类型</span>
              </template>
              <a-menu-item key="00" @click.prevent="clickMenu(2)">
                <span style="width: 100px; display: inline-block">
                  <table-outlined style="color: #ffa515;  " /> 表格
                </span>
              </a-menu-item>
  
              <a-menu-divider />
              <a-menu-item key="02" @click.prevent="clickMenu(3)"> <sliders-outlined style="color: #4caf50; " /> 看板 </a-menu-item>
  
              <a-menu-divider />
              <a-menu-item key="01" @click.prevent="clickMenu(4)"> <calendar-outlined style="color: #f54081; " /> 日历 </a-menu-item>
            </a-sub-menu>
            <a-menu-divider />
  
            <a-menu-item key="3" @click.prevent="clickMenu(5)" v-if="hasAdminAuth && buttonsAuth.customColumn">
              <copy-outlined style="" />
              <span>复制视图</span>
            </a-menu-item>
          </template>

          
    <!--      <a-menu-item v-if="hasAuth('share_table')" key="19" @click.prevent="clickMenu(19)">
            <share-alt-outlined />
            <span>分享</span>
          </a-menu-item>-->
          
          <a-menu-item v-if="hasViewExport && hasAuth('export_table') && buttonsAuth.export" key="8" @click.prevent="clickMenu(8)">
            <download-outlined />
            <span>导出</span>
          </a-menu-item>
          
          <a-menu-item key="4" @click.prevent="clickMenu(6)" v-if="showDelete && hasAdminAuth && buttonsAuth.customColumn">
            <delete-outlined style=" color: red;" />
            <span style="color: red">删除视图</span>
          </a-menu-item>
        </a-menu>
        
        <a-menu v-else @click="onClickMenu">
          <a-menu-item key="0" @click.prevent="clickMenu(1)" v-if="buttonsAuth.customColumn">
              <setting-outlined style="" />
              <span>配置视图</span>
            </a-menu-item>
          
          <a-menu-item key="9" @click.prevent="clickMenu(9)" v-if="buttonsAuth.import">
            <import-outlined />
            <span>导入</span>
          </a-menu-item>
          
          <a-menu-item key="8" @click.prevent="clickMenu(8)" v-if="buttonsAuth.export">
            <download-outlined />
            <span>导出</span>
          </a-menu-item>
          
          <a-menu-item key="10" @click.prevent="clickMenu(10)" v-if="buttonsAuth.recycleBin">
            <delete-outlined />
            <span>回收站</span>
          </a-menu-item>

          <!-- 全部没有权限之后显示的内容 -->
          <a-menu-item
              v-if="!buttonsAuth.customColumn && !buttonsAuth.import && !buttonsAuth.export && !buttonsAuth.recycleBin"
              key="none"
              disabled
              @click.prevent="clickMenu(10)"
          >
            <StopOutlined/>
            <span style="color: #999999">暂无可用操作</span>
          </a-menu-item>

        </a-menu>
      </template>
    </a-dropdown>
  </span>
</template>

<script lang="ts">
  import { ref, watch, nextTick } from 'vue';
  import {
    PlusOutlined,
    CalendarOutlined,
    SlidersOutlined,
    TableOutlined,
    CaretDownOutlined,
    SettingOutlined,
    SwapOutlined,
    CopyOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ShareAltOutlined,
    ImportOutlined,
    StopOutlined,
  } from '@ant-design/icons-vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useMessage } from "/@/hooks/web/useMessage";
  import { getIsLowAppEnv } from '/@/utils/super/low/lowAppUtils';
  import { useFuncSwitch } from "/@/hooks/jeecg/desform/useFuncSwitch";

  export default {
    name: 'ViewIcon',
    emits: ['config'],
    components: {
      PlusOutlined,
      CalendarOutlined,
      SlidersOutlined,
      TableOutlined,
      CaretDownOutlined,
      SettingOutlined,
      SwapOutlined,
      CopyOutlined,
      DownloadOutlined,
      DeleteOutlined,
      ShareAltOutlined,
      ImportOutlined,
      StopOutlined,
    },
    props: {
      def: propTypes.bool.def(true),
      hasAdminAuth: propTypes.bool.def(false),
      operationAuth: propTypes.object,
      //原系统的按钮权限
      buttonsAuth: propTypes.object,
      // QQYUN-4462【视图】全部不能删除，给个提示 全部视图不支持删除 或直接把删除删除视图不显示
      showDelete: propTypes.bool.def(true),
    },
    setup(props, { emit }) {
      const { createMessage: $message } = useMessage();

      const {getHasFunc} = useFuncSwitch()
      const hasViewExport = getHasFunc('VIEW_EXPORT')

      function clickMenu(flag){
        emit('config', flag)
      }
      
      function hasAuth(key) {
        if(props.hasAdminAuth === true){
          return true
        }
        return props.operationAuth[key]
      }
      
      function isLowApp() {
        return getIsLowAppEnv();
      }

      // update-begin--author:sunjianlei---date:220230420---for：【QQYUN-4617】视图没有其他权限时，可不显示下拉框
      const menuRef = ref()
      const dropdownVisible = ref(false)
      // 监听下拉框打开状态
      watch(dropdownVisible, async (visible) => {
        if (visible) {
          // 判断是否有可视的菜单
          if (!menuRef.value) {
            await nextTick()
          }
          const menuNode = menuRef.value?.$el
          // 无可视菜单时，关闭下拉框
          if (menuNode && menuNode.childElementCount === 0) {
            $message.warn('无更多操作！')
            dropdownVisible.value = false
          }
        }
      }, { immediate: true })

      function onClickMenu() {
        // 【QQYUN-5401】【应用】点击导出弹窗没有消失
        dropdownVisible.value = false
      }
      // update-end--author:sunjianlei---date:220230420---for：【QQYUN-4617】视图没有其他权限时，可不显示下拉框

      return {
        menuRef,
        dropdownVisible,

        clickMenu,
        isLowApp,
        hasViewExport,
        hasAuth,
        onClickMenu,
      }

    },
  };
</script>

<style lang="less">
  .design-view-right-icon{
    .anticon-caret-down{
      padding: 10px;
      margin-right: 0;
    }
  }

  .design-view-menu{
    min-width: 140px !important;
    .ant-dropdown-menu-title-content{
      font-size: 13px;
      color: #333;
      .anticon{
        margin-right: 10px;
        color: #9e9e9e;
      }
    }
    .ant-dropdown-menu-submenu{
      width: 110px;
    }
    .design-sub-menu{
      width: 150px;
    }
  }
</style>

