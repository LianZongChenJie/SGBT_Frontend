<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="950px">
    <a-form ref="formRef" :model="model" :labelCol="labelCol" :wrapperCol="wrapperCol" :rules="validatorRules" style="padding-bottom: 10px">
      <JFormContainer :disabled="formDisabled">
      <a-card id="staffCard" class="ant-card">
        <span id="staffBmTitle">借款单</span>
        <table border="1px" id="staffBmTable">
          <tr>
            <td class="colfirst">借款人</td>
            <td class="secend">
              <a-form-item>
                <span class="fontiframe">{{ nickname }}</span>
              </a-form-item>
            </td>
            <td>借款人部门</td>
            <td style="width: 100px">
              <a-form-item>
                <span class="fontiframe">{{ model.departName }}</span>
              </a-form-item>
            </td>
            <td> 借款时间 </td>
            <td>
              <a-form-item>
                <a-date-picker class="input" format="YYYY-MM-DD" disabled v-model:value="model.loanTime" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td>借款金额</td>
            <td>
              <a-form-item name="loanAmount">
                <a-input-number class="smallText" v-model:value="model.loanAmount" size="small" :min="0" :max="99999999" @change="upperOnChange" />
              </a-form-item>
            </td>
            <td>金额大写</td>
            <td colspan="3">
              {{ model.upperSum }}
            </td>
          </tr>
          <tr>
            <td> 借款用途 </td>
            <td colspan="5">
              <a-form-item>
                <a-textarea v-model:value="model.loanUsage" class="textArea"></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 备注 </td>
            <td colspan="5">
              <a-form-item>
                <a-textarea v-model:value="model.remarks" class="textArea"> </a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr style="height: 45px">
            <td> 部门领导审核 </td>
            <td>
              <span>{{ model.departLeaderAudit }}</span>
            </td>
            <td> 财务审核 </td>
            <td>
              <span>{{ model.financeAudit }}</span>
            </td>
            <td> 总经理审核 </td>
            <td>
              <span>{{ model.managerAudit }}</span>
            </td>
          </tr>
          <tr style="height: 45px">
            <td> 出纳放款 </td>
            <td>
              <span>{{ model.cashierLoanAmount }}</span>
            </td>
            <td>借款发放时间</td>
            <td colspan="3">
              <span>
                {{ model.cashierLoanTime }}
              </span>
            </td>
          </tr>
        </table>
      </a-card>
      </JFormContainer>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveOrUpdate } from '../loan.api';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { numToUpper } from '/@/utils';
  import { useUserStore } from '/@/store/modules/user';
  import JFormContainer from '/@/components/Form/src/jeecg/components/JFormContainer.vue';
  import dayjs from "dayjs";
  
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  //提示弹窗
  const $message = useMessage();
  const userStore = useUserStore();
  const formRef = ref(null);
  const isUpdate = ref(true);
  const nickname = ref(userStore.getUserInfo?.realname);
  const model = reactive({
    id: '',
    departName: '系统管理部',
    loanUserName: userStore.getUserInfo?.username,
    loanTime: nowTimes(),
    loanAmount: '',
    upperSum: '',
    loanUsage: '',
    remarks: '',
    departLeaderAudit: '',
    financeAudit: 0,
    managerAudit: '金额大于五千才需向总经理审批',
    cashierLoanAmount: '',
    cashierLoanTime: null,
  });
  //表单校验
  const validatorRules = {
    loanAmount: [{ required: true, message: '请输入借款金额!' }],
  };
  const formDisabled = ref(false);
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showOkBtn: !!!data?.isDetail });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      Object.assign(model, { ...data.record });
    } else {
      Object.assign(model, { ...initData });
    }
    
    //时间格式化（升级antd3后，时间值不允许是字符串）
    model.loanTime = model.loanTime?dayjs(model.loanTime,'YYYY-MM-DD'):null;
    model.cashierLoanTime = model.cashierLoanTime?dayjs(model.cashierLoanTime,'YYYY-MM-DD'):null;
    
    // update-begin-author:taoyan date:2022-9-5 for: VUEN-2157  出差申请、借款申请、请假申请、公文申请都有这个问题，详情不让改
    if(data.isDetail === true){
      formDisabled.value = true;
    }else{
      formDisabled.value = false;
    }
    // update-end-author:taoyan date:2022-9-5 for: VUEN-2157  出差申请、借款申请、请假申请、公文申请都有这个问题，详情不让改
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  //表单提交事件
  async function handleSubmit() {
    try {
      formRef.value
        .validate()
        .then(async () => {
          let formData = toRaw(unref(model));
          //时间格式化
          formData.loanTime = formData.loanTime ? formatToDateTime(formData.loanTime, 'YYYY-MM-DD HH:mm:ss') : null;
          formData.cashierLoanTime = formData.cashierLoanTime ? formatToDateTime(formData.cashierLoanTime, 'YYYY-MM-DD HH:mm:ss') : null;
          setModalProps({ confirmLoading: true });
          //提交表单
          await saveOrUpdate(formData, isUpdate.value);
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        })
        .catch((error) => {
          console.log('error', error);
        });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  function nowTimes() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return dayjs(year + '-' + month + '-' + day);
  }

  function upperOnChange(value) {
    let numText = numToUpper(value);
    if (numText) {
      model.upperSum = numText;
    } else {
      model.loanAmount = 0;
      model.upperSum = '';
    }
  }
  const labelCol = {
    xs: { span: 24 },
    sm: { span: 3 },
  };
  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 25 },
  };
  const initData = {
    departName: '系统管理部',
    loanUserName: userStore.getUserInfo?.username,
    loanTime: nowTimes(),
    loanAmount: '',
    upperSum: '',
    loanUsage: '',
    remarks: '',
    departLeaderAudit: '',
    financeAudit: 0,
    managerAudit: '金额大于五千才需向总经理审批',
    cashierLoanAmount: '',
    cashierLoanTime: null,
  };
</script>

<style lang="less" scoped>
  html[data-theme='light'] {
    .ant-card {
      color: rgba(0, 0, 0, 0.65);
      background: #fff;
      border: 1px solid #e8e8e8;
    }
    #staffCard {
      border: 1px solid #fff;
      box-shadow:
        0 0 1px 1px #aaa,
        3px 0 5px 0 #aaa,
        0 4px 7px 0 #aaa;
    }
    #staffBmTitle {
      color: black;
    }
    #staffBmTable {
      background-color: #fff;
      border: 1px solid #000;
      tr,
      th {
        border-bottom: 1px solid #000;
      }
      td,
      th {
        border-right: 1px solid #000;
        border-bottom: 1px solid #000;
      }
      .input {
        :deep(.ant-input) {
          border: 0 solid black !important;
          background-color: #fff;
        }
      }
      .ant-input {
        border: 0 solid black !important;
        background-color: #fff;
      }
      .firstTr {
        color: #000;
      }
      .smallText .ant-input-number-input {
        background-color: #fff;
      }
      .textArea {
        border: 0 solid white;
      }
    }
    /**去掉日期控件边框*/
    .ant-picker {
      border: 0 solid black !important;
    }
  }
  html[data-theme='dark'] {
    @borderColor: #3a3a3a;
    #staffBmTable {
      border: 1px solid @borderColor;
      tr,
      th {
        border-bottom: 1px solid @borderColor;
      }
      td,
      th {
        border-right: 1px solid @borderColor;
        border-bottom: 1px solid @borderColor;
      }
    }
  }
  .ant-card {
    border-radius: 2px;
    margin: 0 auto;
    width: 750px;
  }

  #staffCard {
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    height: auto;
  }

  #staffBmTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    font-size: 24px;
  }

  #staffBmTable {
    width: 100%;
    font-size: 12px;
    text-align: center;

    .tr-style {
      height: 50px;
      line-height: 50px;
    }

    tr td:last-child {
      border-right: 0;
    }

    tr:last-child {
      border-bottom: 0;
    }

    .colfirst {
      width: 90px;
    }

    .colfour {
      width: 90px;
    }

    .fontiframe {
      font-size: 12px;
    }

    .ant-form-item {
      margin: 0;
    }

    .input {
      :deep(.ant-input) {
        border-radius: 0;
        display: inherit;
      }
    }

    .ant-input {
      border-radius: 0;
      display: inherit;
      margin: 0;
      width: 255px;
    }

    :deep(.ant-calendar-picker-input) {
      border: none !important;
    }

    .text {
      border: none !important;
      border-radius: 0;
      margin: 0;
      width: 100%;
      font-size: 12px;
    }

    .firstTr {
      width: 16%;

      .ant-form-item-control-wrapper {
        width: 50%;
      }
    }

    .smallText .ant-input-number-input {
      border: 0;
      margin: 0;
    }

    .lineHeight .ant-form-item-control {
      line-height: 0;
    }

    .textArea {
      resize: none;
      height: 118px;
      font-size: 12px;
      border-radius: 0;
      margin-bottom: 0;
    }
  }

  .staffLeaveTableId {
    margin-right: 87px;
    float: right;
    height: 35px;
  }

  .ant-form label {
    font-size: 12px;
  }

  :deep(.ant-form-item-label label) {
    font-size: 12px;
  }
</style>
