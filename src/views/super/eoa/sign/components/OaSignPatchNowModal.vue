<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" :width="800" destroyOnClose>
    <a-spin :spinning="loading">
      <a-tabs :class="{ 'hide-tabs-bar': true }" v-model:activeKey="activeKey">
        <a-tab-pane tab="选择补卡信息" :key="1" forceRender>
          <a-alert showIcon type="info" message="请选择一项异常打卡信息" />
          <a-tabs size="small" v-model:activeKey="activeKeySelectType">
            <a-tab-pane tab="补异常卡" :key="1" forceRender>
              <BasicTable
                :rowSelection="{ type: 'radio' }"
                :formConfig="formConfig"
                :columns="patchExceptionColumns"
                :dataSource="dataPatchSource"
                :canResize="false"
                :pagination="ipagination"
                @selectionChange="patchSelectionChange"
              >
                <template #signStatus="{ text, record }">
                  <a-tag v-if="text === SignStatusEnum.NO_SIGN.value" color="#D3D3D3">缺卡</a-tag>
                  <a-tag v-else-if="text === SignStatusEnum.NORMAL.value" color="green">正常</a-tag>
                  <a-tag v-else-if="text === SignStatusEnum.LATE.value" color="red">迟到</a-tag>
                  <a-tag v-else-if="text === SignStatusEnum.ABSENT.value" color="red">旷工</a-tag>
                  <a-tag v-else-if="text === SignStatusEnum.LEAVE_EARLY.value" color="red">早退</a-tag>
                  <span v-else>{{ text }}</span>
                </template>
              </BasicTable>
            </a-tab-pane>
            <a-tab-pane tab="补缺卡" :key="2" forceRender>
              <a-row>
                <a-col :span="12">
                  <a-calendar :fullscreen="false" v-model:value="calendarValue" :disabledDate="handleDisabledDate" />
                </a-col>
                <a-col :span="12">
                  <h3 style="text-align: center; line-height: 32px">{{ calendarValue.format('ll dddd') }}</h3>
                  <a-empty v-if="false" description="当天无任何缺卡记录" style="margin-top: 60px" />
                  <a-list>
                    <a-list-item v-for="(item, index) of missingDataSource" :key="index" style="padding: 20px">
                      <span style="margin-right: 10px">{{ getSignType(item.signType) }}</span>
                      <a-tag v-if="item.signStatus === SignStatusEnum.NO_SIGN.value" color="#D3D3D3">缺卡</a-tag>
                      <a-tag v-else-if="item.signStatus === SignStatusEnum.NORMAL.value" color="green">正常</a-tag>
                      <a-tag v-else-if="item.signStatus === SignStatusEnum.LATE.value" color="red">迟到</a-tag>
                      <a-tag v-else-if="item.signStatus === SignStatusEnum.ABSENT.value" color="red">旷工</a-tag>
                      <a-tag v-else-if="item.signStatus === SignStatusEnum.LEAVE_EARLY.value" color="red">早退</a-tag>
                      <span v-else>{{ item.signStatus }}</span>
                      <a-button v-if="item.isPatch" type="primary" size="small" disabled>已补卡</a-button>
                      <a-button
                        v-else-if="item.signStatus === SignStatusEnum.NO_SIGN.value"
                        type="primary"
                        size="small"
                        @click="handlePatchMissing(item)"
                        >立即补卡
                      </a-button>
                      <a-button v-else-if="item.signStatus === SignStatusEnum.NORMAL.value" type="primary" size="small" disabled>无需补卡 </a-button>
                      <a-button v-else type="primary" size="small" disabled>此处无法补异常卡</a-button>
                    </a-list-item>
                  </a-list>
                </a-col>
              </a-row>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
        <a-tab-pane tab="填写补卡原因" :key="2" forceRender>
          <BasicForm @register="registerForm" />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
    <template #footer>
      <a-button @click="handleCancel">关闭</a-button>
      <a-button type="primary" v-if="activeKey === 1 && activeKeySelectType === 1" :disabled="tableBtnDisabled" @click="handleClickConfirmSelect"
        >确定
      </a-button>
      <template v-else-if="activeKey === 2">
        <a-button type="primary" ghost @click="handleClickReselect">返回重选</a-button>
        <a-button type="primary" @click="handleClickSubmit">确定</a-button>
      </template>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, watch, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { patchFormSchema, patchExceptionColumns } from '../OaSign.data';
  import { getMissingSignInfo, getSignInfoAndRule, getSyncHoliday, addPatchOrMissingPatch } from '../OaSign.api';
  import { SignStatusEnum, SignTypeEnum } from '../utils/constant';
  import { getSignType, getSignStatus } from '../utils/util';
  import { BasicTable } from '/@/components/Table';
  import dayjs from 'dayjs';
  import { useMessage } from '/@/hooks/web/useMessage';

  const selectionPatchRows = ref<any>({});
  //今天
  const today = dayjs(dayjs().format('YYYY-MM-DD'));
  //昨天
  const yesterday = dayjs(today).set('date', today.get('date') - 1);
  const loading = ref<boolean>(false);
  const calendarValue = ref<any>(yesterday);
  const { createMessage } = useMessage();
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  //第一个tabs
  const activeKey = ref<number>(1);
  //第二个tabs
  const activeKeySelectType = ref<number>(1);
  const isUpdate = ref<boolean>(true);
  //需要补卡的数组
  const missingDataSource = ref<any>([]);
  const ipagination = ref<boolean>(false);
  //补异常卡
  const dataPatchSource = ref<any>([]);
  const formConfig = ref<any>({ size: 'small' });
  const signRulePatch = ref<any>({});
  //今天之后不能点击
  const restHoliday = ref<any>([]);
  const patchData = ref<any>({});
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 150,
    schemas: patchFormSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    selectionPatchRows.value = [];
    activeKey.value = 1;
    activeKeySelectType.value = 1;
    setModalProps({ height: 350 });
    await queryMissingSignInfo();
    await queryAbnormalSignInfoAndRule();
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增补卡' : '编辑补卡'));
  const tableBtnDisabled = ref<boolean>(true);

  /**
   * 查询补缺卡打信息
   */
  async function queryMissingSignInfo() {
    loading.value = true;
    await getMissingSignInfo({ date: calendarValue.value.format('YYYY-MM-DD') })
      .then((res) => {
        if (res.success) {
          missingDataSource.value = res.result;
        } else {
          throw res.message;
        }
      })
      .catch((e) => {
        createMessage.warning({ title: '查询打卡信息失败', content: (e || {}).message || e });
      })
      .finally(() => {
        loading.value = false;
      });
  }

  /**
   * 获取异常状态的补卡
   */
  async function queryAbnormalSignInfoAndRule() {
    await getSignInfoAndRule()
      .then((res) => {
        if (res.success) {
          let { signRule, abnormalSignInfos } = res.result;
          signRulePatch.value = signRule;
          dataPatchSource.value = abnormalSignInfos;
        } else {
          throw res.message;
        }
      })
      .catch((e) => {
        createMessage.warning({ title: '查询打卡信息失败', content: (e || {}).message || e });
      })
      .finally(() => {
        loading.value = false;
      });
  }

  /**
   * 日期是否可以点击
   */
  function handleDisabledDate(date) {
    let isDisabled = restHoliday.value.filter((item) => item.diff(date, 'days') == 0);
    return date >= today || (isDisabled && isDisabled.length > 0);
  }

  /**
   * 立即补卡
   * @param record
   */
  function handlePatchMissing(record) {
    let { signType } = record;
    let signTime = calendarValue.value.format('YYYY-MM-DD HH:mm:ss');
    let signTypeText = getSignType(signType);
    if (
      (SignTypeEnum.ON_WORK.value === signType && signRulePatch.value.onTime == '') ||
      (SignTypeEnum.OFF_WORK.value === signType && signRulePatch.offTime == '')
    ) {
      createMessage.warning({ title: '立即补卡失败', content: '请设置考勤规则' });
      return;
    }
    let tabForm: any = {};
    tabForm.id = null;
    tabForm.abnormalTime = signTime;
    tabForm.abnormalStatus = SignStatusEnum.NO_SIGN.text;
    tabForm.abnormalStatusValue = SignStatusEnum.NO_SIGN.value;
    tabForm.signType = signTypeText;
    tabForm.patchType = signType;
    let date = dayjs(signTime).format('YYYY-MM-DD ');
    if (signType === SignTypeEnum.ON_WORK.value) {
      tabForm.patchTime = date + signRulePatch.value.onTime + ':00';
    } else {
      tabForm.patchTime = date + signRulePatch.value.offTime + ':00';
    }
    patchData.value = tabForm;
    setFieldsValue({ ...tabForm });
    activeKey.value = 2;
  }

  /**
   * 点击确定进行补卡
   */
  function handleClickConfirmSelect() {
    let selectionRows = selectionPatchRows.value;
    if (selectionRows.length === 0) {
      return;
    }

    let { id, signTime, signType, signStatus } = selectionRows[0];
    let signTypeText = getSignType(signType);
    let signStatusText = getSignStatus(signStatus);
    let tabForm: any = {};
    tabForm.id = id;
    tabForm.abnormalTime = signTime;
    tabForm.abnormalStatus = signStatusText;
    tabForm.signType = signTypeText;
    tabForm.patchType = signType;
    let date = dayjs(signTime).format('YYYY-MM-DD ');
    if (signType === SignTypeEnum.ON_WORK.value) {
      tabForm.patchTime = date + signRulePatch.value.onTime + ':00';
    } else {
      tabForm.patchTime = date + signRulePatch.value.offTime + ':00';
    }
    patchData.value = tabForm;
    setFieldsValue({ ...tabForm });
    activeKey.value = 2;
  }

  /**
   * 返回重选
   */
  function handleClickReselect() {
    activeKey.value = 1;
  }

  /**
   * 弹窗关闭事件
   */
  function handleCancel() {
    selectionPatchRows.value = [];
    activeKey.value = 1;
    activeKeySelectType.value = 1;
    tableBtnDisabled.value = true;
    closeModal();
  }

  /**
   * 表单提交事件
   */
  async function handleClickSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      let type = 1;
      if (patchData.value.abnormalStatusValue === SignStatusEnum.NO_SIGN.value) {
        type = 2;
      }
      let formData = {
        signInfoId: patchData.value.id,
        signTime: patchData.value.patchTime,
        signType: patchData.value.patchType,
        patchReason: values.patchReason,
      };
      await addPatchOrMissingPatch(formData, type)
        .then((res) => {
          if (res.success) {
            //关闭弹窗
            handleCancel();
            createMessage.success('添加补卡信息成功');
          } else {
            throw res.message;
          }
        })
        .catch((e) => {
          createMessage.warning({ title: '添加补卡信息失败', content: (e || {}).message || e });
        })
        .finally(() => {
          loading.value = false;
        });

      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 获取同步假期
   */
  async function query() {
    await getSyncHoliday({ type: 'rest' }).then((res) => {
      let restArr = res.result.restHoliday;
      restHoliday.value = restArr.map(function (value, index, restArr) {
        return dayjs(value, 'YYYY-MM-DD');
      });
    });
  }

  /**
   * 单选按钮点击事件
   * @param selectedRowKeys
   * @param selectionRows
   */
  function patchSelectionChange({ keys, rows }) {
    if (rows && rows.length > 0) {
      tableBtnDisabled.value = false;
    } else {
      tableBtnDisabled.value = true;
    }
    selectionPatchRows.value = rows;
  }

  watch(calendarValue, () => {
    //获取补缺卡
    queryMissingSignInfo();
  });

  onMounted(() => {
    //获取同步假期
    query();
  });
</script>

<style lang="less" scoped>
  .hide-tabs-bar {
    & > :deep(.ant-tabs-nav) {
      display: none;
    }
  }

  .bottom-btn {
    width: 100%;
    background: #fff;
    text-align: right;
    padding-top: 10px;

    &.border {
      border-top: 1px solid #e9e9e9;
    }
  }
</style>
