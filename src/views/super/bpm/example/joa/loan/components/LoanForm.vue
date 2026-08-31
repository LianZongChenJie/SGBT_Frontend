<template>
  <a-card id="staffCard" class="ant-card">
    <a-form :model="model" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <span id="staffTitle">借款单</span>
      <table border="1px" class="staffTable">
        <tr>
          <td class="colfirst">借款人</td>
          <td class="secend">
            <a-form-item>
              <a-input class="text" :disabled="true" v-model:value="model.loanUserName" />
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
            <a-form-item>
              <a-input-number
                class="smallText"
                :disabled="true"
                v-model:value="model.loanAmount"
                size="small"
                :min="0"
                :max="99999999"
                @change="upperOnChange"
              />
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
              <a-textarea :disabled="true" v-model:value="model.loanUsage" class="textArea"></a-textarea>
            </a-form-item>
          </td>
        </tr>
        <tr>
          <td> 备注 </td>
          <td colspan="5">
            <a-form-item>
              <a-textarea :disabled="true" v-model:value="model.remarks" class="textArea"> </a-textarea>
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
    </a-form>
    <br />
    <a-form :model="model2" :labelCol="labelCol" :wrapperCol="wrapperCol2">
      <a-divider orientation="left">员工出差申请记录</a-divider>
      <JFormContainer :disabled="true">
        <table border="1px" class="staffTable">
          <tr>
            <td class="firstTr">出差人</td>
            <td class="firstTr" colspan="2">
              <a-form-item>
                <span class="fontiframe">{{ nickname }}</span>
              </a-form-item>
            </td>
            <td class="firstTr">部门</td>
            <td class="firstTr" colspan="2">
              <a-form-item>
                <JSelectDept v-model:value="model2.departId" :multiple="false" :checkStrictly="true" :showButton="false"></JSelectDept>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 目的地 </td>
            <td colspan="2">
              <a-form-item name="destination">
                <JAreaLinkage placeholder="请选择" v-model:value="model2.destination" :showArea="true" :showAll="false" />
              </a-form-item>
            </td>
            <td> 项目名称 </td>
            <td colspan="2">
              <a-form-item name="projectName">
                <a-input class="text" v-model:value="model2.projectName" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 出发时间 </td>
            <td colspan="2">
              <a-form-item>
                <a-date-picker class="input" format="YYYY-MM-DD" v-model:value="model2.departureTime" :allowClear="false" />
              </a-form-item>
            </td>
            <td> 计划返回时间 </td>
            <td colspan="2">
              <a-form-item>
                <a-date-picker class="input" format="YYYY-MM-DD" v-model:value="model2.plannedReturnTime" :allowClear="false" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 实际返回时间 </td>
            <td colspan="2">
              <a-form-item>
                <a-date-picker class="input" placeholder="" format="YYYY-MM-DD" v-model:value="model2.actualReturnTime" :allowClear="false" />
              </a-form-item>
            </td>
            <td> 出差天数 </td>
            <td colspan="2">
              <a-form-item>
                <a-input class="text" v-model:value="model2.dayNum" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 出差经费支出 </td>
            <td colspan="5">
              <a-form-item>
                <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model2.travelExpensesType">
                  <a-radio class="radioGroup" value="1">预支借款</a-radio>
                  <a-radio class="radioGroup" value="2">个人垫付</a-radio>
                </a-radio-group>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 出发地 </td>
            <td colspan="2">
              <a-form-item>
                <JAreaLinkage v-model:value="model2.departAddress" placeholder="请选择" :showArea="true" :showAll="false" />
              </a-form-item>
            </td>
            <td> 出行工具 </td>
            <td colspan="2">
              <a-form-item>
                <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model2.travelTool">
                  <a-radio class="radioGroup" :value="1">客车</a-radio>
                  <a-radio class="radioGroup" :value="2">火车</a-radio>
                  <a-radio class="radioGroup" :value="3">飞机</a-radio>
                </a-radio-group>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 任务及事由 </td>
            <td colspan="5">
              <a-form-item>
                <a-textarea v-model:value="model2.reason" class="textArea"></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr style="height: 38px">
            <td> 部门领导审核 </td>
            <td colspan="2">
              <span>{{ model2.departLeaderAudit }}</span>
            </td>
            <td> 财务审核 </td>
            <td colspan="2">
              <span>{{ model2.financeAudit }}</span>
            </td>
          </tr>
          <tr style="height: 38px">
            <td> 出纳放款 </td>
            <td colspan="2">
              <span>{{ model2.cashierLoanAmount }}</span>
            </td>
            <td> 总经理审核 </td>
            <td colspan="2">
              <span>{{ model2.managerAudit }}</span>
            </td>
          </tr>
        </table>
      </JFormContainer>
    </a-form>
  </a-card>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { numToUpper } from '/@/utils';
  import { useUserStore } from '/@/store/modules/user';
  import { queryByTripApplyNo, queryTripByApplyNo } from '../loan.api';
  import JAreaLinkage from '/@/components/Form/src/jeecg/components/JAreaLinkage.vue';
  import JSelectDept from '/@/components/Form/src/jeecg/components/JSelectDept.vue';
  import JFormContainer from '/@/components/Form/src/jeecg/components/JFormContainer.vue';
  import { getRealCode } from '/@/components/Form/src/utils/areaDataUtil.js';
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
    id: '',
    departName: '',
    loanUserName: '',
    loanTime: nowTimes(),
    loanAmount: '',
    upperSum: '',
    loanUsage: '',
    remarks: '',
    departLeaderAudit: '',
    financeAudit: 0,
    managerAudit: '',
    cashierLoanAmount: '',
    cashierLoanTime: null,
  });
  const model2 = reactive({
    applyUserName: '',
    departId: '',
    destination: '',
    projectName: '',
    departureTime: null,
    plannedReturnTime: null,
    actualReturnTime: null,
    dayNum: 0,
    travelExpensesType: '1',
    departAddress: '',
    travelTool: 1,
    reason: '',
    departLeaderAudit: '',
    financeAudit: '',
    cashierLoanAmount: '',
    managerAudit: '',
  });
  
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
  const wrapperCol2 = {
    xs: { span: 24 },
    sm: { span: 21 },
  };
  async function initFormData() {
    //update-begin-author:liusq---date:20220614--for: 借款申请在历史流程节点时，id取值存在问题 ---
    let id = props.formData.vars.id ? props.formData.vars.id : props.formData.dataId;
    let res = await queryByTripApplyNo({ id });
    //update-end-author:liusq---date:20220614--for: 借款申请在历史流程节点时，id取值存在问题 ---
    if (res.success) {
      console.log('获取流程节点信息', res.result);
      //表单赋值
      model.upperSum = numToUpper(res.result.loanAmount);
      Object.assign(model, { ...res.result });

      //时间格式化（升级antd3后，时间值不允许是字符串）
      model.loanTime = model.loanTime?dayjs(model.loanTime,'YYYY-MM-DD'):null;
      model.cashierLoanTime = model.cashierLoanTime?dayjs(model.cashierLoanTime,'YYYY-MM-DD'):null;
 
      
      //-------------------------------------------------------------------------------------------------
      //通过出差单号，查询出差单
      let params = { tripApplyNo: res.result.tripApplyNo }; //查询条件
      let res2 = await queryTripByApplyNo(params);
      if (res2.success) {
        let obj = res2.result;
        console.log('获取出差单信息', obj);
        //表单赋值
        obj.destination = getRealCode(obj.destination, 3);
        obj.departAddress && (obj.departAddress = getRealCode(obj.departAddress, 3));
        Object.assign(model2, { ...obj });
      }

      //时间格式化（升级antd3后，时间值不允许是字符串）
      model2.departureTime = model2.departureTime?dayjs(model2.departureTime,'YYYY-MM-DD'):null;
      model2.plannedReturnTime = model2.plannedReturnTime?dayjs(model2.plannedReturnTime,'YYYY-MM-DD'):null;
      model2.actualReturnTime = model2.actualReturnTime?dayjs(model2.actualReturnTime,'YYYY-MM-DD'):null;
      //-------------------------------------------------------------------------------------------------
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
    #staffTitle {
      color: black;
    }
    .staffTable {
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
    .staffTable {
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
    width: 950px;
  }

  #staffCard {
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    height: auto;
  }

  #staffTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    font-size: 24px;
  }

  .staffTable {
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
      box-shadow: none;
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
