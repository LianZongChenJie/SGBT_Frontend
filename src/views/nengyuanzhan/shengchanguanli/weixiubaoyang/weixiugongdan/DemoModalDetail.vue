<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <template v-if="hasDetailData">
      <!--    <BasicForm @register="registerForm" :disabled="isDisabled"/>-->
      <div class="flex justify-between ml5 mr5">
        <h2>{{ editFormData?.theme || '维修工单详情' }}</h2>
        <a-space>
          <a-button
            v-if="hasPermission('operation:operation_base_repair_order:assign') && editFormData.status === 1"
            type="primary"
            @click="handlePaigong(editFormData)"
          >
            派工
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_base_repair_order:acceptOrder') && editFormData.status === 1"
            type="primary"
            @click="handleJiedan(editFormData, 1)"
          >
            接单
          </a-button>
          <a-button
            v-if="
              hasPermission('operation:operation_base_repair_order:execute') &&
              (editFormData.status === 2 || editFormData.reviewStatus === 4 || editFormData.reviewStatus === 5)
            "
            type="primary"
            @click="handleZhixingweixiu(editFormData)"
          >
            {{ editFormData.reviewStatus === 4 || editFormData.status === 2 ? '开始维修' : '执行维修' }}
          </a-button>
          <a-button
            v-if="
              hasPermission('operation:operation_base_repair_order:accept') &&
              (editFormData.status === 3 || editFormData.reviewStatus === 6)
            "
            type="primary"
            @click="handleYanshou(editFormData)"
          >
            验收
          </a-button>
        </a-space>
      </div>
      <div id="printContent">
        <div class="flex justify-between ml5 mr1">
          <div style="width: 60%">
            <div v-if="editFormData.reviewStatus === 1" class="flex flex-self-start">
              <p class="mr20">
                <span>创建人: </span>
                <span>{{ editFormData.createBy }}</span>
              </p>
              <p class="mr20">
                <span>创建时间: </span>
                <span>{{ editFormData.createTime }}</span>
              </p>
              <p>
                <span>设备类型:</span>
                <span>{{ editFormData.deviceType }}</span>
              </p>
            </div>
            <a-row class="mb3">
              <a-col :span="8">
                <span>设备名称: </span>
                <span>{{ editFormData.deviceName }}</span>
              </a-col>
              <a-col :span="8">
                <span>设备编号: </span>
                <span>{{ editFormData.deviceCode }}</span>
              </a-col>
              <a-col :span="8">
                <span>设备类型: </span>
                <span>{{ editFormData.deviceType }}</span>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="8">
                <span>规格型号: </span>
                <span>{{ editFormData.specModel }}</span>
              </a-col>
              <a-col :span="8">
                <span>存放位置: </span>
                <span>{{ editFormData.storageLocation }}</span>
              </a-col>
              <a-col :span="8">
                <span>部门名称: </span>
                <span>{{ editFormData.groupName || editFormData.useDept }}</span>
              </a-col>
            </a-row>
          </div>

          <h2 v-if="editFormData.reviewStatus === 1" class="flex justify-center items-center zu1"> 未施工 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 2" class="flex justify-center items-center zu2"> 待接单 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 3" class="flex justify-center items-center zu3"> 已审核 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 4" class="flex justify-center items-center zu4"> 待执行 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 5" class="flex justify-center items-center zu5"> 维修中 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 6" class="flex justify-center items-center zu6"> 待验收 </h2>
          <h2 v-else-if="editFormData.reviewStatus === 7" class="flex justify-center items-center zu6"> 已完成 </h2>
        </div>
        <a-divider></a-divider>
        <a-tabs v-model:activeKey="activeKey" class="ml5 mr5">
          <a-tab-pane key="1" tab="维修信息">
            <Weixiuxinxi :data="editFormData"></Weixiuxinxi>
          </a-tab-pane>
          <a-tab-pane key="2" tab="报修信息">
            <Baoxiuxinxi :data="editFormData"></Baoxiuxinxi>
          </a-tab-pane>
          <a-tab-pane key="3" tab="更换备件">
            <Genghuanbeijian v-if="hasReplacePartData" :data="editFormData"></Genghuanbeijian>
            <DetailEmptyState v-else />
          </a-tab-pane>
          <a-tab-pane key="4" tab="执行进度">
            <Zhixingjindu :data="editFormData"></Zhixingjindu>
          </a-tab-pane>
          <a-tab-pane key="5" tab="验收信息">
            <Yanshouxinxi v-if="hasAcceptanceData" :data="editFormData"></Yanshouxinxi>
            <DetailEmptyState v-else />
          </a-tab-pane>

          <a-tab-pane key="6" tab="工单信息">
            <Gongdanxinxi :data="editFormData"></Gongdanxinxi>
          </a-tab-pane>
          <a-tab-pane key="7" tab="故障信息">
            <Guzhangxinxi v-if="hasFaultInfoData" :data="editFormData"></Guzhangxinxi>
            <DetailEmptyState v-else />
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <DetailEmptyState v-else class="ml5 mr5 mt5" />

    <DemoModalEdit :isDisabled="isDisabled" @register="registerModal1" />
    <DemoModalShenhe :isDisabled="isDisabled" @register="registerModal2" />

    <DemoModalPaigong :isDisabled="isDisabled" @register="registerModalPaigong" />
    <DemoModalZhixingweixiu :isDisabled="isDisabled" @register="registerModalZhixingweixiu" />
    <DemoModalYanshou :isDisabled="isDisabled" @register="registerModalYanshou" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { printJS } from '/@/hooks/web/usePrintJS';
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { Modal } from 'ant-design-vue';
  import DetailEmptyState from '@/views/nengyuanzhan/components/DetailEmptyState.vue';
  import { hasListData, hasMeaningfulData } from '@/views/nengyuanzhan/components/detailUtils';
  const [registerModalPaigong, { openModal: openModalPaigong }] = useModal();
  const [registerModalYanshou, { openModal: openModalYanshou }] = useModal();
  const { hasPermission } = usePermission();
  import { useMethods } from '@/hooks/system/useMethods';
  const [registerModalZhixingweixiu, { openModal: openModalZhixingweixiu }] = useModal();

  const { handleImportXls, handleExportXls } = useMethods();
  import { getDemoById, getRepairWorkloadList, saveAcceptOrder } from './demo.api';
  import { normalizeRepairOrderRecord } from './repairOrderFields';
  import DemoModalEdit from './DemoModalEdit.vue';
  import DemoModalShenhe from './DemoModalShenhe.vue';
  import Yanshouxinxi from './components/Yanshouxinxi.vue';
  import Weixiuxinxi from './components/Weixiuxinxi.vue';
  import Gongdanxinxi from './components/Gongdanxinxi.vue';
  import Guzhangxinxi from './components/Guzhangxinxi.vue';
  import Zhixingjindu from './components/Zhixingjindu.vue';
  import Genghuanbeijian from './components/Genghuanbeijian.vue';
  import Baoxiuxinxi from './components/Baoxiuxinxi.vue';
  import DemoModalPaigong from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/weixiugongdan/DemoModalPaigong.vue';
  import DemoModalZhixingweixiu from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/weixiugongdan/DemoModalZhixingweixiu.vue';
  import DemoModalYanshou from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/weixiugongdan/DemoModalYanshou.vue';

  const [registerModal1, { openModal }] = useModal();
  const [registerModal2, { openModal: openModalShenhe }] = useModal();
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
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
  const hasAcceptanceData = computed(() => hasMeaningfulData(editFormData.value?.acceptance));
  const hasFaultInfoData = computed(() =>
    hasMeaningfulData({
      faultTime: editFormData.value?.faultTime,
      faultLevel: editFormData.value?.faultLevel,
      faultCategory: editFormData.value?.faultCategory,
      isDowntime: editFormData.value?.isDowntime,
      faultDesc: editFormData.value?.faultDesc,
      images: editFormData.value?.images,
    })
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
      activeKey.value = '1';
      data.record = normalizeRepairOrderRecord(await getDemoById({ id: data.record.id }));
      if (!hasListData(data.record.workloadList)) {
        data.record.workloadList = await queryWorkloadList(data.record.id);
      }
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
  const title = computed(() => (!unref(isUpdate) ? '详情' : '详情'));

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    // console.log(record,'4344444');
    isDisabled.value = false;
    openModal(true, {
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

  async function handleJiedan(record) {
    Modal.confirm({
      title: '提示',
      content: '确定接受当前维修派工?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        saveAcceptOrder({ id: record.id }, function () {});
      },
    });
  }
  function handleShenhe(record, num) {
    openModalShenhe(true, {
      record,
      num,
      isUpdate: true,
    });
  }

  function handleZhixingweixiu(record) {
    isDisabled.value = false;
    // if (record.faultOrderNo){ 这是报修的工单、没有这个值是快速工单、
    openModalZhixingweixiu(true, {
      record,
      isUpdate: true,
    });
  }
  function handlePaigong(record) {
    isDisabled.value = false;
    openModalPaigong(true, {
      record,
      isUpdate: true,
    });
  }
  function handleYanshou(record) {
    isDisabled.value = false;
    openModalYanshou(true, {
      record,
      isUpdate: true,
    });
  }

  async function queryWorkloadList(id) {
    if (!id) {
      return [];
    }
    const res = await getRepairWorkloadList({ orderId: id, pageNo: 1, pageSize: 999 });
    if (Array.isArray(res)) {
      return res;
    }
    return res?.records || res?.result?.records || [];
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
