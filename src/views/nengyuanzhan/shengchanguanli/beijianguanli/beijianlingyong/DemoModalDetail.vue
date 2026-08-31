<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" width="80%">
    <template v-if="hasDetailData">
      <div class="flex justify-between ml5 mr5">
        <h2>{{ editFormData?.subject }}领用单</h2>
      </div>
      <div id="printContent">
        <div class="flex justify-between ml5 mr5">
          <div>
            <p>
              <span>创建人:</span>
              <span>{{ editFormData.createBy }}</span>
            </p>
            <p>
              <span>创建时间:</span>
              <span>{{ editFormData.createTime }}</span>
            </p>
          </div>
        </div>
        <a-tabs v-model:activeKey="activeKey" class="ml5 mr5">
          <a-tab-pane key="1" tab="领用信息">
            <Rukuxinxi :data="editFormData" />
          </a-tab-pane>
          <a-tab-pane key="2" tab="领用明细">
            <Rukumingxi :data="editFormData" />
          </a-tab-pane>
          <a-tab-pane key="3" tab="操作记录">
            <Caozuojilu :data="editFormData" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <DetailEmptyState v-else class="ml5 mr5 mt5" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import DetailEmptyState from '@/views/nengyuanzhan/components/DetailEmptyState.vue';
  import { hasMeaningfulData } from '@/views/nengyuanzhan/components/detailUtils';
  import { getDemoById } from './demo.api';
  import Rukuxinxi from './components/Rukuxinxi.vue';
  import Caozuojilu from './components/Caozuojilu.vue';
  import Rukumingxi from './components/Rukumingxi.vue';

  defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  defineEmits(['register', 'success']);

  const isUpdate = ref(true);
  const activeKey = ref('1');
  const editFormData = ref<Record<string, any>>({});
  const hasDetailData = computed(() => hasMeaningfulData(editFormData.value));

  const [registerModal] = useModalInner(async (data) => {
    if (!unref(isUpdate)) {
      return;
    }

    activeKey.value = '1';
    const listRecord = data?.record || {};
    const detailRecord = await getDemoById({ id: listRecord.id });

    editFormData.value = {
      ...listRecord,
      ...detailRecord,
      applicantName: detailRecord?.applicantName || listRecord?.applicantName,
      orgName: detailRecord?.orgName || listRecord?.orgName,
      deptName: detailRecord?.deptName || listRecord?.deptName || listRecord?.orgName,
    };
  });

  const title = computed(() => (!unref(isUpdate) ? '新增' : '详情'));
</script>
