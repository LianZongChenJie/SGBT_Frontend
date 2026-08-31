<template>
  <a-form ref="formRef" :model="model" :labelCol="labelCol" :wrapperCol="wrapperCol">
    <JFormContainer :disabled="true">
      <a-card id="staffCard" class="ant-card">
        <span id="staffLeaveTitle">员工请假单</span>
        <div class="staffLeaveTableId" style="margin-bottom: 5px">
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
                <a-date-picker class="input" format="YYYY-MM-DD" v-model:value="model.leaveStartDate" :allowClear="false" />
                ) 至(
                <a-date-picker class="input" format="YYYY-MM-DD" v-model:value="model.leaveEndDate" :allowClear="false" />
                ) 总共请<a-input-number class="smallText" v-model:value="model.total" size="small" :min="0" />天<br />
                <span class="fontiframe" style="color: #f00; position: relative; right: 86px"
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
      <a-form-item hidden>
        <a-date-picker class="input" placeholder="" format="YYYY-MM-DD" disabled v-model:value="model.applyDate" />
      </a-form-item>
    </JFormContainer>
  </a-form>
</template>
<script lang="ts" setup>
  import { ref, unref, reactive, toRaw } from 'vue';
  import { queryById } from '../leave.api';
  import { useUserStore } from '/@/store/modules/user';
  import JFormContainer from '/@/components/Form/src/jeecg/components/JFormContainer.vue';
  import { leaveCategoryOpt } from '../leave.data';
  import dayjs from "dayjs";

  // props声明
  const props = defineProps({
    formData: {
      type: Object,
      default: () => {},
    },
  });
  const userStore = useUserStore();
  const nickname = ref(userStore.getUserInfo?.realname);
  const model = reactive({
    applyNo: '',
    department: '',
    duty: '',
    leaveReason: '',
    leaveStartDate: null,
    leaveEndDate: null,
    leaveCategory: '1',
    total: 0,
    contactWay: '',
    dutyDeputy: '',
    leaderApproval: '',
    hrPrincipalApproval: '',
    deptPrincipalApproval: '',
    applyDate: null,
  });

  const labelCol = {
    xs: { span: 24 },
    sm: { span: 3 },
  };
  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 21 },
  };

  async function initFormData() {
    let res = await queryById({ id: props.formData.dataId });
    console.log('LeaveForm获取流程节点信息', res);
    if (res.success) {
      //表单赋值
      Object.assign(model, { ...res.result });
      //时间格式化（antd3升级后，时间值不允许是字符串）
      model.leaveStartDate = model.leaveStartDate?dayjs(model.leaveStartDate,'YYYY-MM-DD'):null;
      model.leaveEndDate = model.leaveEndDate?dayjs(model.leaveEndDate,'YYYY-MM-DD'):null;
      model.applyDate = model.applyDate?dayjs(model.applyDate,'YYYY-MM-DD'):null;
    }
  }
  initFormData();
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
      .text {
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
