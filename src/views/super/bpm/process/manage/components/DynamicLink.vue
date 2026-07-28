<template>
  <div>
    <Suspense v-if="comp">
      <template #default>
        <component :is="comp" :formData="formData" v-if="comp" form-bpm></component>
      </template>
      <template #fallback>
        <div style="width: 100%; text-align: center; padding-top: 60px">
          <a-spin spinning tip="表单加载中..." />
        </div>
      </template>
    </Suspense>
    <div v-else>表单地址不存在</div>
  </div>
</template>
<script lang="ts" setup>
  import { defineAsyncComponent, computed, markRaw } from 'vue';
  import { importViewsFile } from '/@/utils';
  //组件接受传参
  const props = defineProps({
    path: { type: String },
    formData: { type: Object },
  });
  // 表单地址兼容vue2
  const FORM_PATH_MAP = {
    'modules/bpm/task/form/OnlineFormDetail': 'super/bpm/process/components/OnlineFormDetail',
    'modules/bpm/task/form/OnlineFormOpt': 'super/bpm/process/components/OnlineFormOpt',
    //借款申请表单
    'modules/extbpm/joa/modules/JoaLoanApplyForm': 'super/bpm/example/joa/loan/components/LoanApplyForm',
    //借款表单
    'modules/extbpm/joa/modules/JoaLoanForm': 'super/bpm/example/joa/loan/components/LoanForm',
    //出差表单
    'modules/extbpm/joa/modules/JoaBusinesStripForm': 'super/bpm/example/joa/businessTrip/components/BusinessTripForm',
    //请假表单
    'modules/extbpm/joa/modules/JoaEmployeeLeaveForm': 'super/bpm/example/joa/leave/components/LeaveForm',
    //公文表单
    'modules/extbpm/joa/modules/JoaDocSendingForm': 'super/bpm/example/joa/docSend/components/DocSendForm',
    //批量请假单
    'modules/extbpm/biz/modules/ExtBizLeaveForm': 'super/bpm/example/batch/components/BizLeaveForm',
  };
  //组件路径
  /**
   * 获取组件
   * @type {ComputedRef<function(): *>}
   */
  const comp = computed(() => {
    let temp = props.path;
    if (FORM_PATH_MAP[temp]) {
      temp = FORM_PATH_MAP[temp];
    }
    console.log('bpm组件名称:', temp);
    console.log('bpm组件数据:', props.formData);
    return defineAsyncComponent(() => importViewsFile(temp));
  });
</script>
