<!-- index.vue -->
<template>
  <a-row>
    <a-col :span="18" class="schema-col">
      <a-textarea
        v-model:value="jsonString"
        :auto-size="{ minRows: 10, maxRows: 20 }"
        placeholder="请输入JSON Schema"
      />
    </a-col>
    <a-col :span="4">
      <a-button type="primary" @click="openEditor">可视化编辑</a-button>
      <a-modal
        v-model:open="editorVisible"
        title="JSON Schema 编辑器"
        width="100%"
        wrap-class-name="full-modal"
        :footer="null">
      <JsonSchemaEditor
        :initial-value="myFields"
        :key="editorKey"
        @closeAndReturn="onCloseAndReturn"
        @cancel="editorVisible = false"
      />
      </a-modal>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import JsonSchemaEditor from './JsonSchemaEditor.vue';

const myFields = ref({
  type: 'object',
  title: 'Root',
  properties: {},
  required: [],
});

const jsonString = computed({
  get() {
    return JSON.stringify(myFields.value, null, 2);
  },
  set(value) {
    try {
      myFields.value = JSON.parse(value);
    } catch (e) {
      console.error('无效的JSON格式', e);
    }
  }
});

const editorVisible = ref(false);
const editorKey = ref(0);

const openEditor = () => {
  editorKey.value += 1;
  editorVisible.value = true;
};

const onCloseAndReturn = (value) => {
  myFields.value = value;
  editorVisible.value = false;
};
</script>

<style scoped>
.schema-col {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
}
</style>
<style lang="less">
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
  }
}
</style>
