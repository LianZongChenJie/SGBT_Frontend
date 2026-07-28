<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" :gutter="10" style="max-height: 800px" type="flex">
    <a-col :lg="24" :md="24" :xl="4" style="margin-bottom: 10px">
      <DepartLeftTree @select="onTreeSelect" />
    </a-col>
    <a-col :lg="24" :md="24" :xl="20" style="margin-bottom: 10px">
      <div class="address-book" style="height: 100%">
        <BasicTable @register="registerTable" style="padding: 0" />
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { provide, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import DepartLeftTree from './components/DepartLeftTree.vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { columns, searchFormSchema } from './demo.data';
  import { getDemoList } from './demo.api';

  const { prefixCls } = useDesign('address-list');
  provide('prefixCls', prefixCls);

  const orgCode = ref('0');
  const [registerTable, { reload }] = useTable({
    title: '',
    api: getDemoList,
    columns,
    formConfig: {
      labelWidth: 72,
      schemas: searchFormSchema,
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: true,
    rowKey: 'id',
  });

  function onTreeSelect(data) {
    orgCode.value = data.id;
    reload({
      searchInfo: {
        deviceTypeId: orgCode.value,
      },
    });
  }
</script>

<style lang="less">
  @import './index.less';
</style>
