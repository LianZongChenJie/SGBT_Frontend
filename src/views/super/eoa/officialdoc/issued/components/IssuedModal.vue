<template>
  <BasicModal @cancel="handleCancel" class="ant-modal-body" @register="registerModal" :title="title" destroyOnClose :width="1200">
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
                    @change="codeChange"
                    dictCode="oa_officialdoc_organcode,organ_name,id"
                    placeholder="请选择机关代字"
                    v-model:value="formState.organId"
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
                  <a-input v-model:value="formState.code" class="inputHeight" placeholder="请输入文号" />
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
                <span>部门会签：</span>
              </td>
              <td colspan="3">
                <a-form-item name="jointlySigns">
                  <a-textarea v-model:value="formState.jointlySigns" class="textType" readonly></a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>领导会签：</span>
              </td>
              <td colspan="3">
                <a-form-item name="leaderJointlySigns">
                  <a-textarea v-model:value="formState.leaderJointlySigns" class="textType" readonly></a-textarea>
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
                  <j-select-user-by-dept v-model:value="formState.draftUser" placeholder="请选择拟稿人" :maxSelectCount="1"></j-select-user-by-dept>
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
                  <JSelectDept v-model:value="formState.draftDept" :checkStrictly="true" :multiple="false" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>拟稿人意见：</span>
              </td>
              <td colspan="3">
                <a-form-item>
                  <a-textarea v-model:value="formState.draftUserOpinion" class="textType" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>办公室核稿意见：</span>
              </td>
              <td colspan="3">
                <a-form-item>
                  <a-textarea v-model:value="formState.reviewUserOpinion" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>办公室领导核稿意见：</span>
              </td>
              <td colspan="3">
                <a-form-item>
                  <a-textarea v-model:value="formState.officeLeadersOption" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>主办单位审核：</span>
              </td>
              <td colspan="3">
                <a-form-item>
                  <a-textarea v-model:value="formState.sponsorReview" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>秘书审核：</span>
              </td>
              <td colspan="3">
                <a-form-item>
                  <a-textarea v-model:value="formState.secretaryReview" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>校对意见：</span>
              </td>
              <td colspan="3">
                <a-form-item>
                  <a-textarea v-model:value="formState.proofreadUser" class="textType" readonly />
                </a-form-item>
              </td>
            </tr>

            <tr>
              <td>
                <span>打印份数：</span>
              </td>
              <td colspan="3">
                <a-form-item name="printingNumber">
                  <InputNumber v-model:value="formState.printingNumber" placeholder="请输入打印份数" class="inputHeight" style="width: 100%" />
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
                  <a-input v-model:value="formState.title" placeholder="请输入标题" class="inputHeight" />
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
                  <SelectDepart v-model:value="formState.mainDelivery" placeholder="请选择主送部门" @departOk="clearDeptFrom"></SelectDepart>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>抄送：</span>
              </td>
              <td colspan="3">
                <a-form-item name="ccDelivery">
                  <SelectDepart v-model:value="formState.ccDelivery" placeholder="请选择抄送部门" @departOk="clearDeptFrom" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td>
                <span>附件：</span>
              </td>
              <td colspan="3">
                <a-form-item name="fileUrl">
                  <JUpload v-model:value="formState.fileUrl" text="附件上传" :bizPath="filePath" />
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
      <a-button :loading="btnLoading" type="primary" key="draftText" @click="draftTextClick"> 起草正文 </a-button>
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
  import SelectDepart from '../../received/components/SelectDepart.vue';
  import JSelectUserByDept from '/@/components/Form/src/jeecg/components/JSelectUserByDept.vue';
  import JSelectDept from '/@/components/Form/src/jeecg/components/JSelectDept.vue';
  import { InputNumber } from 'ant-design-vue';
  import { getCode, getTemplateAndUser, saveOrUpdate, officialTemp, getDepartId, startProcess } from '../issued.api';
  import { getViewWpsUrl } from '../../template/wps.file.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  const formState = reactive({
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
  const btnLoading = ref(false);
  const router = useRouter();
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
  const userStore = useUserStore();
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    spinning.value = true;
    setModalProps({ confirmLoading: false, minHeight: 1300 });
    isUpdate.value = !!data?.isUpdate;
    setModalProps({ confirmLoading: false });
    title.value = unref(isUpdate) ? '编辑发文' : '新增发文';
    if (unref(isUpdate)) {
      //编辑的时候为formState赋值
      Object.assign(formState, data.record);
    } else {
      //update-begin---author:wangshuai ---date:20220411  for：[VUEN-668]发文拟稿人默认当前登录人------------
      //新增的时候复制默认拟稿人和拟稿部门
      setDraftUserAndDep();
      //update-end---author:wangshuai ---date:20220411  for：[VUEN-668]发文拟稿人默认当前登录人--------------
    }
    spinning.value = false;
  });

  //验证规则
  const rules = {
    organId: [{ required: true, message: '请选择机关代字!', trigger: 'change' }],
    title: [{ required: true, message: '请填写标题!', trigger: 'change' }],
    code: [{ required: true, message: '请输入文号!', trigger: 'change' }],
    mainDelivery: [{ required: true, message: '请选择主送!' }],
  };

  /**
   * 机关代字选择事件
   * @param value 机关代字
   */
  async function codeChange(value) {
    if (value) {
      const code = await getCode({ organId: value });
      formState.code = code;
    } else {
      formState.code = '';
    }
    formRef.value.validate(['code']);
  }

  /**
   *发送按钮提交
   */
  function handleSubmit() {
    send('1');
  }

  /**
   *保存到草稿箱
   */
  function handleSaveDrafts() {
    send('0');
  }

  /**
   *获取正确ids（部门id，用户id）
   */
  function getIds(ids) {
    const str = ref('');
    ids.forEach((item) => {
      str.value = str.value + item + ',';
    });
    str.value = str.value.substr(0, str.value.length - 1);
    return str.value;
  }

  /**
   * 表单提交
   * @params status 发文状态 0草稿箱 1 发送
   */
  async function send(status) {
    formRef.value.validate().then(async () => {
      let params = toRaw(formState);
      if (!params.draftUser) {
        createMessage.warning('请选择拟稿人');
        return;
      }
      if (!params.draftDept) {
        createMessage.warning('请选择拟稿部门');
        return;
      }
      //先判断是否起草正文
      const res = await officialTemp({ code: params.code });
      console.log('起草正文>res', res);
      if (res.success) {
        saveOrUpdateIssued(params, status);
      } else {
        createMessage.warning(res.message);
        return;
      }
    });
  }

  /**
   * 新建和更新公文发文
   * @param params 参数
   * @params status 发文状态 0草稿箱 1 发送
   */
  async function saveOrUpdateIssued(params, status) {
    if (params.mainDelivery instanceof Array) {
      const str = getIds(params.mainDelivery);
      params.mainDelivery = str;
    }
    if (params.draftDept instanceof Array) {
      const str = getIds(params.draftDept);
      params.draftDept = str;
    }
    if (params.draftUser instanceof Array) {
      const str = getIds(params.draftUser);
      params.draftUser = str;
    }
    if (params.ccDelivery instanceof Array) {
      const str = getIds(params.ccDelivery);
      params.ccDelivery = str;
    }
    params.stauts = status;
    params.bpmStatus = '1';
    const result = await saveOrUpdate(params, unref(isUpdate));
    console.log('result', result);
    if (status == '1') {
      let id = unref(isUpdate) ? params.id : result;
      handleStartProcess(id);
    }
    emit('success');
    handleCancel();
  }

  /**
   * 发起流程逻辑
   */
  function handleStartProcess(id) {
    const flowCode = 'officialdoc_issued';
    let param = {
      flowCode: flowCode,
      id: id,
      formUrl: 'super/eoa/officialdoc/issued/components/IssuedForm',
      formUrlMobile: 'super/eoa/officialdoc/issued/components/IssuedForm',
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
   * 起草正文
   */
  function draftTextClick() {
    let organId = formState.organId;
    if (organId) {
      //根据机关代字获取绑定的word在线访问路径
      const code = formState.code;
      const text = 'official';
      btnLoading.value = true;
      getTemplateAndUser({ codeId: organId, text: text, code: code }).then((res) => {
        if (res.success) {
          const params = {
            fileId: res.result.tempId,
            userId: res.result.userId,
            //update-begin---author:wangshuai ---date:20220411  for：[VUEN-673]起草正文时新加的内容没有------------
            text: text,
            //update-end---author:wangshuai ---date:20220411  for：[VUEN-673]起草正文时新加的内容没有--------------
          };
          getViewWpsUrl(params).then((res) => {
            let routeUrl = router.resolve({
              path: '/wps/viewFile',
            });
            sessionStorage.setItem('WPS_URL', res.data.wpsUrl);
            window.open(routeUrl.href, '_blank');
          });
          btnLoading.value = false;
        }
      });
    }
  }

  /**
   * 清除选择主送部门的验证
   * @param selectValues 选中的部门id
   */
  function clearDeptFrom(selectValues) {
    let fromValue = toRaw(formState);
    let selectVal = toRaw(selectValues);
    formState.mainDelivery = selectVal.value;
    let circulationDepts = fromValue.mainDelivery;
    if (circulationDepts && circulationDepts.length > 0) {
      formRef.value.clearValidate('mainDelivery');
    } else {
      formRef.value.validate(['mainDelivery']);
    }
  }

  /**
   * 取消点击事件
   */
  function handleCancel() {
    //update-begin---author:wangshuai ---date:20220412  for：[VUEN-672]发文草稿箱编辑时拟稿人显示用户名------------
    formRef.value && formRef.value?.resetFields();
    closeModal();
    //update-end---author:wangshuai ---date:20220412  for：[VUEN-672]发文草稿箱编辑时拟稿人显示用户名------------
  }

  /**
   * 新增的时候设置拟稿部门和拟稿人
   */
  function setDraftUserAndDep() {
    getDepartId({ sysCode: userStore.getUserInfo.orgCode }).then((res) => {
      if (res.success) {
        formState.draftUser = userStore.getUserInfo.username;
        formState.draftDept = res.result;
      }
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
