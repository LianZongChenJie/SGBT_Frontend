<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="44%">
    <div :class="['shift-modal', { 'shift-modal--detail': isDisabled }]">
      <div v-if="isDisabled" class="shift-detail-hero">
        <div class="shift-detail-hero__main">
          <div class="shift-detail-hero__eyebrow">班次详情</div>
          <div class="shift-detail-hero__title">{{ detailData.planName || '--' }}</div>
          <div class="shift-detail-hero__meta">
            <span class="shift-chip">{{ detailData.planCode || '--' }}</span>
            <span class="shift-chip">{{ detailData.sysOrgName || detailDeptName || detailData.sysOrgCode || '--' }}</span>
            <span class="shift-chip">{{ shiftTimeRange }}</span>
          </div>
        </div>
        <div class="shift-detail-hero__side">
          <div class="shift-stat">
            <span class="shift-stat__label">工时</span>
            <span class="shift-stat__value">{{ detailData.workHours ?? '--' }}<small>小时</small></span>
          </div>
          <div class="shift-stat">
            <span class="shift-stat__label">延时/提前</span>
            <span class="shift-stat__value">{{ detailData.startDelay ?? 0 }}/{{ detailData.endAhead ?? 0 }}<small>分钟</small></span>
          </div>
        </div>
      </div>
      <div v-if="isDisabled" class="shift-detail-panel__header">
        <div>
          <div class="shift-detail-panel__eyebrow">基础信息</div>
          <div class="shift-detail-panel__title">班次规则与参数</div>
        </div>
        <div class="shift-detail-panel__hint">以下内容为当前班次的生效配置</div>
      </div>
      <div v-if="isDisabled" class="shift-detail-sheet">
        <div class="shift-detail-sheet__grid">
          <div class="shift-detail-item">
            <div class="shift-detail-item__label">班次名称</div>
            <div class="shift-detail-item__value">{{ detailData.planName || '--' }}</div>
          </div>
          <div class="shift-detail-item">
            <div class="shift-detail-item__label">班次编码</div>
            <div class="shift-detail-item__value">{{ detailData.planCode || '--' }}</div>
          </div>
          <div class="shift-detail-item">
            <div class="shift-detail-item__label">上班时间</div>
            <div class="shift-detail-item__value">{{ detailData.planStart || '--' }}</div>
          </div>
          <div class="shift-detail-item">
            <div class="shift-detail-item__label">下班时间</div>
            <div class="shift-detail-item__value">
              {{ detailData.planEnd || '--' }}
              <span v-if="detailData.planNextDay" class="shift-detail-item__badge">次日</span>
            </div>
          </div>
          <div class="shift-detail-item">
            <div class="shift-detail-item__label">所属部门</div>
            <div class="shift-detail-item__value">{{ detailData.sysOrgName || detailDeptName || '--' }}</div>
          </div>
          <div class="shift-detail-item">
            <div class="shift-detail-item__label">工时</div>
            <div class="shift-detail-item__value">{{ detailData.workHours ?? '--' }} 小时</div>
          </div>
          <div class="shift-detail-item">
            <div class="shift-detail-item__label">上班可延时</div>
            <div class="shift-detail-item__value">{{ detailData.startDelay ?? 0 }} 分钟</div>
          </div>
          <div class="shift-detail-item">
            <div class="shift-detail-item__label">下班可提前</div>
            <div class="shift-detail-item__value">{{ detailData.endAhead ?? 0 }} 分钟</div>
          </div>
        </div>
        <div class="shift-detail-note">
          <div class="shift-detail-note__label">备注</div>
          <div class="shift-detail-note__value">{{ detailData.remark || '暂无备注' }}</div>
        </div>
      </div>
      <BasicForm v-else @register="registerForm" :disabled="isDisabled">
        <template #planEndWithNextDay="{ model, field }">
          <div class="shift-time-field">
            <a-time-picker
              v-model:value="model[field]"
              class="shift-time-field__picker"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="请选择下班时间"
              :disabled="isDisabled"
              allow-clear
            />
            <div class="shift-time-field__next-day">
              <span class="shift-time-field__label">次日</span>
              <a-switch v-model:checked="model.planNextDay" :checked-value="1" :un-checked-value="0" :disabled="isDisabled" />
            </div>
          </div>
        </template>
      </BasicForm>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './demo.data';
  import { saveOrUpdateDemo, getDemoById, resolveDeptName } from './demo.api';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const detailData = ref<Record<string, any>>({});
  const detailDeptName = ref('');

  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    //labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    detailData.value = {};
    detailDeptName.value = '';
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      //获取详情
      data.record = await getDemoById({ id: data.record.id });
      detailDeptName.value = (await resolveDeptName(data.record.sysOrgCode)) || data.record.sysOrgName || '';
      detailData.value = {
        ...data.record,
        sysOrgName: detailDeptName.value || data.record.sysOrgName || data.record.sysOrgCode,
      };
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
  });
  //设置标题
  const title = computed(() => {
    if (props.isDisabled) {
      return '详情';
    }
    return !unref(isUpdate) ? '新增' : '编辑';
  });

  const shiftTimeRange = computed(() => {
    const start = detailData.value?.planStart || '--';
    const end = detailData.value?.planEnd || '--';
    const nextDay = detailData.value?.planNextDay ? ' 次日' : '';
    return `${start} - ${end}${nextDay}`;
  });

  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      values.sysOrgCode = Array.isArray(values.sysOrgCode) ? values.sysOrgCode[0] : values.sysOrgCode;
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemo(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style scoped lang="less">
  .shift-modal--detail {
    :deep(.ant-form) {
      margin-top: 14px;
    }
  }

  .shift-detail-panel__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-top: 18px;
    padding: 0 6px;
  }

  .shift-detail-panel__eyebrow {
    margin-bottom: 6px;
    color: #5d7390;
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  .shift-detail-panel__title {
    color: #18324d;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .shift-detail-panel__hint {
    color: #7c8ea5;
    font-size: 13px;
    white-space: nowrap;
  }

  .shift-detail-sheet {
    margin-top: 14px;
    padding: 26px;
    border: 1px solid #d9e5f2;
    border-radius: 22px;
    background:
      linear-gradient(180deg, rgba(246, 250, 255, 0.95) 0%, #ffffff 100%),
      linear-gradient(135deg, rgba(50, 109, 164, 0.08) 0%, rgba(255, 255, 255, 0) 45%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.85),
      0 14px 36px rgba(27, 64, 103, 0.08);
  }

  .shift-detail-sheet__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 24px;
  }

  .shift-detail-item {
    padding-bottom: 14px;
    border-bottom: 1px solid #edf2f7;
  }

  .shift-detail-item__label {
    margin-bottom: 8px;
    color: #6a7f98;
    font-size: 13px;
    font-weight: 600;
  }

  .shift-detail-item__value {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #18324d;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
    word-break: break-word;
  }

  .shift-detail-item__badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 999px;
    color: #29527f;
    background: #eaf3fb;
    font-size: 12px;
    font-weight: 600;
  }

  .shift-detail-note {
    margin-top: 24px;
    padding: 18px 20px;
    border-radius: 16px;
    background: rgba(240, 246, 252, 0.85);
  }

  .shift-detail-note__label {
    margin-bottom: 8px;
    color: #6a7f98;
    font-size: 13px;
    font-weight: 600;
  }

  .shift-detail-note__value {
    color: #27415f;
    font-size: 15px;
    line-height: 1.7;
    word-break: break-word;
  }

  .shift-detail-hero {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 22px;
    border-radius: 18px;
    background: linear-gradient(135deg, #113a64 0%, #1d5d93 48%, #4b89bd 100%);
    color: #fff;
  }

  .shift-detail-hero__main {
    min-width: 0;
    flex: 1;
  }

  .shift-detail-hero__eyebrow {
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  .shift-detail-hero__title {
    margin-bottom: 14px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }

  .shift-detail-hero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .shift-detail-hero__side {
    display: grid;
    min-width: 176px;
    gap: 12px;
  }

  .shift-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(6px);
    font-size: 13px;
  }

  .shift-stat {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 16px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
  }

  .shift-stat__label {
    color: rgba(255, 255, 255, 0.76);
    font-size: 12px;
  }

  .shift-stat__value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.1;
  }

  .shift-stat__value small {
    margin-left: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .shift-time-field {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .shift-time-field__picker {
    flex: 1;
    min-width: 0;
  }

  .shift-time-field__next-day {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border: 1px solid #d9e1ec;
    border-radius: 6px;
    background: #f8fafc;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .shift-time-field__next-day:hover {
    border-color: #91caff;
    background: #f0f7ff;
  }

  .shift-time-field__label {
    color: #303133;
    font-size: 14px;
    line-height: 1;
  }

  @media (max-width: 768px) {
    .shift-detail-hero {
      flex-direction: column;
    }

    .shift-detail-panel__header {
      flex-direction: column;
      align-items: flex-start;
    }

    .shift-detail-sheet {
      padding: 20px;
    }

    .shift-detail-sheet__grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .shift-detail-hero__side {
      min-width: 0;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
