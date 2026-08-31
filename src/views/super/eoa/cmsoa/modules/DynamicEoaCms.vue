<template>
  <component :is="currentComponent" :formData="formData" v-if="currentComponent"></component>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import EoaCmsBanner from './EoaCmsBanner.vue';
  import EoaCmsLink from './EoaCmsLink.vue';
  import EoaCmsNewsInfo from './EoaCmsNewsInfo.vue';
  import EoaCmsPlan from './EoaCmsPlan.vue';
  import EoaCmsRuleInfo from './EoaCmsRuleInfo.vue';
  import EoaCmsSignNews from './EoaCmsSignNews.vue';
  import EoaCmsUserNotice from './EoaCmsUserNotice.vue';

  const props = defineProps(['path', 'formData']);

  const currentComponent = computed(() => {
    const componentType = {
      EoaCmsBanner: EoaCmsBanner,
      EoaCmsLink: EoaCmsLink,
      EoaCmsNewsInfo: EoaCmsNewsInfo,
      EoaCmsPlan: EoaCmsPlan,
      EoaCmsRuleInfo: EoaCmsRuleInfo,
      EoaCmsSignNews: EoaCmsSignNews,
      EoaCmsUserNotice: EoaCmsUserNotice,
    };
    return componentType[props.path];
  });
</script>

<style scoped></style>
