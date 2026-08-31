<template>
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
                <a-input v-model:value="formState.sourceUnit" placeholder="请输入来文单位" class="inputHeight" readonly></a-input>
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
                  :disabled="true"
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
                <a-input v-model:value="formState.title" placeholder="请输入文件标题" class="inputHeight" readonly></a-input>
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
              <span>收文编号：</span>
            </td>
            <td class="title" name="receiptCode">
              <a-form-item name="receiptCode">
                <a-input v-model:value="formState.receiptCode" placeholder="请输入收文编号" class="inputHeight" readonly></a-input>
              </a-form-item>
            </td>
            <td>
              <span class="star-color">*</span>
              <span>来文字号：</span>
            </td>
            <td class="title">
              <a-form-item name="issuedCode">
                <a-input v-model:value="formState.issuedCode" placeholder="请输入来文字号" class="inputHeight" readonly></a-input>
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
                  :disabled="true"
                ></JUpload>
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
                  :disabled="true"
                ></JUpload>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>拟办意见：</span>
            </td>
            <td style="text-align: center" colspan="3">
              <a-form-item name="draftOpinion">
                <a-textarea
                  v-model:value="formState.draftOpinion"
                  placeholder="请输入拟办意见"
                  class="textType"
                  :disabled="isDisabledAuth('received:proposed')"
                ></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>办公室领导意见：</span>
            </td>
            <td colspan="3">
              <a-form-item name="officeComments">
                <a-textarea
                  v-model:value="formState.officeComments"
                  placeholder="请输入办公室领导意见"
                  class="textType"
                  :disabled="isDisabledAuth('received:suggestions')"
                ></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>主办部门意见：</span>
            </td>
            <td colspan="3">
              <a-form-item name="sponsorComments">
                <a-textarea
                  v-model:value="formState.sponsorComments"
                  placeholder="请输入主办部门意见"
                  class="textType"
                  :disabled="isDisabledAuth('received:host')"
                ></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>协办部门意见：</span>
            </td>
            <td colspan="3">
              <a-form-item name="coSponsorComments">
                <a-textarea
                  v-model:value="formState.coSponsorComments"
                  placeholder="请输入协办部门意见"
                  class="textType"
                  :disabled="isDisabledAuth('received:co:organizers')"
                ></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <span>领导审核意见：</span>
            </td>
            <td colspan="3">
              <a-form-item name="leaderInstructions">
                <a-textarea
                  v-model:value="formState.leaderInstructions"
                  placeholder="请输入领导审核意见"
                  class="textType"
                  :disabled="isDisabledAuth('received:instructions')"
                ></a-textarea>
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
                <SelectDepart v-model:value="formState.circulationDepts" :disabled="true" />
              </a-form-item>
            </td>
          </tr>
        </table>
      </a-card>
      <a-row v-if="isRun">
        <a-col :span="24" style="text-align: center; margin-top: 10px">
          <a-button key="send" type="primary" @click="handleSubmit">提 交</a-button>
        </a-col>
      </a-row>
    </a-form>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, reactive, toRaw, computed } from 'vue';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import SelectDepart from './SelectDepart.vue';
  import { save, update, queryById } from '../received.api';
  import { usePermission } from '/@/hooks/web/usePermission';
  import dayjs from 'dayjs';

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
  const formState = reactive({
    sourceUnit: '',
    //update-begin---author:wangshuai ---date:20220523  for：[QQYUN-4291]收文日期 显示问题------------
    receiptDate: null,
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
  const fileUrl = ref([]);
  const officialContents = ref([]);
  // const { createMessage } = useMessage();
  const emit = defineEmits(['ok']);
  //权限判断
  const { isDisabledAuth, hasPermission, initBpmFormData } = usePermission();
  //标题
  const spinning = ref<boolean>(false);
  const uploadText = ref('点击上传');

  //验证规则
  const rules = {
    sourceUnit: [{ required: true, message: '请填写来文单位!', trigger: 'change' }],
    title: [{ required: true, message: '请填写标题!', trigger: 'change' }],
    receiptCode: [{ required: true, message: '请填写收文编号!', trigger: 'change' }],
    issuedCode: [{ required: true, message: '请填写来文字号!', trigger: 'change' }],
    circulationDepts: [{ required: true, message: '请选择部门' }],
  };
  /**
   * 是否执行中任务
   */
  const isRun = computed(() => {
    return props.formData.PROCESS_TAB_TYPE == 'run';
  });
  /**
   *按钮提交
   */
  function handleSubmit() {
    formRef.value.validate().then(async () => {
      spinning.value = true;
      let params: any = toRaw(formState);
      if (params.id) {
        await update(params);
      } else {
        await save(params);
      }
      emit('ok');
      spinning.value = false;
    });
  }

  /**
   * 初始化表单数据
   */
  function initFlowData() {
    console.log('表单参数formData', props.formData);
    if (props.normal === false) {
      let params = { id: props.formData.dataId };
      queryById(params).then((res) => {
        res?.success && editForm(res.result);
      });
    }
  }
  //初始化数据
  initFlowData();
  initBpmFormData(props.formData);

  // 清空 reactive 对象
  function resetFields() {
    for (const key in formState) {
      delete formState[key];
    }
  }

  function editForm(record) {
    resetFields();
    //编辑的时候为formState赋值
    record.receiptDate = dayjs(record.receiptDate, 'YYYY-MM-DD');
    Object.assign(formState, { ...record });
    officialContents.value = record?.fileUrl || [];
    fileUrl.value = record?.draftText || [];
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
