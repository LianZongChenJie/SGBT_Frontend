<template>
  <BasicDrawer v-bind="getProps">
    <a-tabs>
      <a-tab-pane tab="数据权限" key="data" forceRender>
        <DataAuthTab :visible="getVisible" :desformRecord="model" />
      </a-tab-pane>
      <a-tab-pane tab="按钮权限" key="button" forceRender>
        <ButtonAuthTab :visible="getVisible" :desformRecord="model" />
      </a-tab-pane>
      <a-tab-pane tab="字段权限" key="field" forceRender>
        <FieldAuthTab :visible="getVisible" :desformRecord="model" />
      </a-tab-pane>
    </a-tabs>
  </BasicDrawer>
</template>

<script lang="ts">
  import type { DrawerProps } from '/@/components/Drawer';
  import { ref, defineComponent, computed, unref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import DataAuthTab from './components/data/DataAuthTab.vue';
  import ButtonAuthTab from './components/button/ButtonAuthTab.vue';
  import FieldAuthTab from './components/field/FieldAuthTab.vue';

  export default defineComponent({
    name: 'DesformAuthDrawer',
    components: {
      BasicDrawer,
      DataAuthTab,
      ButtonAuthTab,
      FieldAuthTab,
    },
    emits: ['register'],
    setup(props) {
      const attrs = useAttrs();
      // 表单model
      const model = ref<Recordable>();
      // 是否是更新模式
      const isUpdate = ref(false);
      // 弹窗标题
      const title = computed(() => (isUpdate.value ? '编辑' : '新增'));
      // 注册弹窗
      const [registerDrawer, { closeDrawer, getVisible }] = useDrawerInner(open);

      // 弹窗最终props
      const getProps = computed(() => {
        let drawerProps: Partial<DrawerProps> = {
          width: 800,
          title: unref(title),
        };
        let finalProps: Recordable = {
          ...unref(attrs),
          ...drawerProps,
          ...props,
          onOk: close,
          onCancel: close,
          onRegister: registerDrawer,
        };
        return finalProps;
      });

      /** 弹窗开启 */
      function open(data) {
        model.value = data?.record;
      }

      /** 弹窗关闭 */
      function close() {
        closeDrawer();
      }

      return {
        getProps,
        model,
        getVisible,
      };
    },
  });
</script>

<style scoped lang="less">
  :deep(.@{namespace}-basic-table-form-container){
    padding: 0;
  }
</style>
