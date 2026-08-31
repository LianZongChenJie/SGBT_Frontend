<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <template v-if="hasDetailData">
      <div class="flex justify-between ml5 mr5">
        <h2>{{ editFormData?.taskName }}计划</h2>
      </div>
      <div id="printContent" class="mt5">
        <div class="flex justify-between ml5 mr5">
          <div>
            <div class="flex justify-between">
              <p style="width: 300px">
                <span>设备名称:</span>
                <span>{{ editFormData.deviceName }}</span>
              </p>
              <p class="ml40 mr40" style="width: 200px">
                <span>规格型号:</span>
                <span>{{ editFormData.deviceModule }}</span>
              </p>
              <p style="width: 200px">
                <span>存放位置:</span>
                <span>{{ editFormData.spaceName || editFormData.spaceId || '-' }}</span>
              </p>
            </div>
            <div class="flex justify-between">
              <p style="width: 300px">
                <span>设备编号:</span>
                <span>{{ editFormData.deviceCode }}</span>
              </p>
              <p class="ml40 mr40" style="width: 200px">
                <span>设备类型:</span>
                <span v-if="editFormData.category === 1">设备</span>
                <span v-if="editFormData.category === 2">备件</span>
                <span v-if="editFormData.category === 3">工具</span>
              </p>
              <p style="width: 200px">
                <span>使用部门:</span>
                <span>{{ editFormData.sysOrgName || editFormData.sysOrgCode || '-' }}</span>
              </p>
            </div>
          </div>
          <h2 v-if="editFormData.status === 1" class="flex justify-center items-center zu2"> 待执行 </h2>
          <h2 v-else-if="editFormData.status === 2" class="flex justify-center items-center zu1"> 执行中 </h2>
          <h2 v-else-if="editFormData.status === 4" class="flex justify-center items-center zu3"> 超时 </h2>
          <h2 v-else-if="editFormData.status === 3" class="flex justify-center items-center zu7"> 已完成 </h2>
          <h2 v-else-if="editFormData.status === 5" class="flex justify-center items-center zu6"> 已取消 </h2>
        </div>
        <a-divider />

        <a-tabs v-model:activeKey="activeKey" class="ml5 mr5">
          <a-tab-pane key="1" tab="任务信息">
            <Renwuxinxi :data="editFormData"></Renwuxinxi>
          </a-tab-pane>
          <a-tab-pane key="2" tab="点检明细">
            <Dianjianmingxi :data="editFormData"></Dianjianmingxi>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <DetailEmptyState v-else class="ml5 mr5 mt5" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDemoById } from './demo.api';
  import Renwuxinxi from './components/Renwuxinxi.vue';
  import Dianjianmingxi from './components/Dianjianmingxi.vue';
  import DetailEmptyState from '@/views/nengyuanzhan/components/DetailEmptyState.vue';
  import { hasMeaningfulData } from '@/views/nengyuanzhan/components/detailUtils';

  const isUpdate = ref(true);
  const activeKey = ref('1');
  const editFormData = ref({});
  const hasDetailData = computed(() => hasMeaningfulData(editFormData.value));
  //表单赋值
  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showOkBtn: false, cancelText: '关闭' });
    activeKey.value = '1';
    if (unref(isUpdate)) {
      data.record = await getDemoById({ id: data.record.id });
      editFormData.value = data.record || {};
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '详情' : '详情'));

  //表单提交事件
  async function handleSubmit(v) {
    // try {
    //   let values = await validate();
    //   setModalProps({confirmLoading: true});
    //   //提交表单
    //   await saveOrUpdateDemo(values, isUpdate.value);
    //   //关闭弹窗
    //   closeModal();
    //   //刷新列表
    //   emit('success', values);
    // } finally {
    //   setModalProps({confirmLoading: false});
    // }
  }
</script>
<style lang="less" scoped>
  .zu1 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: url('@/assets/images/Adaishenhe.png') no-repeat;
    background-size: 100% 100%;
    color: #1890ff;
    font-size: 16px;
  }

  .zu2 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: url('@/assets/images/Abohui.png') no-repeat;
    background-size: 100% 100%;
    color: #f56c6c;
    font-size: 16px;
  }

  .zu3 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: url('@/assets/images/Ayishenhe.png') no-repeat;
    background-size: 100% 100%;
    color: #f59a23;
    font-size: 16px;
  }

  .zu4 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: url('@/assets/images/Adaishishi.png') no-repeat;
    background-size: 100% 100%;
    color: #a0a7e6;
    font-size: 16px;
  }

  .zu5 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: url('@/assets/images/Ashishizhong.png') no-repeat;
    background-size: 100% 100%;
    color: #005eaa;
    font-size: 16px;
  }

  .zu6 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: url('@/assets/images/Aguanbi.png') no-repeat;
    background-size: 100% 100%;
    color: #aaaaaa;
    font-size: 16px;
  }

  .zu7 {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: url('@/assets/images/Awancheng.png') no-repeat;
    background-size: 100% 100%;
    color: #0bb27a;
    font-size: 16px;
  }
</style>
