<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <template v-if="hasDetailData">
      <!--    <BasicForm @register="registerForm" :disabled="isDisabled"/>-->
      <div class="flex justify-between ml5 mr5">
        <h2>{{ editFormData?.subject }}入库单</h2>
        <a-space>
          <!--        <a-button v-if="hasPermission('operation:operation_inspection_plan:cancel')" type="primary" @click="confirm('删除')"> 删除 </a-button>-->
          <!--        <a-button-->
          <!--          v-if="hasPermission('operation:operation_base_fault_order:exportXls')"-->
          <!--          preIcon="ant-design:export-outlined"-->
          <!--          type="primary"-->
          <!--          @click="handleExportXls('故障报修', getExportUrl, exportParams)"-->
          <!--        >导出-->
          <!--        </a-button>-->
          <!--        <a-button @click="onPrint" type="primary"> 打印 </a-button>-->
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
        </div>
        <a-tabs v-model:activeKey="activeKey" class="ml5 mr5">
          <a-tab-pane key="1" tab="入库信息">
            <Rukuxinxi v-if="activeKey === '1'" :data="editFormData" style="min-height: 400px"></Rukuxinxi>
          </a-tab-pane>
          <a-tab-pane key="2" tab="入库明细">
            <Rukumingxi v-if="activeKey === '2'" :data="editFormData"></Rukumingxi>
          </a-tab-pane>
          <!--        <a-tab-pane key="3" tab="操作记录">-->
          <!--          <Caozuojilu :data="editFormData"></Caozuojilu>-->
          <!--        </a-tab-pane>-->
        </a-tabs>
      </div>
    </template>
    <DetailEmptyState v-else class="ml5 mr5 mt5" />

    <DemoModal :isDisabled="isDisabled" @register="registerModalEdit" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { Empty } from 'ant-design-vue';
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  import { printJS } from '/@/hooks/web/usePrintJS';
  import { ref, computed, unref, toRaw } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import DetailEmptyState from '@/views/nengyuanzhan/components/DetailEmptyState.vue';
  import { hasMeaningfulData } from '@/views/nengyuanzhan/components/detailUtils';

  const { hasPermission } = usePermission();
  import { useMethods } from '@/hooks/system/useMethods';

  const { handleImportXls, handleExportXls } = useMethods();
  import { getDemoById, saveRevoke, saveReopen, getExportUrl } from './demo.api';

  import Rukuxinxi from './components/Rukuxinxi.vue';
  import Caozuojilu from './components/Caozuojilu.vue';
  import Rukumingxi from './components/Rukumingxi.vue';
  import { message, Modal } from 'ant-design-vue';
  import DemoModal from './DemoModal.vue';

  const [registerModalEdit, { openModal: openModalEdit }] = useModal();
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
    console.log(e, editFormData.value);
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
