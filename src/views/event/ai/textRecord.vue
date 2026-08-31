<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" showFooter :width="adaptiveWidth" :title="title" @ok="handleSubmit">
    <ul>
      <li v-for="(item, index) in textRecord" :key="index">{{ item.callee ? 'callee： ' + item.callee : 'caller: ' + item.caller }}</li>
    </ul>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  import { getTextRecord } from './api';
  // 声明Emits
  const { adaptiveWidth } = useDrawerAdaptiveWidth();
  const textRecord = ref<{ callee?: string; caller?: string }[]>([]);
  const title = ref('');
  const [registerDrawer, { closeDrawer }] = useDrawerInner(async (data) => {
    await getTextRecordDetail(data.record.id);
    title.value = data.record.callNo + '文字记录';
  });
  function getTextRecordDetail(id) {
    getTextRecord({ id: id }).then((res) => {
      textRecord.value = res.messages;
      console.log(textRecord.value);
    });
  }
  function handleSubmit() {
    closeDrawer();
  }
</script>
