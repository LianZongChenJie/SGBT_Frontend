<template>
  <component :is="currentComponent" :formData="formData" v-if="currentComponent"></component>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import EoaCmsCommUse from './EoaCmsCommUse.vue';
  import EoaCmsMyProcess from './EoaCmsMyProcess.vue';
  import EoaCmsProcessNotice from './EoaCmsProcessNotice.vue';
  import EoaCmsApplyProcess from './EoaCmsApplyProcess.vue';
  import EoaCmsUserNotice from '/@/views/super/eoa/cmsoa/modules/EoaCmsUserNotice.vue';
  import EoaCmsProcessTypeChat from './EoaCmsProcessTypeChat.vue';
  import EoaCmsProcessChatData from './EoaCmsProcessChatData.vue';
  import EoaCmsEmail from './EoaCmsEmail.vue';
  import EoaCmsPlan from '/@/views/super/eoa/cmsoa/modules/EoaCmsPlan.vue';

  const props = defineProps(['path', 'formData']);

  const currentComponent = computed(() => {
    const componentType = {
      EoaCmsCommUse: EoaCmsCommUse,
      EoaCmsMyProcess: EoaCmsMyProcess,
      EoaCmsProcessNotice: EoaCmsProcessNotice,
      EoaCmsApplyProcess: EoaCmsApplyProcess,
      EoaCmsUserNotice: EoaCmsUserNotice,
      EoaCmsProcessTypeChat: EoaCmsProcessTypeChat,
      EoaCmsProcessChatData: EoaCmsProcessChatData,
      EoaCmsEmail: EoaCmsEmail,
      EoaCmsPlan: EoaCmsPlan,
    };
    return componentType[props.path];
  });
</script>

<style scoped></style>
