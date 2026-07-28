<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="巡检项知识库详情"
    width="900px"
    :ok-button-props="{ style: { display: 'none' } }"
    cancelText="关闭"
  >
    <div class="form-modal">
      <!-- 巡检项 -->
      <div class="inspect-item">
        <div class="item-header">
          <div class="item-title-row">
            <h4 class="item-title">巡检项</h4>
          </div>
          <div class="item-name-section">
            <label class="item-label">巡检项名称</label>
            <a-input
              :value="recordData.name"
              disabled
              style="width: 100%"
              :class="'inspect-item-input'"
            />
          </div>
        </div>

        <!-- 巡检内容列表 -->
        <div class="content-list">
          <div class="level-title">
            <div class="title-section">
              <span class="title-text">巡检内容</span>
            </div>
          </div>

          <div
            v-for="(content, index) in recordData.contents"
            :key="index"
            class="content-card"
          >
            <div class="content-input-row">
              <div class="input-with-label">
                <label class="input-label">巡检内容</label>
                <a-input
                  :value="content.contentName"
                  disabled
                  :class="'content-input'"
                />
              </div>
              <div class="input-with-label">
                <label class="input-label">结果类型</label>
                <a-select
                  :value="content.resultType"
                  disabled
                  :class="'result-type-select'"
                >
                  <a-select-option value="OPTION">选项</a-select-option>
                  <a-select-option value="PERCENTAGE">百分比</a-select-option>
                  <a-select-option value="TEXT">文本</a-select-option>
                </a-select>
              </div>
            </div>
            <div class="content-options-row">
              <a-input
                v-if="content.resultType != 'PERCENTAGE'"
                :value="content.optionValues"
                disabled
                style="width: 100%; margin-top: 12px"
                :class="'options-input'"
              />
              <a-input-number
                v-else
                :value="content.optionValues"
                disabled
                :min="0"
                :max="100"
                style="width: 100%; margin-top: 12px"
                :class="'options-input'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { queryInspectionItemKnowledgeDetail } from './inspectionItemKnowledge.api';

const recordData = ref<any>({
  name: '',
  contents: [],
});

const [registerModal] = useModalInner(async (data) => {
  const record = data?.record || {};
  if (record.id) {
    try {
      const res = await queryInspectionItemKnowledgeDetail({ id: record.knowledgeItemId });
      if (res) {
        recordData.value = {
          name: res.name || '',
          description: res.description || '',
          contents: res.contents && Array.isArray(res.contents)
            ? res.contents.map((content) => ({
                contentName: content.contentName || '',
                resultType: content.resultType || 'OPTION',
                optionValues: content.optionValues || '',
              }))
            : [],
        };
        return;
      }
    } catch (error) {
      console.error('加载详情失败:', error);
    }
  }
  recordData.value = {
    name: record.name || '',
    contents: record.contents && Array.isArray(record.contents)
      ? record.contents.map((content) => ({
          contentName: content.contentName || '',
          resultType: content.resultType || 'OPTION',
          optionValues: content.optionValues || '',
        }))
      : [],
  };
});
</script>

<style lang="less" scoped>
.form-modal {
  padding: 16px;
}

.inspect-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.item-header {
  margin-bottom: 16px;
}

.item-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .item-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.item-name-section {
  .item-label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }

  .inspect-item-input {
    width: 100%;
  }
}

.content-list {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e8e8e8;
}

.level-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .title-section {
    .title-text {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }
}

.content-card {
  background: #fafbfc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.content-input-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .input-with-label {
    flex: 1;

    .input-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .content-input {
      width: 100%;
    }

    .result-type-select {
      width: 100%;
    }
  }
}

.content-options-row {
  .options-input {
    width: 100%;
    margin-top: 12px;
  }
}
</style>
