<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :bodyStyle="{ height: '720px' }" :title="title" @ok="handleSubmit" width="950px">
    <a-form ref="formRef" :model="model" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <JFormContainer :disabled="formDisabled">
      <a-card id="staffCard" class="ant-card">
        <span id="staffLeaveTitle">员工请假单</span>
        <div class="staffLeaveTableId">
          <a-form-item :labelCol="{ xs: { span: 24 }, sm: { span: 10 } }" :wrapperCol="{ xs: { span: 24 }, sm: { span: 10 } }" label="编号:">
            <a-input class="fontiframe" style="border: none" readOnly v-model:value="model.applyNo" />
          </a-form-item>
        </div>
        <table id="staffLeaveTable">
          <tr class="tr-style">
            <td class="firstTr">请假人</td>
            <td class="firstTr">
              <a-form-item>
                <span class="fontiframe">{{ nickname }}</span>
              </a-form-item>
            </td>
            <td class="firstTr">部门</td>
            <td class="firstTr">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                <span class="fontiframe">{{ model.department }}</span>
              </a-form-item>
            </td>
            <td class="firstTr">职务</td>
            <td class="firstTr">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                <span class="fontiframe">{{ model.duty }}</span>
              </a-form-item>
            </td>
          </tr>
          <tr class="tr-style">
            <td colspan="6">
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" style="font-size: 12px" label="请假类别:">
                <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model.leaveCategory">
                  <template v-for="(item, index) in leaveCategoryOpt" :key="index">
                    <a-radio class="radioGroup" :value="item.value">{{ item.label }}</a-radio>
                  </template>
                </a-radio-group>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="6">
              <a-form-item label="请假事由:">
                <a-textarea v-model:value="model.leaveReason" class="textArea"></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr class="tr-style">
            <td colspan="6">
              <a-form-item class="fontiframe lineHeight" label="请假时间:">
                自(
                <a-date-picker class="input" format="YYYY-MM-DD" @change="dateChange" v-model:value="model.leaveStartDate" :allowClear="false" />
                ) 至(
                <a-date-picker class="input" format="YYYY-MM-DD" @change="dateChange" v-model:value="model.leaveEndDate" :allowClear="false" />
                ) 总共请<a-input-number class="smallText" v-model:value="model.total" size="small" :min="0" />天<br />
                <span class="fontiframe" style="display:none; color: #f00; position: relative; right: 86px"
                  >1.请假半天可以写0.5不能写0.1,0.2等小数。2.全天假以00:00:00开始以23:59:59结束,下午请假以12:00:00开始</span
                >
              </a-form-item>
            </td>
          </tr>
          <tr class="tr-style">
            <td colspan="3">
              <a-form-item :labelCol="{ xs: { span: 24 }, sm: { span: 10 } }" :wrapperCol="wrapperCol" label="休息期间联系方式:">
                <a-input class="text" v-model:value="model.contactWay" />
              </a-form-item>
            </td>
            <td colspan="3">
              <a-form-item :labelCol="{ xs: { span: 24 }, sm: { span: 11 } }" :wrapperCol="wrapperCol" label="休息期间应急工作委托人:">
                <a-input class="text" v-model:value="model.dutyDeputy" />
              </a-form-item>
            </td>
          </tr>
          <tr style="height: 100px; line-height: 100px">
            <td colspan="3">
              <a-form-item :labelCol="{ xs: { span: 24 }, sm: { span: 10 } }" :wrapperCol="wrapperCol" label="部门主管(经理)意见:">
                <div style="display: flex; margin-top: 20px; height: 80px">
                  <div>{{ model.leaderApproval }}</div>
                  <div class="fontiframe" style="position: absolute; bottom: 10px">负责人:</div>
                </div>
              </a-form-item>
            </td>
            <td colspan="3">
              <a-form-item :labelCol="{ xs: { span: 24 }, sm: { span: 11 } }" :wrapperCol="wrapperCol" label="人力资源部(行政办)意见:">
                <div style="display: flex; margin-top: 20px; height: 80px">
                  <div class="fontiframe">{{ model.hrPrincipalApproval }}</div
                  ><br />
                  <div class="fontiframe" style="position: absolute; bottom: 10px">负责人:</div>
                </div>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <a-form-item :labelCol="{ xs: { span: 24 }, sm: { span: 10 } }" :wrapperCol="wrapperCol" label="总经理意见:">
                <div style="display: flex; height: 100px">
                  <div class="fontiframe" style="margin-top: 30px">{{ model.deptPrincipalApproval }}</div>
                  <div class="fontiframe" style="position: absolute; bottom: 10px">总经理:</div>
                </div>
              </a-form-item>
            </td>
            <td colspan="3" style="text-align: left">
              <p class="fontiframe">
                说明<br />
                1.返回公司报到时间为销假时间。<br />
                2.所有员工3天及以上请假需总经理批准。<br />
                3.本表存人力资源部(行政办)备案。<br />
              </p>
            </td>
          </tr>
        </table>
      </a-card>
      </JFormContainer>
      <a-form-item hidden>
        <a-date-picker class="input" placeholder="" format="YYYY-MM-DD" disabled v-model:value="model.applyDate" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveOrUpdate } from '../leave.api';
  import { leaveCategoryOpt } from '../leave.data';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { useUserStore } from '/@/store/modules/user';
  import JFormContainer from '/@/components/Form/src/jeecg/components/JFormContainer.vue';
  import {string} from "vue-types";
  import dayjs from 'dayjs';

  // Emits声明
  const emit = defineEmits(['register', 'success']);
  //提示弹窗
  const $message = useMessage();
  const userStore = useUserStore();
  const isUpdate = ref(true);
  const nickname = ref(userStore.getUserInfo?.realname);
  const model = reactive({
    applyNo: '',
    department: '',
    duty: '',
    leaveReason: '',
    leaveCategory: '1',
    leaveStartDate: '',
    leaveEndDate: '',
    total: 0,
    contactWay: '',
    dutyDeputy: '',
    leaderApproval: '',
    hrPrincipalApproval: '',
    deptPrincipalApproval: '',
    applyDate: null,
  });

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

    //时间初始化（antd3升级后，时间值不允许是字符串）
    model.applyDate = model.applyDate ? dayjs(model.applyDate) : null;
    model.leaveStartDate = model.leaveStartDate ? dayjs(model.leaveStartDate) : null;
    model.leaveEndDate = model.leaveEndDate ? dayjs(model.leaveEndDate) : null;
    
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
      let formData = toRaw(unref(model));
      if (!model.leaveStartDate) {
        $message.createMessage.warning('请假开始时间不能是空');
        return false;
      }
      if (!model.leaveEndDate) {
        $message.createMessage.warning('请假结束时间不能是空');
        return false;
      }
      if (model.total == 0) {
        $message.createMessage.warning('请假天数不能是0天');
        return false;
      }
      if (model.total == '' || model.total == undefined || model.total == null) {
        $message.createMessage.warning('请假天数不能是空');
        return false;
      }
      

      //时间格式化
      formData.applyDate = formData.applyDate ? formatToDateTime(formData.applyDate, 'YYYY-MM-DD HH:mm:ss') : null;
      formData.leaveStartDate = formData.leaveStartDate ? formatToDateTime(formData.leaveStartDate, 'YYYY-MM-DD HH:mm:ss') : null;
      formData.leaveEndDate = formData.leaveEndDate ? formatToDateTime(formData.leaveEndDate, 'YYYY-MM-DD HH:mm:ss') : null;
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdate(formData, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
  const labelCol = {
    xs: { span: 24 },
    sm: { span: 3 },
  };
  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 21 },
  };
  const initData = {
    id: '',
    applyNo: '',
    name: userStore.getUserInfo?.username,
    department: '系统管理部',
    duty: '普通员工',
    leaveReason: '',
    leaveStartDate: null,
    leaveEndDate: null,
    leaveCategory: '1',
    total: 0,
    contactWay: '',
    dutyDeputy: '',
    leaderApproval: '',
    hrPrincipalApproval: '',
    deptPrincipalApproval: '小于三天无需总经理批准',
    applyDate: nowTimes()
  };
  function nowTimes() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return dayjs(year + '-' + month + '-' + day);
  }

  //update-begin-author:taoyan date:2022-9-5 for: VUEN-2157   4、请假申请，只需要年月日不需要时分秒，默认计算请假天数
  function dateChange(){
    let { leaveEndDate, leaveStartDate} = model;
    if(leaveEndDate && leaveStartDate){
      let leaveStartDateTemp = dayjs(leaveStartDate,'YYYY-MM-DD');
      let leaveEndDateTemp = dayjs(leaveEndDate,'YYYY-MM-DD');
      let temp = leaveEndDateTemp.diff(leaveStartDateTemp, 'days');
      if(temp === 0){
        model.total = 1
      }else if(temp && temp > 0){
        model.total = temp + 1;
      }else{
        model.total = 0;
      }
    }
  }
  //update-end-author:taoyan date:2022-9-5 for: VUEN-2157   4、请假申请，只需要年月日不需要时分秒，默认计算请假天数
  
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
    #staffLeaveTitle {
      color: black;
    }
    #staffLeaveTable {
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
    #staffLeaveTable {
      border: 1px solid @borderColor;
    }
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
  .ant-card {
    border-radius: 2px;
    margin: 0 auto;
    width: 750px;
    height: 700px;
  }

  #staffCard {
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    height: auto;
  }

  #staffLeaveTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    font-size: 24px;
  }

  #staffLeaveTable {
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
      font-size: 12px;
    }

    :deep(.ant-calendar-picker-input) {
      border: none !important;
      font-size: 12px;
    }
    
    :deep(.ant-input-number-sm) {
      border: none !important;
      font-size: 12px;
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
      box-shadow: none;
      height: 118px;
      font-size: 12px;
      border-radius: 0;
      margin-bottom: 0;
      width: 100%;
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
