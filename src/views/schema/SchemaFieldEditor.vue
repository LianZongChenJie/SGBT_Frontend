<template>
  <div class="field-editor">
    <div class="field-row">
      <a-input v-model:value="fieldKeyInput" placeholder="字段名 (key)" style="width: 120px" @blur="updateFieldKey" />
      <a-select v-model:value="field.type" style="width: 100px" @change="onTypeChange">
        <a-select-option value="string">字符串</a-select-option>
        <a-select-option value="number">数字</a-select-option>
        <a-select-option value="boolean">布尔</a-select-option>
        <a-select-option value="object">对象</a-select-option>
        <a-select-option value="array">数组</a-select-option>
      </a-select>
      <a-input v-model:value="field.title" placeholder="标题 (title)" style="width: 100px" />
      <a-input v-model:value="field.description" placeholder="描述 (description)" style="width: 160px" />
      <a-switch v-model:checked="required" @change="onToggleRequired" checked-children="必填" un-checked-children="选填" />
      <a-button danger size="small" @click="removeField" v-if="!isRoot">删除</a-button>
    </div>

    <!-- 嵌套对象 -->
    <div v-if="field.type === 'object'" class="nested-fields">
      <SchemaFieldEditor
        v-for="(childField, key) in field.properties"
        :key="key"
        :field="childField"
        :parent="field"
        :fieldKey="key"
      />
      <a-button type="dashed" size="small" @click="addObjectField">+ 添加子字段</a-button>
    </div>

    <!-- 数组 -->
    <div v-if="field.type === 'array'" class="nested-fields">
      <SchemaFieldEditor
        v-if="field.items"
        :field="field.items"
        :parent="field"
        :isArrayItem="true"
      />
      <a-button type="dashed" size="small" @click="addArrayItem">配置数组项</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface SchemaField {
  title?: string
  type: string
  description?: string
  properties?: Record<string, SchemaField>
  required?: string[]
  items?: SchemaField
}

const props = defineProps<{
  field: SchemaField
  parent?: SchemaField
  fieldKey?: string
  isArrayItem?: boolean
  isRoot?: boolean
}>()

const required = ref(false)
const fieldKeyInput = ref(props.fieldKey || '')

watch(
  () => props.parent,
  () => {
    if (props.parent && props.parent.required?.includes(props.fieldKey || '')) {
      required.value = true
    }
  },
  { immediate: true }
)

const updateFieldKey = () => {
  const oldKey = props.fieldKey
  const newKey = fieldKeyInput.value.trim()
  if (!props.parent || !oldKey || !newKey || oldKey === newKey) return

  const existing = props.parent.properties?.[oldKey]
  if (existing && props.parent.properties) {
    // 转移 key
    props.parent.properties[newKey] = existing
    delete props.parent.properties[oldKey]

    // 更新 required 中的 key
    if (required.value && props.parent.required) {
      const idx = props.parent.required.indexOf(oldKey)
      if (idx !== -1) {
        props.parent.required[idx] = newKey
      }
    }

    props.fieldKey = newKey
  }
}

const addObjectField = () => {
  const key = `field_${Date.now()}`
  if (!props.field.properties) props.field.properties = {}
  props.field.properties[key] = {
    title: '',
    type: 'string',
  }
}

const addArrayItem = () => {
  props.field.items = {
    title: 'Item',
    type: 'string',
  }
}

const onTypeChange = (newType: string) => {
  if (newType === 'object') {
    props.field.properties = {}
    delete props.field.items
  } else if (newType === 'array') {
    props.field.items = {
      title: 'Item',
      type: 'string',
    }
    delete props.field.properties
  } else {
    delete props.field.properties
    delete props.field.items
  }
}

const onToggleRequired = (val: boolean) => {
  if (!props.parent || !props.fieldKey) return
  if (!props.parent.required) props.parent.required = []

  if (val) {
    if (!props.parent.required.includes(props.fieldKey)) {
      props.parent.required.push(props.fieldKey)
    }
  } else {
    props.parent.required = props.parent.required.filter(k => k !== props.fieldKey)
  }
}

const removeField = () => {
  if (props.parent?.properties && props.fieldKey) {
    delete props.parent.properties[props.fieldKey]
    if (props.parent.required) {
      props.parent.required = props.parent.required.filter(k => k !== props.fieldKey)
    }
  } else if (props.parent?.items && props.isArrayItem) {
    delete props.parent.items
  }
}
</script>

<style scoped>
.field-editor {
  border-left: 2px solid #eee;
  margin-left: 12px;
  padding-left: 8px;
  margin-bottom: 8px;
}
.field-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}
.nested-fields {
  margin-left: 16px;
  border-left: 1px dashed #ccc;
  padding-left: 12px;
}
</style>
