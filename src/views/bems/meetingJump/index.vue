<template>
  <div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTokenApi } from './Standardized.api'
import { useRouter } from 'vue-router';

const router = useRouter();

const token = ref('')

// 获取token
const getToken = async () => {
 let res = await getTokenApi()
  console.log('meeting jump------res---------->', res);
  token.value = res
}

onMounted(async () => {
  console.log('meeting jump---------------->');
  await getToken()
    window.open(`http://120.246.120.94:8088/meeting/ssoLogin?token=${token.value}`, '_blank')
    // 返回上一个历史记录
  router.back();
})
</script>

<style scoped>

</style>