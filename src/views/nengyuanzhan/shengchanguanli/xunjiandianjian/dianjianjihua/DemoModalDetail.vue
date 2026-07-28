<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <template v-if="hasDetailData">
      <div class="flex justify-between ml5 mr5">
        <h2>{{ editFormData?.planName }}计划</h2>
        <a-space>
          <a-button v-if="hasPermission('operation:operation_inspection_plan:adjust')" type="primary" @click="handleEdit(editFormData)">
            调整计划
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_inspection_plan:cancel') && canCancelSelected"
            type="primary"
            @click="handleSelectedCancel"
          >
            撤销
          </a-button>
          <a-button v-if="hasPermission('operation:operation_inspection_plan:cancel') && canOpenSelected" type="primary" @click="handleSelectedOpen">
            开启
          </a-button>
          <a-button v-if="hasPermission('operation:operation_inspection_plan:audit') && canAuditSelected" type="primary" @click="handleSelectedAudit">
            审核
          </a-button>
        </a-space>
      </div>
      <div id="printContent" class="mt5">
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
          <h2 v-if="editFormData.reviewStatus === 1" class="flex justify-center items-center zu1"> 待审核 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 2" class="flex justify-center items-center zu2"> 驳回 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 3" class="flex justify-center items-center zu3"> 已审核 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 4" class="flex justify-center items-center zu4"> 待实施 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 5" class="flex justify-center items-center zu5"> 实施中 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 6" class="flex justify-center items-center zu6"> 已关闭 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 7" class="flex justify-center items-center zu6"> 已完成 </h2>
        </div>
        <a-divider />
        <a-tabs v-model:activeKey="activeKey" class="ml5 mr5">
          <a-tab-pane key="1" tab="计划信息">
            <Jihuaxinxi :data="editFormData"></Jihuaxinxi>
          </a-tab-pane>
          <a-tab-pane key="2" tab="点检明细">
            <Xunjianmingxi :data="editFormData"></Xunjianmingxi>
          </a-tab-pane>
          <a-tab-pane key="3" tab="审核记录">
            <Shenhejilu :data="editFormData"></Shenhejilu>
          </a-tab-pane>
          <a-tab-pane key="4" tab="操作记录">
            <Caozuojilu :data="editFormData"></Caozuojilu>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <DetailEmptyState v-else class="ml5 mr5 mt5" />

    <DemoModalEdit :isDisabled="isDisabled" @register="registerModal1" />
    <DemoModalShenhe :isDisabled="isDisabled" @register="registerModal2" @success="successShenhe" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { Modal } from 'ant-design-vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getDemoById, saveKaiqiChexiao } from './demo.api';
  import DetailEmptyState from '@/views/nengyuanzhan/components/DetailEmptyState.vue';
  import { hasMeaningfulData } from '@/views/nengyuanzhan/components/detailUtils';
  const { hasPermission } = usePermission();
  import DemoModalEdit from './DemoModalEdit.vue';
  import DemoModalShenhe from './DemoModalShenhe.vue';
  import Jihuaxinxi from './components/Jihuaxinxi.vue';
  import Xunjianmingxi from './components/Xunjianmingxi.vue';
  import Shenhejilu from './components/Shenhejilu.vue';
  import Caozuojilu from './components/Caozuojilu.vue';

  const emit = defineEmits(['register', 'success']);
  const [registerModal1, { openModal }] = useModal();
  const [registerModal2, { openModal: openModalShenhe }] = useModal();
  const isUpdate = ref(true);
  const isDisabled = ref(false);
  const activeKey = ref('1');

  const editFormData = ref({});
  const hasDetailData = computed(() => hasMeaningfulData(editFormData.value));
  const currentReviewStatus = computed(() => Number(editFormData.value?.reviewStatus));
  const canCancelSelected = computed(() => currentReviewStatus.value === 1);
  const canOpenSelected = computed(() => currentReviewStatus.value === 6);
  const canAuditSelected = computed(() => currentReviewStatus.value !== 3);
  //表单赋值
  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showOkBtn: false, cancelText: '关闭' });
    activeKey.value = '1';
    if (unref(isUpdate)) {
      await reloadDetail(data.record.id);
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '详情' : '详情'));

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  function handleSelectedCancel() {
    Modal.confirm({
      title: '确认撤销',
      content: '是否撤销当前选中的点检计划？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return saveKaiqiChexiao({ id: editFormData.value?.id, cancelResult: 2 }, async () => {
          await reloadDetail(editFormData.value?.id);
          emit('success');
        });
      },
    });
  }

  function handleSelectedOpen() {
    Modal.confirm({
      title: '确认开启',
      content: '是否开启当前选中的点检计划？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return saveKaiqiChexiao({ id: editFormData.value?.id, cancelResult: 1 }, async () => {
          await reloadDetail(editFormData.value?.id);
          emit('success');
        });
      },
    });
  }

  function handleSelectedAudit() {
    openModalShenhe(true, {
      record: editFormData.value,
      isUpdate: true,
    });
  }

  async function reloadDetail(id: string | number) {
    const record = await getDemoById({ id });
    editFormData.value = record || {};
  }

  async function successShenhe() {
    await reloadDetail(editFormData.value?.id);
    emit('success');
  }

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
