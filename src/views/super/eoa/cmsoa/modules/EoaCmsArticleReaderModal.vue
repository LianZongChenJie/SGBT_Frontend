<template>
  <BasicModal v-bind="$attrs" :width="800" title="阅读情况" v-model:visible="visible">
    <BasicTable @register="registerTable" />
    <template #footer>
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>
  </BasicModal>
</template>

<script lang="ts">
  import { ref, unref, defineComponent } from 'vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { BasicTable } from '/@/components/Table';
  import { readList } from '../cmsoa.api';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

  export default defineComponent({
    components: {
      BasicModal: createAsyncComponent(() => import('/@/components/Modal/src/BasicModal.vue')),
      BasicTable,
    },
    setup() {
      const visible = ref(false);
      const articleId = ref('');

      // 列表页面公共参数、方法
      const { tableContext } = useListPage({
        tableProps: {
          api: readList,
          columns: [
            {
              title: '阅读人',
              dataIndex: 'userId_dictText',
              align: 'center',
            },
            {
              title: '阅读次数',
              dataIndex: 'readTimes',
              align: 'center',
            },
          ],
          size: 'small',
          useSearchForm: false,
          showTableSetting: false,
          canResize: false,
          beforeFetch: (params) => {
            return Object.assign(params, { articleId: unref(articleId) });
          },
          actionColumn: null,
        },
      });

      //注册table数据
      const [registerTable, {reload}] = tableContext;

      function show(item) {
        articleId.value = item.id;
        // update-begin--author:liaozhiyang---date:20240628---for：【TV360X-1543】企业门户预览次数展示错误
        reload();
        // update-end--author:liaozhiyang---date:20240628---for：【TV360X-1543】企业门户预览次数展示错误
        visible.value = true;
      }
      const handleCancel = () => {
        visible.value = false;
      };
      return {
        visible,
        registerTable,
        show,
        handleCancel,
      };
    },
  });
</script>
<style></style>
