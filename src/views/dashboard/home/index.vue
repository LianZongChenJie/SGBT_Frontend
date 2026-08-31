<template>
  <div class="p-4">
    <title-card :loading="loading" style="margin-bottom: 10px" />
    <a-row :gutter="16">
      <a-col :span="12">
        <my-task :loading="loading" />
      </a-col>
      <a-col :span="12">2</a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import titleCard from './components/TitleCard.vue';
  import myTask from './components/myTask.vue';
  const loading = ref(true);
  setTimeout(() => {
    loading.value = false;
  }, 500);
</script>
