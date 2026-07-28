<template>
  <div> </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { getToken } from './api';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const token = ref('');

  // 获取token
  const getTokenHandle = async () => {
    let res = await getToken();
    console.log('meeting jump------res---------->', res);
    token.value = res;
  };

  onMounted(async () => {
    console.log('meeting jump---------------->');
    await getTokenHandle();
    window.open(token.value, '_blank');
    // 返回上一个历史记录
    router.back();
  });
</script>

<style scoped></style>
