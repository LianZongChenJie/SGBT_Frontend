<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <template v-if="hasDetailData">
      <!--    <BasicForm @register="registerForm" :disabled="isDisabled"/>-->
      <div class="flex justify-between ml5 mr5">
        <h2>{{ editFormData?.theme || '故障报修详情' }}</h2>
        <a-space>
          <a-button v-if="hasPermission('operation:operation_base_fault_order:dispatch')" type="primary" @click="handlePaigong(editFormData)">
            派工
          </a-button>
          <a-button v-if="hasPermission('operation:operation_base_fault_order:audit')" type="primary" @click="handleShenhe(editFormData, 1)">
            通过
          </a-button>
          <a-button v-if="hasPermission('operation:operation_base_fault_order:audit')" type="primary" @click="handleShenhe(editFormData, 2)">
            驳回
          </a-button>

          <a-button v-if="hasPermission('operation:operation_base_fault_order:revoke')" type="primary" @click="confirm('撤销')"> 撤销 </a-button>
          <a-button v-if="hasPermission('operation:operation_base_fault_order:reopen')" type="primary" @click="confirm('开启')"> 开启 </a-button>
          <a-button v-if="hasPermission('operation:operation_base_fault_order:edit')" type="primary" @click="handleEdit(editFormData)">
            编辑
          </a-button>
        </a-space>
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
          <h2 v-if="editFormData.auditStatus === 0" class="flex justify-center items-center zu1"> 待审核 </h2>
          <h2 v-if="editFormData.auditStatus === 1" class="flex justify-center items-center zu1"> 通过 </h2>
          <h2 v-else-if="editFormData.auditStatus === 2" class="flex justify-center items-center zu2"> 驳回 </h2>
          <h2 v-else-if="editFormData.auditStatus === 3" class="flex justify-center items-center zu3"> 已审核 </h2>
          <h2 v-else-if="editFormData.auditStatus === 8" class="flex justify-center items-center zu3"> 审核中 </h2>
          <h2 v-else-if="editFormData.auditStatus === 4" class="flex justify-center items-center zu4"> 待维修 </h2>
          <h2 v-else-if="editFormData.auditStatus === 5" class="flex justify-center items-center zu5"> 维修中 </h2>
          <h2 v-else-if="editFormData.auditStatus === 6" class="flex justify-center items-center zu6"> 已撤回 </h2>
          <h2 v-else-if="editFormData.auditStatus === 7" class="flex justify-center items-center zu6"> 已完成 </h2>
        </div>
        <a-tabs v-model:activeKey="activeKey" class="ml5 mr5">
          <a-tab-pane key="1" tab="报修信息">
            <Baoxiuxinxi :data="editFormData"></Baoxiuxinxi>
          </a-tab-pane>
          <a-tab-pane key="2" tab="维修信息">
            <Weixiuxinxi v-if="hasRepairInfoData" :data="editFormData"></Weixiuxinxi>
            <DetailEmptyState v-else />
          </a-tab-pane>
          <a-tab-pane key="3" tab="更换备件">
            <Genghuanbeijian v-if="hasReplacePartData" :data="editFormData"></Genghuanbeijian>
            <DetailEmptyState v-else />
          </a-tab-pane>
          <a-tab-pane key="4" tab="处理进度">
            <Chulijindu :data="editFormData"></Chulijindu>
          </a-tab-pane>
          <a-tab-pane key="5" tab="审核记录">
            <Shenhejilu :data="editFormData"></Shenhejilu>
          </a-tab-pane>
          <a-tab-pane key="6" tab="操作记录">
            <Caozuojilu :data="editFormData"></Caozuojilu>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <DetailEmptyState v-else class="ml5 mr5 mt5" />

    <DemoModalPaigong :isDisabled="isDisabled" @register="registerModalPaigong" @success="" />
    <DemoModalShenhe :isDisabled="isDisabled" @register="registerModal2" @success="successShenhe" />
    <DemoModal :isDisabled="isDisabled" @register="registerModalEdit" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { printJS } from '/@/hooks/web/usePrintJS';
  import { ref, computed, unref, watch, onMounted } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import DetailEmptyState from '@/views/nengyuanzhan/components/DetailEmptyState.vue';
  import { hasMeaningfulData, hasListData } from '@/views/nengyuanzhan/components/detailUtils';

  const { hasPermission } = usePermission();
  import { useMethods } from '@/hooks/system/useMethods';

  const { handleImportXls, handleExportXls } = useMethods();
  import { getDemoById, saveRevoke, saveReopen, getWeixiuxinxiOrGenghuanbeijian } from './demo.api';

  import Baoxiuxinxi from './components/Baoxiuxinxi.vue';
  import Weixiuxinxi from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/weixiugongdan/components/Weixiuxinxi.vue';
  import Genghuanbeijian from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/weixiugongdan/components/Genghuanbeijian.vue';
  import Chulijindu from './components/Chulijindu.vue';
  import Shenhejilu from './components/Shenhejilu.vue';
  import Caozuojilu from './components/Caozuojilu.vue';
  import { message, Modal } from 'ant-design-vue';
  import DemoModalPaigong from './DemoModalPaigong.vue';
  import DemoModalShenhe from './DemoModalShenhe.vue';
  import DemoModal from './DemoModal.vue';

  const [registerModalPaigong, { openModal: openModalPaigong }] = useModal();
  const [registerModalEdit, { openModal: openModalEdit }] = useModal();
  const [registerModal2, { openModal: openModalShenhe }] = useModal();
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const id = ref(0);
  const isDisabled = ref(false);
  const activeKey = ref('1');
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const editFormData = ref({});
  const hasDetailData = computed(() => hasMeaningfulData(editFormData.value));
  const hasRepairInfoData = computed(() =>
    hasMeaningfulData({
      assignerId: editFormData.value?.assignerId,
      repairTeamId: editFormData.value?.repairTeamId,
      leaderId: editFormData.value?.leaderId,
      repairLevel: editFormData.value?.repairLevel,
      repairType: editFormData.value?.repairType,
      repairDesc: editFormData.value?.repairDesc,
      repairMethod: editFormData.value?.repairMethod,
      repairResult: editFormData.value?.repairResult,
      workloadList: editFormData.value?.workloadList,
    })
  );
  const hasReplacePartData = computed(
    () =>
      hasMeaningfulData({
        applyNo: editFormData.value?.applyNo,
        applicantName: editFormData.value?.applicantName,
        applyReason: editFormData.value?.applyReason,
        deptName: editFormData.value?.deptName,
        details: editFormData.value?.details,
      }) || hasListData(editFormData.value?.details)
  );
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    // await resetFields();
    // const res = await getTreeList();
    //
    // const options = (res || []).map(item => ({
    //   label: item.groupName,
    //   value: item.groupCode,
    // }));
    // updateSchema({
    //   field: 'inspectionGroup',
    //   componentProps: {
    //     options,
    //   },
    // });
    // setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
    // isUpdate.value = !!data?.isUpdate;
    // if (data.createBy) {
    //   await setFieldsValue({createBy: data.createBy})
    // }
    // if (data.createTime) {
    //   await setFieldsValue({createTime: data.createTime})
    // }
    if (unref(isUpdate)) {
      //获取详情
      id.value = data.record.id;
      activeKey.value = '1';
      data.record = await getDemoById({ id: data.record.id });

      editFormData.value = data.record || {};

      //   //表单赋值
      //   if (data.record.inspectionYear) {
      //     data.record.inspectionYear = String(data.record.inspectionYear);
      //   }
      //   await setFieldsValue({
      //     ...data.record,
      //   });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '详情'));

  /**
   * 编辑事件
   */
  function handlePaigong(record) {
    // console.log(record,'4344444');
    isDisabled.value = false;
    openModalPaigong(true, {
      record,
      isUpdate: true,
    });
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

  function onPrint() {
    printJS({
      printable: '#printContent',
      type: 'html',
    });
  }

  const confirm = async (e) => {
    if (e === '撤销') {
      const params = {
        id: editFormData.value.id,
        // cancelResult:2 //撤销/开启结果：1-开启，2-撤销
      };
      Modal.confirm({
        title: '提示',
        content: '确定撤销当前申请？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          saveRevoke(params, (res) => {
            emit('success');
            message.success(res.message);
          });
        },
      });
    } else if (e === '开启') {
      const params = {
        id: editFormData.value.id,
        // cancelResult:2 //撤销/开启结果：1-开启，2-撤销
      };
      Modal.confirm({
        title: '提示',
        content: '确定重新开启当前申请？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          saveReopen(params, (res) => {
            emit('success');
            message.success(res.message);
          });
        },
      });
    }
  };

  function handleEdit(record) {
    isDisabled.value = false;
    openModalEdit(true, {
      record,
      isUpdate: true,
    });
  }
  async function successShenhe() {
    editFormData.value = await getDemoById({ id: id.value });
    emit('success');
  }
  function handleShenhe(record, num) {
    openModalShenhe(true, {
      record,
      num,
      isUpdate: true,
    });
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
