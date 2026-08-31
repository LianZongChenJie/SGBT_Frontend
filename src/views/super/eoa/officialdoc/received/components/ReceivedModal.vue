<template>
  <BasicModal class="ant-modal-body" @register="registerModal" :title="title" destroyOnClose :width="1200">
    <a-spin :spinning="spinning">
      <a-form ref="formRef" :model="formState" :rules="rules">
        <a-card id="staffCard" class="ant-card ant-card-bordered antd-card-width">
          <span id="staffLeaveTitle">公文收文</span>
          <table id="staffEvectionTable">
            <tr>
              <td class="table-left-border">
                <span class="star-color">*</span>
                <span class="inputHeight">来文单位：</span>
              </td>
              <td class="title">
                <a-form-item name="sourceUnit">
                  <a-input v-model:value="formState.sourceUnit" placeholder="请输入来文单位" class="inputHeight" />
                </a-form-item>
              </td>
              <td><span class="span-margin-left inputHeight">收文日期：</span></td>
              <td>
                <a-form-item name="receiptDate" class="text-left">
                  <a-date-picker
                    v-model:value="formState.receiptDate"
                    class="inputHeight"
                    placeholder="请选择收文日期"
                    style="width: 52%; text-align: left; margin-left: 10px"
                  />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span class="star-color">*</span>
                <span class="inputHeight">文件标题：</span>
              </td>
              <td colspan="3">
                <a-form-item name="title">
                  <a-input v-model:value="formState.title" placeholder="请输入文件标题" class="inputHeight" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>缓急：</span>
              </td>
              <td>
                <a-form-item name="urgency" class="inputHeight select-width text-left">
                  <j-dict-select-tag dictCode="urgency" placeholder="请选择缓急" v-model:value="formState.urgency" />
                </a-form-item>
              </td>
              <td style="text-align: center">
                <span>密级：</span>
              </td>
              <td>
                <a-form-item name="secretLevel" class="inputHeight select-width text-left">
                  <j-dict-select-tag dictCode="secret_level" placeholder="请选择密级" v-model:value="formState.secretLevel" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>收文编号：</span>
              </td>
              <td class="title" name="receiptCode">
                <a-form-item name="receiptCode">
                  <a-input v-model:value="formState.receiptCode" placeholder="请输入收文编号" class="inputHeight" />
                </a-form-item>
              </td>
              <td>
                <span class="star-color">*</span>
                <span>来文字号：</span>
              </td>
              <td class="title">
                <a-form-item name="issuedCode">
                  <a-input v-model:value="formState.issuedCode" placeholder="请输入来文字号" class="inputHeight" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span class="star-color">*</span>
                <span>公文内容：</span>
              </td>
              <td colspan="3">
                <a-form-item name="officialContents">
                  <JUpload
                    :text="uploadText"
                    :bizPath="DrafTextPath"
                    v-model:value="formState.officialContents"
                    :multiple="false"
                    :maxCount="1"
                    placeholder="请输入公文内容"
                  />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>发文附件：</span>
              </td>
              <td colspan="3">
                <a-form-item name="fileUrl">
                  <JUpload
                    :text="uploadText"
                    :bizPath="filePath"
                    v-model:value="formState.fileUrl"
                    :multiple="false"
                    :maxCount="1"
                    placeholder="请输入发文附件"
                  />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>拟办意见：</span>
              </td>
              <td style="text-align: center" colspan="3">
                <a-form-item name="draftOpinion">
                  <a-textarea v-model:value="formState.draftOpinion" placeholder="请输入拟办意见" class="textType" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>办公室领导意见：</span>
              </td>
              <td colspan="3">
                <a-form-item name="officeComments">
                  <a-textarea v-model:value="formState.officeComments" placeholder="请输入办公室领导意见" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>主办部门意见：</span>
              </td>
              <td colspan="3">
                <a-form-item name="sponsorComments">
                  <a-textarea v-model:value="formState.sponsorComments" placeholder="请输入主办部门意见" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>协办部门意见：</span>
              </td>
              <td colspan="3">
                <a-form-item name="coSponsorComments">
                  <a-textarea v-model:value="formState.coSponsorComments" placeholder="请输入协办部门意见" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>领导审核意见：</span>
              </td>
              <td colspan="3">
                <a-form-item name="leaderInstructions">
                  <a-textarea v-model:value="formState.leaderInstructions" placeholder="请输入领导审核意见" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span class="star-color">*</span>
                <span>传阅部门：</span>
              </td>
              <td colspan="3" class="title">
                <a-form-item name="circulationDepts">
                  <SelectDepart v-model:value="formState.circulationDepts" @departOk="clearDeptFrom" />
                </a-form-item>
              </td>
            </tr>
          </table>
        </a-card>
      </a-form>
    </a-spin>
    <template #footer>
      <a-button key="back" @click="handleCancel"> 关闭 </a-button>
      <a-button key="submit" type="primary" @click="handleSaveDrafts"> 保存草稿 </a-button>
      <a-button key="send" type="primary" @click="handleSubmit"> 发送 </a-button>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, unref, UnwrapRef, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useForm } from '/@/components/Form';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import SelectDepart from './SelectDepart.vue';
  import dayjs from 'dayjs';
  import { getReceiptCode, saveOrUpdate } from '../received.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { startProcess } from '/@/views/super/eoa/officialdoc/issued/issued.api';

  const formState = reactive({
    sourceUnit: '',
    //update-begin---author:wangshuai ---date:20220523  for：[QQYUN-4291]收文日期 显示问题------------
    receiptDate: dayjs(dayjs(new Date()).format('YYYY-MM-DD')),
    //update-end---author:wangshuai ---date:20220523  for：[QQYUN-4291]收文日期 显示问题------------
    title: '',
    urgency: '',
    secretLevel: '',
    receiptCode: '',
    issuedCode: '',
    officialContents: '',
    fileUrl: '',
    draftOpinion: '',
    circulationDepts: '',
    officeComments: '',
    sponsorComments: '',
    coSponsorComments: '',
    leaderInstructions: '',
  });
  const DrafTextPath = 'draftText';
  const filePath = 'enclosure';
  const formRef = ref();
  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'success']);
  //更新
  const isUpdate = ref<boolean>(false);
  //标题
  const title = ref<string>('');
  const spinning = ref<boolean>(false);
  const uploadText = ref('点击上传');
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    spinning.value = true;
    setModalProps({ confirmLoading: false, minHeight: 1050 });
    isUpdate.value = !!data?.isUpdate;
    setModalProps({ confirmLoading: false });
    title.value = unref(isUpdate) ? '编辑收文' : '新增收文';
    if (unref(isUpdate)) {
      //编辑的时候为formState赋值
      data.record.receiptDate = dayjs(data.record.receiptDate, 'YYYY-MM-DD');
      Object.assign(formState, data.record);
    } else {
      //新增的时候获取收文编码
      let result = await getReceiptCode();
      if (result) {
        formState.receiptCode = result;
      }
    }
    spinning.value = false;
  });

  //验证规则
  const rules = {
    sourceUnit: [{ required: true, message: '请填写来文单位!', trigger: 'change' }],
    title: [{ required: true, message: '请填写标题!', trigger: 'change' }],
    receiptCode: [{ required: true, message: '请填写收文编号!', trigger: 'change' }],
    issuedCode: [{ required: true, message: '请填写来文字号!', trigger: 'change' }],
    circulationDepts: [{ required: true, message: '请选择部门' }],
  };

  /**
   *发送按钮提交
   */
  function handleSubmit() {
    submitForm('1');
  }

  /**
   *保存到草稿箱
   */
  function handleSaveDrafts() {
    submitForm('0');
  }

  /**
   * 表单提交
   */
  async function submitForm(status) {
    formRef.value.validate().then(async () => {
      let params: any = toRaw(formState);
      if (!formState.officialContents) {
        createMessage.warning('请上传公文内容!');
        return;
      }
      let circulationDepts: any = params.circulationDepts;
      if (circulationDepts instanceof Array) {
        const str = ref('');
        circulationDepts.forEach((item) => {
          str.value = str.value + item + ',';
        });
        str.value = str.value.substr(0, str.value.length - 1);
        params.circulationDepts = str.value;
      }
      params.stauts = status;
      params.bpmStatus = '1';
      const result = await saveOrUpdate(params, unref(isUpdate));
      //状态是1时，发起流程
      if (status == '1') {
        let id = unref(isUpdate) ? params.id : result;
        handleStartProcess(id);
      }
      emit('success');
      handleCancel();
    });
  }

  /**
   * 发起流程
   */
  function handleStartProcess(id) {
    const flowCode = 'dev_oa_officialdoc_received_001';
    let param = {
      flowCode: flowCode,
      id: id,
      formUrl: 'super/eoa/officialdoc/received/components/ReceivedForm',
      formUrlMobile: 'super/eoa/officialdoc/received/components/ReceivedForm',
    };
    startProcess(param).then((res) => {
      console.log('res', res);
      if (res.success) {
        createMessage.success(res.message);
        emit('success');
        handleCancel();
      } else {
        createMessage.warning(res.message);
      }
    });
  }
  /**
   * 清除选择部门的验证
   */
  function clearDeptFrom(selectValues) {
    let fromValue = toRaw(formState);
    let selectVal = toRaw(selectValues);
    formState.circulationDepts = selectVal.value;
    let circulationDepts = fromValue.circulationDepts;
    if (circulationDepts && circulationDepts.length > 0) {
      formRef.value.clearValidate('circulationDepts');
    } else {
      formRef.value.validate(['circulationDepts']);
    }
  }

  function handleCancel() {
    closeModal();
    formRef.value && formRef.value?.resetFields();
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
    padding-bottom: 40px;
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

  .star-color {
    color: red;
    margin-right: 2px;
    top: 5px;
    font-size: 18px;
    position: relative;
  }
</style>
