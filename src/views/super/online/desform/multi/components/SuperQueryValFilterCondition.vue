<template>
  <OnlineSuperQueryValComponent
      :schema="schemaRef"
      :formModel="condition"
      :setFormModel="setFormModelFn"
      style="width: 100%"
  />
</template>
<script lang="ts" setup>
import {computed, onUnmounted} from "vue";
import OnlineSuperQueryValComponent from '/@/views/super/online/cgform/auto/comp/superquery/SuperQueryValComponent.vue';

const props = defineProps({
  condition: {
    type: Object as any,
    required: true,
  },
  getSchema: {
    type: Function as any,
    required: true,
  },
  setFormModel: {
    type: Function as any,
    required: true,
  },
  scrollContainer: {
    type: [String, HTMLDivElement],
    default: '',
  },
});

const destroyObj: Fn[] = []

const schemaRef = computed(() => {
  return props.getSchema(props.condition, {
    scrollContainer: props.scrollContainer,
    setDestroyObj: setDestroyObj,
  });
});

function setFormModelFn(key: string, value: any) {
  props.setFormModel(key, value, props.condition);
}

function setDestroyObj(obj: Fn) {
  destroyObj.push(obj)
}

onUnmounted(() => {
  destroyObj.forEach(fn => {
    if (typeof fn === 'function') {
      fn()
    }
  })
});

</script>
<style lang="less" scoped>
</style>