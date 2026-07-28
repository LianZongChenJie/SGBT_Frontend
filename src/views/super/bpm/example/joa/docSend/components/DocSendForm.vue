<template>
  <div>
    <a-form ref="formRef" :model="model" :labelCol="labelCol" :wrapperCol="wrapperCol" :rules="validatorRules" style="padding-bottom: 10px">
      <JFormContainer :disabled="true">
        <a-card id="staffCard" class="ant-card">
          <span id="documentsIssuedTitle">发文单</span>
          <table border="1px" id="documentsIssueTable">
            <tr>
              <td class="firstTr">公文标题</td>
              <td class="firstTr" colspan="2">
                <a-form-item name="title">
                  <a-input class="text" v-model:value="model.title" />
                </a-form-item>
              </td>
              <td class="firstTr">发文字号</td>
              <td class="firstTr" colspan="2">
                <a-form-item>
                  <a-input style="text-align: left" class="text" readOnly placeholder="< 系统自动生成 >" v-model:value="model.docCode" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td> 公文分类 </td>
              <td colspan="2" style="width: 200px">
                <a-form-item :wrapperCol="{ xs: { span: 20 } }">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model.docType">
                    <a-radio class="radioGroup" value="1">普通文件</a-radio>
                    <a-radio class="radioGroup" value="2">盖章文件</a-radio>
                    <a-radio class="radioGroup" value="3">正式文件</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
              <td> 文种 </td>
              <td colspan="2" style="width: 200px">
                <a-form-item>
                  <a-select v-model:value="model.classification">
                    <a-select-option value="1">公告</a-select-option>
                    <a-select-option value="2">通知</a-select-option>
                  </a-select>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td> 缓急程度 </td>
              <td colspan="2">
                <a-form-item :wrapperCol="{ xs: { span: 15 } }">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model.urgency">
                    <a-radio class="radioGroup" value="1">普通</a-radio>
                    <a-radio class="radioGroup" value="2">特急</a-radio>
                    <a-radio class="radioGroup" value="3">紧急</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
              <td> 印刷份数 </td>
              <td>
                <a-form-item>
                  <a-input class="text" v-model:value="model.printScore" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td> 发文目标 </td>
              <td colspan="2" style="width: 260px">
                <a-form-item :wrapperCol="{ xs: { span: 23 } }">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model.sendTarget">
                    <a-radio class="radioGroup" value="1">公司内</a-radio>
                    <a-radio class="radioGroup" value="2">公司外</a-radio>
                    <a-radio class="radioGroup" value="3">子公司</a-radio>
                    <a-radio class="radioGroup" value="4">主公司</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
              <td> 机密程度 </td>
              <td colspan="2">
                <a-form-item :wrapperCol="{ xs: { span: 20 } }">
                  <a-radio-group class="fontiframe" name="radioGroup" v-model:value="model.confidentiality">
                    <a-radio class="radioGroup" value="1">公开</a-radio>
                    <a-radio class="radioGroup" value="2">秘密</a-radio>
                    <a-radio class="radioGroup" value="3">机密</a-radio>
                    <a-radio class="radioGroup" value="4">绝密</a-radio>
                  </a-radio-group>
                </a-form-item>
              </td>
            </tr>

            <tr>
              <td> 机关代字 </td>
              <td colspan="2">
                <a-form-item>
                  <a-input class="text" v-model:value="model.officeCode" />
                </a-form-item>
              </td>
              <td> 排序码 </td>
              <td colspan="2">
                <a-form-item>
                  <a-input-number class="text" v-model:value="model.orderNo" />
                </a-form-item>
              </td>
            </tr>

            <tr>
              <td> 主题词 </td>
              <td colspan="5">
                <a-form-item>
                  <a-textarea v-model:value="model.theme" class="textArea"></a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td> 收文人 </td>
              <td colspan="5">
                <a-form-item>
                  <a-textarea v-model:value="model.receiverName" class="textArea"></a-textarea>
                </a-form-item>
              </td>
            </tr>
            <tr style="height: 35px">
              <td> 文件 </td>
              <td colspan="5"> </td>
            </tr>
            <tr>
              <td> 登记人 </td>
              <td colspan="2">
                <span>{{ nickname }}</span>
              </td>
              <td> 登记时间 </td>
              <td colspan="2">
                <a-form-item>
                  <a-date-picker class="input" placeholder="" format="YYYY-MM-DD" v-model:value="model.bookDate" />
                </a-form-item>
              </td>
            </tr>
            <tr>
              <td> 成文日期 </td>
              <td colspan="2">
                <a-form-item>
                  <a-date-picker class="input" placeholder="" format="YYYY-MM-DD" v-model:value="model.writtenDate" />
                </a-form-item>
              </td>
              <td> 审阅时间 </td>
              <td colspan="2">
                <a-form-item>
                  <a-date-picker class="input" placeholder="" format="YYYY-MM-DD" v-model:value="model.reviewDate" />
                </a-form-item>
              </td>
            </tr>
          </table>
        </a-card>
      </JFormContainer>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import JFormContainer from '/@/components/Form/src/jeecg/components/JFormContainer.vue';
  import { queryById } from '../doc.send.api';
  import dayjs from "dayjs";
  // props声明
  const props = defineProps({
    formData: {
      type: Object,
      default: () => {},
    },
  });
  const userStore = useUserStore();
  const formRef = ref(null);
  const nickname = ref(userStore.getUserInfo?.realname);
  const model = reactive({
    id: '',
    title: '',
    docCode: '',
    docType: '1',
    classification: '1',
    urgency: '1',
    printScore: 0,
    sendTarget: '1',
    confidentiality: '1',
    officeCode: '',
    orderNo: '',
    theme: '',
    receiverName: '',
    bookDate: null,
    writtenDate: null,
    reviewDate: null,
  });

  const labelCol = {
    xs: { span: 24 },
    sm: { span: 5 },
  };
  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 24 },
  };

  async function initFormData() {
    let res = await queryById({ id: props.formData.dataId });
    console.log('DocSendForm获取流程节点信息', res);
    if (res.success) {
      let obj = res.result;
      //表单赋值
      Object.assign(model, { ...obj });

      //时间格式化（升级antd3后，时间值不允许是字符串）
      model.bookDate = model.bookDate?dayjs(model.bookDate,'YYYY-MM-DD'):null;
      model.writtenDate = model.writtenDate?dayjs(model.writtenDate,'YYYY-MM-DD'):null;
      model.reviewDate = model.reviewDate?dayjs(model.reviewDate,'YYYY-MM-DD'):null;
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
    #documentsIssuedTitle {
      color: black;
    }
    #documentsIssueTable {
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
    #documentsIssueTable {
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
    width: 1000px;
  }

  #staffCard {
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    height: auto;
  }

  #documentsIssuedTitle {
    margin-top: 1px;
    font-weight: bold;
    text-align: center;
    display: block;
    font-size: 24px;
  }

  #documentsIssueTable {
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
      border-radius: 0;
    }
  }
</style>
