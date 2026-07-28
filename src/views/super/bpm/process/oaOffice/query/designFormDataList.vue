<template>
  <div :class="['p-4']">
    <DesignFormDataTable v-if="showListTable" :queryDesformCode="data.desformCode" :customButtonsAuth="data.buttonsAuth">
      <template #buttonBefore>
        <span style="color: #060606">请选择工单： </span>
        <a-select
          v-model:value="data.desformCode"
          class="search-input"
          showSearch
          :showArrow="false"
          :options="data.desFormOptions"
          placeholder="搜索表单"
          optionFilterProp="text"
          :filterOption="filterOption"
          @change="onDesformChange"
        >
        </a-select>
      </template>
    </DesignFormDataTable>
  </div>
</template>

<script lang="ts" setup>
  import { initDictOptions } from '/@/utils/dict/index';
  import { nextTick, reactive, computed } from 'vue';
  import DesignFormDataTable from './components/DesignFormDataTable.vue';

  const data = reactive({
    reloading: false,
    desformCode: '',
    desFormOptions: [],
    buttonsAuth: {
      detail: true,
      superQuery: true,
      customColumn: true,
    },
  });
  /*初始化字典*/
  initDictConfig();
  /*是否显示列表*/
  const showListTable = computed(() => {
    return data.desformCode && !data.reloading;
  });
  //初始化字典 - 表单数据
  async function initDictConfig() {
    let result = await initDictOptions('design_form,desform_name,desform_code,desform_type=1');
    if (result) {
      data.desFormOptions = result;
      let code = data.desFormOptions[0].value;
      onDesformChange(code);
    }
  }
  // 刷新表格
  async function reload() {
    data.reloading = true;
    await nextTick();
    data.reloading = false;
    await nextTick();
  }
  /*表单切换*/
  function onDesformChange(code) {
    data.desformCode = code;
    reload();
  }
  /*是否根据输入项进行筛选*/
  function filterOption(inputValue, option) {
    return option.text.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  }
</script>
<style lang="less" scoped>
  .table-operator .search-input {
    width: 180px;
    margin-right: 8px;
  }
</style>
