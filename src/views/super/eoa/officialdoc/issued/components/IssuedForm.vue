<template>
  <a-spin :spinning="spinning">
    <a-form ref="formRef" :model="formState" :rules="rules">
      <a-card id="staffCard" class="ant-card ant-card-bordered antd-card-width">
        <span id="staffLeaveTitle">公文发文</span>
        <table id="staffEvectionTable" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="width: 20%" class="table-left-border">
              <span class="star-color">*</span>
              <span class="inputHeight">机关代字：</span>
            </td>
            <td style="width: 30%">
              <a-form-item name="organId">
                <j-dict-select-tag
                  dictCode="oa_officialdoc_organcode,organ_name,id"
                  placeholder="请选择机关代字"
                  v-model:value="formState.organId"
                  :disabled="true"
                  style="width: 100%"
                />
              </a-form-item>
            </td>
            <td style="width: 20%">
              <span class="star-color">*</span>
              <span class="span-margin-left inputHeight">文号：</span>
            </td>
            <td style="width: 30%">
              <a-form-item name="code" class="text-left">
                <a-input v-model:value="formState.code" class="inputHeight" placeholder="请输入文号" :disabled="true" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>缓急：</span>
            </td>
            <td>
              <a-form-item name="urgency" class="inputHeight select-width text-left">
                <j-dict-select-tag dictCode="urgency" placeholder="请选择缓急" v-model:value="formState.urgency" :disabled="true" />
              </a-form-item>
            </td>
            <td style="text-align: center">
              <span>密级：</span>
            </td>
            <td>
              <a-form-item name="secretLevel" class="inputHeight select-width text-left">
                <j-dict-select-tag dictCode="secret_level" placeholder="请选择密级" v-model:value="formState.secretLevel" :disabled="true" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>部门会签：</span>
            </td>
            <td colspan="3">
              <a-form-item name="jointlySigns">
                <a-textarea v-model:value="formState.jointlySigns" class="textType" :disabled="isDisabledAuth('issued:jointly')"></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>领导会签：</span>
            </td>
            <td colspan="3">
              <a-form-item name="leaderJointlySigns">
                <a-textarea v-model:value="formState.leaderJointlySigns" class="textType" :disabled="isDisabledAuth('issued:leader')"></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span class="star-color">*</span>
              <span>拟稿人：</span>
            </td>
            <td colspan="3">
              <a-form-item name="draftUser">
                <j-select-user-by-dept
                  v-model:value="formState.draftUser"
                  placeholder="请选择拟稿人"
                  :maxSelectCount="1"
                  :disabled="true"
                ></j-select-user-by-dept>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span class="star-color">*</span>
              <span>拟稿部门：</span>
            </td>
            <td colspan="3">
              <a-form-item name="draftUser">
                <JSelectDept v-model:value="formState.draftDept" :checkStrictly="true" :multiple="false" :disabled="true" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>拟稿人意见：</span>
            </td>
            <td colspan="3">
              <a-form-item>
                <a-textarea v-model:value="formState.draftUserOpinion" class="textType" :disabled="true" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>办公室核稿意见：</span>
            </td>
            <td colspan="3">
              <a-form-item>
                <a-textarea v-model:value="formState.reviewUserOpinion" class="textType" :disabled="isDisabledAuth('issued:draft')" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>办公室领导核稿意见：</span>
            </td>
            <td colspan="3">
              <a-form-item>
                <a-textarea v-model:value="formState.officeLeadersOption" class="textType" :disabled="isDisabledAuth('issued:office:leaders')" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>主办单位审核：</span>
            </td>
            <td colspan="3">
              <a-form-item>
                <a-textarea v-model:value="formState.sponsorReview" class="textType" :disabled="isDisabledAuth('issued:sponsor')" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>秘书审核：</span>
            </td>
            <td colspan="3">
              <a-form-item>
                <a-textarea v-model:value="formState.secretaryReview" class="textType" :disabled="isDisabledAuth('issued:secretary')" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>校对意见：</span>
            </td>
            <td colspan="3">
              <a-form-item>
                <a-textarea v-model:value="formState.proofreadUser" class="textType" :disabled="isDisabledAuth('issued:proofreading')" />
              </a-form-item>
            </td>
          </tr>

          <tr>
            <td>
              <span>打印份数：</span>
            </td>
            <td colspan="3">
              <a-form-item name="printingNumber">
                <InputNumber
                  v-model:value="formState.printingNumber"
                  placeholder="请输入打印份数"
                  class="inputHeight"
                  style="width: 100%"
                  :disabled="true"
                />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span class="star-color">*</span>
              <span>标题：</span>
            </td>
            <td colspan="3">
              <a-form-item name="title">
                <a-input v-model:value="formState.title" placeholder="请输入标题" class="inputHeight" :disabled="true" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span class="star-color">*</span>
              <span>主送：</span>
            </td>
            <td colspan="3">
              <a-form-item name="mainDelivery">
                <SelectDepart v-model:value="formState.mainDelivery" placeholder="请选择主送部门" :disabled="true"></SelectDepart>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>抄送：</span>
            </td>
            <td colspan="3">
              <a-form-item name="ccDelivery">
                <SelectDepart v-model:value="formState.ccDelivery" placeholder="请选择抄送部门" :disabled="true" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>附件：</span>
            </td>
            <td colspan="3">
              <a-form-item name="fileUrl">
                <JUpload v-model:value="formState.fileUrl" text="附件上传" :bizPath="filePath" :disabled="true" />
              </a-form-item>
            </td>
          </tr>
        </table>
      </a-card>
      <a-col :span="24" style="text-align: center; margin-top: 20px" v-if="isRun">
        <a-button @click="handleOk" key="submit" type="primary">提 交</a-button>
        <a-button key="draftText" type="primary" @click="draftTextClick" style="margin-left: 20px" :disabled="isDisabledAuth('issued:typesetting')"
          >排 版</a-button
        >
        <a-button key="signature" type="primary" @click="signature" style="margin-left: 20px" :disabled="isDisabledAuth('issued:signature')"
          >签 章</a-button
        >
        <a-button key="red" type="primary" @click="draftTextClick" style="margin-left: 20px" :disabled="isDisabledAuth('issued:red')">套 红</a-button>
      </a-col>
    </a-form>
  </a-spin>
  <SealChooseModal @register="registerModal" @ok="chooseOk"></SealChooseModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, toRaw, computed } from 'vue';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import SelectDepart from '/@/views/super/eoa/officialdoc/received/components/SelectDepart.vue';
  import { InputNumber } from 'ant-design-vue';
  import JSelectDept from '/@/components/Form/src/jeecg/components/JSelectDept.vue';
  import JSelectUserByDept from '/@/components/Form/src/jeecg/components/JSelectUserByDept.vue';
  import { getTemplateAndUser, queryById, saveOrUpdate } from '../issued.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getViewWpsUrl } from '/@/views/super/eoa/officialdoc/template/wps.file.api';
  import { useRouter } from 'vue-router';
  import SealChooseModal from '/@/views/super/eoa/officialdoc/seal/components/SealChooseModal.vue';
  import { useModal } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  // import { useBpmFormAuth} from '/@/utils/auth/useFormAuth'
  //自定义接受参数
  const props = defineProps({
    //流程表单data
    formData: {
      type: Object,
      default: () => {},
      required: false,
    },
    //表单模式：false流程表单 true普通表单
    normal: {
      type: Boolean,
      default: false,
      required: false,
    },
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  });
  const emit = defineEmits(['ok']);
  //提示
  const { createMessage: $message } = useMessage();
  //权限判断
  const { isDisabledAuth, hasPermission, initBpmFormData } = usePermission();
  //表单数值
  const formState = reactive({
    id: null,
    organId: '',
    code: '',
    urgency: '',
    secretLevel: '',
    jointlySigns: '',
    leaderJointlySigns: '',
    draftUser: '',
    draftDept: '',
    draftUserOpinion: '',
    reviewUserOpinion: '',
    officeLeadersOption: '',
    sponsorReview: '',
    secretaryReview: '',
    proofreadUser: '',
    printingNumber: 1,
    title: '',
    mainDelivery: '',
    ccDelivery: '',
    fileUrl: '',
  });
  const filePath = 'enclosure';
  const formRef = ref();
  const fileUrl = ref([]);
  const draftText = ref([]);
  const spinning = ref<boolean>(false);
  const router = useRouter();
  const [registerModal, { openModal }] = useModal();
  //验证规则
  const rules = {
    organId: [{ required: true, message: '请选择机关代字!', trigger: 'change' }],
    title: [{ required: true, message: '请填写标题!', trigger: 'change' }],
    code: [{ required: true, message: '请输入文号!', trigger: 'change' }],
    mainDelivery: [{ required: true, message: '请选择主送!' }],
  };
  /**
   * 是否执行中任务
   */
  const isRun = computed(() => {
    return props.formData.PROCESS_TAB_TYPE == 'run';
  });
  /**
   * 初始化表单数据
   */
  function initFlowData() {
    if (props.normal === false) {
      let params = { id: props.formData.dataId };
      queryById(params).then((res) => {
        if (res.success) {
          editForm(res.result);
        }
      });
    }
  }
  //初始化数据
  initFlowData();
  //加载流程节点权限配置
  initBpmFormData(props.formData);

  // 清空 reactive 对象
  function resetFields() {
    for (const key in formState) {
      delete formState[key];
    }
  }

  //编辑表单
  function editForm(record) {
    resetFields();
    fileUrl.value = record?.fileUrl || [];
    draftText.value = record?.draftText || [];
    Object.assign(formState, { ...record });
    console.log('editForm====>>>>');
    console.log('editForm====>>>>');
    console.log('editForm====>>>>');
    console.log('props========>>>>', props);
    console.log('editForm====>>>>');
    console.log('editForm====>>>>');
    console.log('editForm====>>>>');
  }

  /**
   * 表单提交
   */
  function handleOk() {
    formRef.value.validate().then(async () => {
      let params = toRaw(formState);
      const result = await saveOrUpdate(params, params.id);
      if (result) {
        emit('ok');
      }
    });
  }

  /**
   * 排版/套红
   */
  function draftTextClick() {
    // 起草正文，在线编辑word文档模板
    let organId = formState.organId;
    if (organId) {
      //根据机关待字获取绑定的excel在线访问路径
      let code = formState.code;
      let text = 'official';
      getTemplateAndUser({ codeId: organId, text: text, code: code }).then((res) => {
        if (res.success) {
          const params = {
            fileId: res.result.tempId,
            userId: res.result.userId,
            text: 'official',
          };
          getViewWpsUrl(params).then((res) => {
            let routeUrl = router.resolve({
              path: '/wps/viewFile',
            });
            sessionStorage.setItem('WPS_URL', res.data.wpsUrl);
            window.open(routeUrl.href, '_blank');
          });
        }
      });
    } else {
      $message.warning('请选择机关待字');
    }
  }

  /**
   * 签章
   */
  function signature() {
    openModal(true, {
      id: formState.id,
    });
  }

  /**
   * 签章回调
   */
  function chooseOk(val) {
    const params = {
      fileId: val.tempId,
      userId: val.userId,
      text: 'official',
    };
    getViewWpsUrl(params).then((res) => {
      let routeUrl = router.resolve({
        path: '/wps/viewFile',
      });
      sessionStorage.setItem('WPS_URL', res.data.wpsUrl);
      window.open(routeUrl.href, '_blank');
    });
  }
</script>

<style lang="less" scoped>
  .ant-card {
    color: rgba(0, 0, 0, 0.65);
    background: #fff;
    border-radius: 2px;
  }

  .ant-card-bordered {
    border: 1px solid #e8e8e8;
  }

  .antd-card-width {
    margin: 0 auto;
    width: 1000px;
  }

  #staffCard {
    margin-top: 10px;
    margin-bottom: 10px;
    border: 1px solid #fff;
    box-shadow:
      0 0 1px 1px #aaa,
      3px 0 5px 0 #aaa,
      0 4px 7px 0 #aaa;
    border-radius: 5px;
    height: auto;
    position: relative;
    bottom: 20px;
  }

  #staffEvectionTable td {
    color: #000;
  }

  #staffLeaveTitle {
    margin-top: 1px;
    font-weight: 700;
    text-align: center;
    display: block;
    color: #000000;
    font-size: 24px;
  }

  :deep(.ant-modal-body) {
    padding: 24px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
  }

  #staffEvectionTable {
    width: 100%;
    font-size: 12px;
    text-align: center;
    background-color: #fff;
    margin-top: 10px;
    border: 1px solid #000000;
    border-spacing: 0;
    border-collapse: collapse;
  }

  #staffEvectionTable .ant-form-item {
    margin: 0;
  }

  #staffEvectionTable tr,
  th {
    border-bottom: 1px solid #000000;
  }

  #staffEvectionTable td,
  th {
    border-right: 1px solid #000000;
    border-bottom: 1px solid #000000;
  }

  #staffEvectionTable tr td:last-child {
    border-right: 0;
  }

  #staffEvectionTable tr:last-child {
    border-bottom: 0;
  }

  .span-margin-left {
    margin-left: 3px;
  }

  .select-width :deep(.ant-select) {
    width: 52% !important;
    text-align: left;
  }

  .inputHeight {
    width: 100%;
    border-radius: 0;
    background: #fff;
    margin-top: 0;
    margin-bottom: 0;
    border: none;
  }

  .textType {
    resize: none;
    height: 118px !important;
    font-size: 12px;
    border: 0 solid white;
    border-radius: 0;
    margin-bottom: 0;
  }

  :deep(.ant-modal-footer button) {
    margin-bottom: 0;
    margin-left: 8px;
  }

  #staffEvectionTable :deep(.ant-form-item-control) {
    position: relative;
    line-height: 40px;
    zoom: 1;
  }

  .text-left {
    text-align: left;
  }

  .text-left :deep(.ant-select) {
    margin-left: 10px;
  }

  :deep(.ant-form-item-explain .ant-form-item-explain-error) {
    text-align: center;
  }
  .star-color {
    color: red;
    margin-right: 2px;
    top: 5px;
    font-size: 18px;
    position: relative;
  }
  td {
    padding-left: 2px;
    padding-right: 2px;
  }
</style>
