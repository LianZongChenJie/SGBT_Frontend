
<template>
  <div class="json-schema-editor">
    <SchemaFieldEditor
      :field="schema"
      :parent="null"
      :isRoot="true"
      @update:field="onFieldUpdate"
    />
    <div class="flex justify-end mt-4 space-x-4">
      <a-button @click="$emit('cancel')">取消</a-button>
      <a-button type="primary" @click="onPreview">确认</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import SchemaFieldEditor from './SchemaFieldEditor.vue'

const props = defineProps<{
  initialValue: any
}>()

const emits = defineEmits(['closeAndReturn', 'cancel'])

const schema = ref(JSON.parse(JSON.stringify(props.initialValue)))

const onFieldUpdate = () => {
  // 内部更新，不触发父组件更新
}

const onPreview = () => {
  emits('closeAndReturn', schema.value)
}
</script>

<style scoped>
.json-schema-editor {
  padding: 16px;
}
</style>
