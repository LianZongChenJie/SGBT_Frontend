<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" showFooter :width="adaptiveWidth" :title="title" @ok="handleSubmit" @close="handleSubmit">
    <div>
      <audio :src="callRecordUrl" controls></audio>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  import { getCallRecord } from './api';
  const callRecordUrl = ref('');
  const title = ref('通话记录');
  const { adaptiveWidth } = useDrawerAdaptiveWidth();
  const [registerDrawer, { closeDrawer }] = useDrawerInner(async (data) => {
    await getCallRecordHandle(data.record.id);
    title.value = data.record.callNo + '通话录音';
  });
  function getCallRecordHandle(id) {
    getCallRecord({
      id: id,
    }).then((res) => {
      callRecordUrl.value = res.recordingUrl;
      console.log(callRecordUrl.value);
    });
  }
  function handleSubmit() {
    closeDrawer();
    // 播放器停止播放后，重置数据
    const audio = document.querySelector('audio');
    console.log(audio);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    callRecordUrl.value = '';
    title.value = '通话记录';
  }
</script>
