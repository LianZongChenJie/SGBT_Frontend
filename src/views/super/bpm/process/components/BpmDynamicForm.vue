<template>
  <div v-if="iframeUrl" class="component_div" style="overflow-y: auto">
    <DesformView 
      v-if="designFormInfo.status" 
      class="desform-view" 
      :isOnline="false" 
      mode=""
      :url="designFormInfo.url"
      :parentNode="parentNode"
      :desformCode="designFormInfo.code"
      :dataId="designFormInfo.dataId"
    />
    <iframe v-else :src="iframeUrl" frameborder="0" width="100%" :height="height" scrolling="auto"></iframe>
  </div>
  <div v-else class="component_div">
    <Suspense v-if="path">
      <template #default>
        <component v-if="path" :is="currentComponent" :formData="formData" form-bpm></component>
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

<script lang="ts">
  /**
   * 流程动态表单
   */
  import { ref, computed, reactive } from 'vue';
  import { getToken } from '/@/utils/auth';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { importViewsFile } from '/@/utils';
  import { useGlobSetting } from '../../../../../hooks/setting';
  import { getBpmFormUrl } from "/@/utils/is";

  export default {
    name: 'BpmDynamicForm',
    props: {
      path: {
        type: String,
        default: '',
      },
      formData: {
        type: Object,
        default: () => {},
      },
      // 父级html
      parentNode: { type: Object as PropType<HTMLElement> },
    },
    setup(props) {
      const height = window.innerHeight - 120 + 'px';
      
      /**
       * 如果是表单设计器表单 需要设置一些参数
       */ 
      const designFormInfo = reactive({
        status: false,
        code: '',
        url: '',
        dataId: ''
      });
      
      /**
       * 获取表单地址
       * @type {ComputedRef<unknown>}
       * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
       */
      const iframeUrl = computed(() => {
        const { domainUrl } = useGlobSetting();
        //update:scott--date:20220830--for:注意未显示使用的const定义变量，ts编译的时候会被删掉，导致动态replace替换变量失效。
        // 将任务ID放到计算函数内部 当formData改变的时候会触发iframeUrl重复赋值
        let TASKID = props.formData.taskDefKey;
        let TOKEN = getToken();
        let DOMAIN_URL = domainUrl
        // TOKEN = NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
        
        // URL支持{{ window.xxx }}占位符变量
        //const URL = (props.path || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2));
        const URL = getBpmFormUrl(props.path, TOKEN, DOMAIN_URL, TASKID);
        if (isURL(URL)) {
          if(URL.indexOf('desform/edit/')>=0 || URL.indexOf('desform/detail/')>=0){
            designFormInfo.url = URL;
            designFormInfo.status = true;
            designFormInfo.dataId = props.formData.vars['BPM_DES_DATA_ID'];
            designFormInfo.code = props.formData.vars['BPM_DES_FORM_CODE'];
            console.log('设计器表单参数', designFormInfo)
          }else{
            designFormInfo.status = false
          }
          return URL;
        } else {
          return '';
        }
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

      /**
       * 获取组件
       * @type {ComputedRef<function(): *>}
       */
      const currentComponent = computed(() => {
        let temp = props.path;
        if (FORM_PATH_MAP[temp]) {
          temp = FORM_PATH_MAP[temp];
        }
        console.log('bpm组件名称:' + temp, 'bpm组件数据:' + props.formData);
        return createAsyncComponent(() => importViewsFile(temp));
      });

      /**
       * 判断是否URL地址
       * @param {*} s
       */
      function isURL(s) {
        return /^http[s]?:\/\/.*/.test(s);
      }

      return {
        height,
        iframeUrl,
        currentComponent,
        designFormInfo
      };
    },
  };
</script>

<style scoped></style>
