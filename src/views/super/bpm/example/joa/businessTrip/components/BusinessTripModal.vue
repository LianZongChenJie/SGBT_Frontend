<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="1200px">
    <a-form ref="formRef" :model="model" :labelCol="labelCol" :wrapperCol="wrapperCol" :rules="validatorRules" style="padding-bottom: 10px">
      <JFormContainer :disabled="formDisabled">
      <a-card id="staffCard" class="ant-card">
        <span id="staffEvectionTitle">员工出差申请单</span>
        <table border="1px" id="staffEvectionTable">
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
                <JSelectDept v-model:value="model.departId" :multiple="false" :checkStrictly="true" :showButton="false"></JSelectDept>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 目的地 </td>
            <td colspan="2">
              <a-form-item name="destination" class="mudidi">
                <JAreaLinkage placeholder="请选择" v-model:value="model.destination" :showArea="true" :showAll="false" />
              </a-form-item>
            </td>
            <td> 项目名称 </td>
            <td colspan="2">
              <a-form-item name="projectName">
                <a-input class="text" v-model:value="model.projectName" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 出发时间 </td>
            <td colspan="2">
              <a-form-item>
                <a-date-picker class="input" @change="difference" format="YYYY-MM-DD" v-model:value="model.departureTime" :allowClear="false" />
              </a-form-item>
            </td>
            <td> 计划返回时间 </td>
            <td colspan="2">
              <a-form-item>
                <a-date-picker class="input" @change="difference" format="YYYY-MM-DD" v-model:value="model.plannedReturnTime" :allowClear="false" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 实际返回时间 </td>
            <td colspan="2">
              <a-form-item>
                <a-date-picker class="input" placeholder="" format="YYYY-MM-DD" v-model:value="model.actualReturnTime" :allowClear="false" />
              </a-form-item>
            </td>
            <td> 出差天数 </td>
            <td colspan="2">
              <a-form-item>
                <a-input class="text" v-model:value="model.dayNum" />
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 出差经费支出 </td>
            <td colspan="5">
              <a-form-item>
                <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model.travelExpensesType">
                  <a-radio class="radioGroup" value="1">预支借款</a-radio>
                  <a-radio class="radioGroup" value="2">个人垫付</a-radio>
                </a-radio-group>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td> 出发地 </td>
            <td colspan="2">
              <a-form-item class="mudidi">
                <JAreaLinkage v-model:value="model.departAddress" placeholder="请选择" :showArea="true" :showAll="false" />
              </a-form-item>
            </td>
            <td> 出行工具 </td>
            <td colspan="2">
              <a-form-item>
                <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model.travelTool">
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
                <a-textarea v-model:value="model.reason" class="textArea"></a-textarea>
              </a-form-item>
            </td>
          </tr>
          <tr style="height: 38px">
            <td> 部门领导审核 </td>
            <td colspan="2">
              <span>{{ model.departLeaderAudit }}</span>
            </td>
            <td> 财务审核 </td>
            <td colspan="2">
              <span>{{ model.financeAudit }}</span>
            </td>
          </tr>
          <tr style="height: 38px">
            <td> 出纳放款 </td>
            <td colspan="2">
              <span>{{ model.cashierLoanAmount }}</span>
            </td>
            <td> 总经理审核 </td>
            <td colspan="2">
              <span>{{ model.managerAudit }}</span>
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
  import JAreaLinkage from '/@/components/Form/src/jeecg/components/JAreaLinkage.vue';
  import JSelectDept from '/@/components/Form/src/jeecg/components/JSelectDept.vue';
  import JFormContainer from '/@/components/Form/src/jeecg/components/JFormContainer.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveOrUpdate, getDepartName } from '../business.trip.api';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { getRealCode } from '/@/components/Form/src/utils/areaDataUtil.js';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from "dayjs";
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  //提示弹窗
  const $message = useMessage();
  const userStore = useUserStore();
  const isUpdate = ref(true);
  const formRef = ref(null);
  const nickname = ref(userStore.getUserInfo?.realname);
  const formDisabled = ref(false);
  const model = reactive({
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
  //表单校验
  const validatorRules = {
    destination: [{ required: true, message: '目的地不能为空!' }],
    projectName: [{ required: true, message: '请输入项目名称!' }],
  };
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showOkBtn: !!!data?.isDetail });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      //转换地区选择组件数据格式复核要求
      let obj = { ...data.record };
      obj.destination = getRealCode(obj.destination, 3);
      obj.departAddress && (obj.departAddress = getRealCode(obj.departAddress, 3));
      Object.assign(model, { ...obj });
    } else {
      Object.assign(model, { ...initData });
    }

    //时间格式化（升级antd3后，时间值不允许是字符串）
    model.departureTime = model.departureTime?dayjs(model.departureTime,'YYYY-MM-DD'):null;
    model.plannedReturnTime = model.plannedReturnTime?dayjs(model.plannedReturnTime,'YYYY-MM-DD'):null;
    model.actualReturnTime = model.actualReturnTime?dayjs(model.actualReturnTime,'YYYY-MM-DD'):null;
    
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
  function handleSubmit() {
    try {
      formRef.value
        .validate()
        .then(async () => {
          let formData = toRaw(unref(model));
          //时间格式化
          formData.departureTime = formData.departureTime ? formatToDateTime(formData.departureTime, 'YYYY-MM-DD HH:mm:ss') : null;
          formData.plannedReturnTime = formData.plannedReturnTime ? formatToDateTime(formData.plannedReturnTime, 'YYYY-MM-DD HH:mm:ss') : null;
          formData.actualReturnTime = formData.actualReturnTime ? formatToDateTime(formData.actualReturnTime, 'YYYY-MM-DD HH:mm:ss') : null;
          formData.cashierLoanTime = formData.cashierLoanTime ? formatToDateTime(formData.cashierLoanTime, 'YYYY-MM-DD HH:mm:ss') : null;
          //地区数据处理
          formData.destination = formData.destination ? formData.destination[2] : '';
          formData.departAddress = formData.departAddress ? formData.departAddress[2] : '';

          if (formData.departId) {
            let result = await getDepartName({ id: formData.departId });
            formData.departName = result[0].departName;
          }
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

  const labelCol = {
    xs: { span: 24 },
    sm: { span: 3 },
  };
  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 21 },
  };
  //初始化数据
  const initData = {
    applyUserName: userStore.getUserInfo?.username,
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
  };
  /**
   * 获取当前时间
   */
  function nowTimes() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return dayjs(year + '-' + month + '-' + day);
  }

  /**
   * 计算天数
   */
  function difference() {
    let data = toRaw(unref(model));
    if (data.departureTime && data.plannedReturnTime) {
      let beginTime = formatToDateTime(data.departureTime, 'YYYY-MM-DD HH:mm:ss');
      let endTime = formatToDateTime(data.plannedReturnTime, 'YYYY-MM-DD HH:mm:ss');
      if (beginTime != '' && endTime != '') {
        let dateBegin = new Date(beginTime);
        let dateEnd = new Date(endTime);
        let dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
        let dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
        if (dayDiff < 0) {
          $message.createMessage.warning('结束时间不能小于开始时间');
          model.dayNum = 0;
        } else {
          model.dayNum = dayDiff;
        }
      }
    }
  }
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
    #documentsIssuedTitle {
      color: black;
    }
    #staffEvectionTable {
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
      :deep(.ant-input-number) {
        border: 0 solid black !important;
      }
    }
    /**去掉日期控件边框*/
    .ant-picker {
      border: 0 solid black !important;
    }
  }
  html[data-theme='dark'] {
    @borderColor: #3a3a3a;
    #staffEvectionTable {
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
    width: 1000px;
  }

  #staffCard {
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    height: auto;
  }

  #staffEvectionTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    font-size: 24px;
  }

  #staffEvectionTable {
    width: 100%;
    font-size: 12px;
    text-align: center;

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
    }

    .text {
      border: none !important;
      border-radius: 0;
      margin: 0;
      width: 100%;
      font-size: 12px;
    }

    .textArea {
      resize: none;
      box-shadow: none;
      height: 98px;
      width: 100%;
      font-size: 12px;
      border-radius: 0;
      margin-bottom: 0;
    }

    .colfirst {
      width: 90px;
    }

    .colfour {
      width: 90px;
    }

    .firstTr {
      width: 100px;
    }

    .radioGroup {
      font-size: 12px;
    }

    .smallText .ant-input-number-input {
      border: 0;
      margin: 0;
    }

    :deep(.ant-input-number) {
      border: 0 solid black !important;
      border-radius: 0;
    }
  }
  /**去掉地区控件边框、字号改小*/
  .ant-select:not(.ant-select-customize-input) .ant-select-selector{
    font-size: 12px;
    border: 0 solid black !important;
  }
</style>
