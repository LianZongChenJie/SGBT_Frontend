<template>
  <BasicModal v-bind="$attrs" @register="register" :title="title" defaultFullscreen :showCancelBtn="false" :showOkBtn="false">
    <processDetail :processData="processData" @closeModelhandle="closeModelhandle" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import processDetail from './processDetail/index.vue';
  const emit = defineEmits(['save', 'register']);
  const processData = ref();
  const title = ref('');
  const [register, { closeModal }] = useModalInner((data) => {
    title.value = data?.title;
    processData.value = data;
  });
  const closeModelhandle = () => {
    closeModal();
    emit('save');
  };
</script>
