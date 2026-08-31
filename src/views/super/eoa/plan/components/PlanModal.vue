<template>
  <BasicModal wrapClassName="plan-modal" v-bind="$attrs" :body-style="{padding:'0 30px 0 24px'}" :title="getTitle" :width="1000" v-model:visible="visible" :defaultFullscreen="isUpdate" :enableComment="isUpdate">
    <a-form
      ref="formEl"
      :model="planModel"
      :label-col="{ xs: { span: 24 }, sm: { span: 5 } }"
      :wrapper-col="{ xs: { span: 24 }, sm: { span: 18 } }"
      :rules="validatorRules"
    >
      <a-divider orientation="left" style="margin-bottom: 40px">基本信息</a-divider>
      <a-row>
        <a-col :span="12">
          <a-form-item label="日程标题" name="title">
            <a-input placeholder="请输入标题" v-model:value="planModel.title" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="日程类型" name="type">
            <JDictSelectTag placeholder="请选择类型" type="select" v-model:value="planModel.type" dictCode="eoa_plan_type" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="提醒类型" name="remindType">
            <a-select placeholder="请选择提醒类型" mode="multiple" v-model:value="planModel.remindType">
              <a-select-option value="1">邮件</a-select-option>
              <a-select-option value="2">短信</a-select-option>
              <a-select-option value="4">系统消息</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="紧急程度" name="urgentLevel">
            <JDictSelectTag placeholder="请选择紧急程度" type="select" v-model:value="planModel.urgentLevel" dictCode="urgent_level" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="提醒时间" name="remind">
            <JDictSelectTag placeholder="请选择提醒时间" type="select" v-model:value="planModel.remind" dictCode="remindTime" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="重复提醒" name="reminders">
            <JDictSelectTag placeholder="请选择重复提醒" type="select" v-model:value="planModel.reminders" dictCode="reminders" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="日程时间" name="rangeTime">
            <a-range-picker v-bind="dateRangePickerProps" v-model:value="planModel.rangeTime" />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="是否全天">
            <JCheckbox :options="[{ value: '1' }]" v-model:value="planModel.allDay" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-divider orientation="left" style="margin-bottom: 40px">其他信息</a-divider>
      <a-row>
        <a-col :span="12">
          <a-form-item label="颜色">
            <a-tooltip class="setting-drawer-theme-color-colorBlock" v-for="(item, index) in colorList" :key="index">
              <template #title>
                {{ item.key }}
              </template>
              <a-tag :color="item.color" @click="planModel.planColor = item.color">
                <a-icon type="check" v-if="item.color === planModel.planColor"></a-icon>
              </a-tag>
            </a-tooltip>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="参与人">
            <JSelectUserByDept v-model:value="planModel.joinPerson"></JSelectUserByDept>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item :labelCol="{ xs: { span: 24 }, sm: { span: 3 } }" :wrapperCol="{ xs: { span: 24 }, sm: { span: 20 } }" label="备注">
            <JEditor placeholder="请输入备注" v-model:value="planModel.remark" :showImageUpload="false" :height="200" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <template #footer>
      <a-button key="back" @click="close">取消</a-button>
      <PopConfirmButton
        v-if="planModel.id"
        type="primary"
        danger
        :loading="confirmLoading"
        title="您确定要删除日程安排吗？"
        @confirm="handleDelete"
        okText="确定"
        cancelText="取消"
        >删除</PopConfirmButton
      >
      <a-button type="primary" @click="handleSubmit">确认</a-button>
    </template>
    <template #comment>
      <CommentPanel table-name="eoa_plan" :data-id="planModel.id"></CommentPanel>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import BasicModal from '/@/components/Modal/src/BasicModal.vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
  import { dateUtil } from '/@/utils/dateUtil';
  import { isString } from '/@/utils/is';
  import { colorList } from '../plan.data';
  import { saveOrUpdatePlan, deletePlan, queryById } from '../plan.api';
  import CommentPanel from '/@/components/jeecg/comment/CommentPanel.vue';

  //异步引入组件，为了兼容拖拽问题
  const JCheckbox = createAsyncComponent(() => import('/@/components/Form/src/jeecg/components/JCheckbox.vue'));
  const JDictSelectTag = createAsyncComponent(() => import('/@/components/Form/src/jeecg/components/JDictSelectTag.vue'));
  const JSelectUserByDept = createAsyncComponent(() => import('/@/components/Form/src/jeecg/components/JSelectUserByDept.vue'));
  const JEditor = createAsyncComponent(() => import('/@/components/Form/src/jeecg/components/JEditor.vue'));
  const PopConfirmButton = createAsyncComponent(() => import('/@/components/Button/src/PopConfirmButton.vue'));

  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const formEl = ref();
  const visible = ref(false);
  const confirmLoading = ref(false);
  const isUpdate = ref(true);
  //校验规则
  const validatorRules = {
    title: [{ required: true, message: '请输入标题!' }],
    rangeTime: [{ required: true, message: '请选择时间!' }],
    remindType: [{ required: true, message: '请选择提醒类型!' }],
    reminders: [{ required: true, message: '请选择重复提醒!' }],
    remind: [{ required: true, message: '请选择提醒时间!' }],
    type: [{ required: true, message: '请选择日程类型!' }],
  };
  //表单modal
  const planModel = reactive({
    id: null,
    title: '',
    type: '',
    remindType: [],
    urgentLevel: '',
    remind: '',
    reminders: '',
    rangeTime: [],
    allDay: '',
    joinPerson: '',
    planColor: '#1890FF',
    remark: '',
  });

  //标题
  const getTitle = computed(() => (!unref(isUpdate) ? '新增计划' : '编辑计划'));
  //是否全天
  const isAllDay = computed(() => planModel.allDay == '1');
  //时间选择属性
  const dateRangePickerProps = computed(() => {
    return {
      showTime: unref(isAllDay)
        ? false
        : {
            format: 'HH:mm',
            hideDisabledOptions: true,
            defaultValue: [dateUtil('00:00:00', 'HH:mm:ss'), dateUtil('00:00:00', 'HH:mm:ss')],
          },
      disabledTime: () => {
        return {
          disabledMinutes: () => dateRange(0, 59).filter((i) => ![0, 15, 30, 45].includes(i)),
        };
      },
      format: 'YYYY-MM-DD' + (unref(isAllDay) ? '' : ' HH:mm'),
    };
  });

  function dateRange(start, end) {
    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  /**
   * 重置modal
   */
  function resetModal() {
    Object.assign(planModel, {
      id: null,
      title: '',
      type: '',
      remindType: [],
      urgentLevel: '',
      remind: '',
      reminders: '',
      rangeTime: [],
      allDay: '',
      joinPerson: '',
      planColor: '#1890FF',
      remark: '',
    });
  }
  /**
   * 删除计划
   * */
  async function handleDelete() {
    confirmLoading.value = true;
    await deletePlan({ id: planModel.id }, close);
    confirmLoading.value = false;
  }
  /**
   * 关闭
   * */
  function close() {
    visible.value = false;
    emit('success');
  }
  /**
   * 表单提交事件
   * */
  async function handleSubmit() {
    formEl.value
      .validate()
      .then(async () => {
        let formData = Object.assign({}, planModel);
        //时间格式化
        let times = formData.rangeTime.map((i) => (i ? i.format('YYYY-MM-DD HH:mm:ss') : null));
        formData.startTime = times[0];
        formData.endTime = times[1];
        //是否全天
        formData.allDay = formData.allDay === '1' ? '1' : '0';
        //提醒类型
        formData.remindType = formData.remindType.join(',');
        //参与人
        formData.joinPerson = formData.joinPerson ? formData.joinPerson.join(',') : '';
        await saveOrUpdatePlan(formData, unref(isUpdate));
        close();
      })
      .catch((error: ValidateErrorEntity<any>) => {
        console.log('error', error);
      });
  }

  /**
   * 打开弹窗事件，为了兼容拖拽事件
   * @param data
   */
  async function show(data) {
    resetModal();
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      const record = await queryById({ id: data?.record?.id });
      Object.assign(planModel, record);
      //时间格式化
      if (record?.startTime && record?.endTime) {
        planModel.rangeTime = [record?.startTime, record?.endTime].map((i) => (i ? dateUtil(i) : null));
      }
      // 转换 checkbox 的值
      planModel.allDay = record?.allDay === '1' ? '1' : '';
      // 转换多选 select 的值
      planModel.remindType = record.remindType && isString(record.remindType) ? record.remindType.split(',') : [];
      // 转换joinPerson select 的值
      planModel.joinPerson = record.joinPerson && isString(record.joinPerson) ? record.joinPerson.split(',') : [];
    } else {
      if (data?.view?.type == 'dayGridMonth') {
        // 当显示月时，天数会自动加一天，故减一天
        var timestamp = data.end / 1000;
        data.end = (timestamp - 86400) * 1000;
      }
      planModel.allDay = data?.allDay ? '1' : '';
      planModel.joinPerson = data.joinPerson && isString(data.joinPerson) ? data.joinPerson.split(',') : [];
      planModel.type = '1';
      planModel.remindType = ['4'];
      planModel.remind = '0';
      planModel.reminders = '0';
      planModel.urgentLevel = '1';
      if (data?.start && data?.end) {
        planModel.rangeTime = [data?.start, data?.end].map((i) => (i ? dateUtil(i) : null));
      }
    }
    visible.value = true;
    if (unref(formEl)) {
      //update-begin---author:wangshuai ---date:20221026  for：[VUEN-2550]我的计划，添加新内容弹窗，表单验证未清空------------
      //打开弹窗，缓加载在一下
      setTimeout(()=>{
        formEl.value.clearValidate();
      },100)
      //update-end---author:wangshuai ---date:20221026  for：[VUEN-2550]我的计划，添加新内容弹窗，表单验证未清空--------------
    }
  }

  defineExpose({
    show,
  });
</script>
<style lang="less" scoped>
  .setting-drawer-theme-color-colorBlock {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    cursor: pointer;
    float: left;
    margin-right: 8px;
    padding-left: 0;
    padding-right: 0;
    text-align: center;
    color: #fff;
    font-weight: 700;

    i {
      font-size: 14px;
    }
  }
</style>
<style>
/*解决底部按钮隐藏*/
.plan-modal .jeecg-modal-content > .scroll-container{
  padding: 0 14px 14px 0 !important;
}
</style>
