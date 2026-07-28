<template>
  <a-drawer
    v-model:open="visible"
    :push="false"
    :mask="mask"
    :title="title"
    :width="640"
    :bodyStyle="bodyStyle"
    class="designer-form-button-drawer"
    :contentWrapperStyle="contentWrapperStyle"
    :footer-style="{ textAlign: 'left' }"
    :header-style="{ padding: '14px 20px' }"
    destroyOnClose
    :maskClosable="false"
  >
    <div class="button-config" style="padding: 0px 24px">
      <a-form ref="formRef" :model="myButton">
        <div class="item">
          <h5>按钮名称</h5>
          <div class="content">
            <a-form-item label="" name="label" style="margin-bottom: 0" :rules="labelValidate">
              <a-input v-model:value="myButton.label" placeholder="例如：添加线索，关闭机会" @change="onChangeLabel" />
            </a-form-item>
          </div>
        </div>

        <div class="item">
          <h5>启用按钮</h5>
          <div class="content">
            <a-radio-group v-model:value="showStatus" @change="onChangeShowStatus">
              <a-radio value="always">一直</a-radio>
              <a-radio value="condition">满足筛选条件</a-radio>
            </a-radio-group>

            <ButtonConditions
              :visible="'condition' == showStatus"
              :code="code"
              :allColumns="allColumns"
              :type="conditionType"
              v-model:conditions="conditions"
              v-model:conditionsGroup="conditionsGroup"
              @ok="onSelectOk"
              @back="onSelectBack"
            />
          </div>
        </div>

        <div class="item">
          <h5>点击后</h5>
          <div class="content">
            <a-radio-group v-model:value="clickThen" @change="onChangeClickThen">
              <a-radio value="execute">立即执行</a-radio>
              <a-radio value="confirm">需要二次确认</a-radio>
              <a-radio value="form">填写指定内容</a-radio>
            </a-radio-group>

            <button-confirm-text :visible="'confirm' == clickThen" :info="confirmText" @ok="updateConfirmText" />

            <button-form-config :visible="'form' == clickThen" :info="buttonFormConfig" ref="buttonFormConfigRef" />
          </div>
        </div>

        <div class="item">
          <h5>执行工作流</h5>
          <div class="content">
            <a-radio-group v-if="clickThen == 'form'" v-model:value="flowStatus" @change="onChangeFlowStatus">
              <a-radio :value="false">不执行</a-radio>
              <a-radio :value="true">执行工作流</a-radio>
            </a-radio-group>
            <div class="tip" v-if="showFlowTip">
              <div style="font-size: 13px; line-height: 20px; color: #757575 !important;display: flex;width: 100%">
                <template v-if="processId">
                  <span>
                    {{ getProcessName() }}
                  </span>
                  <span style="flex: 1;margin-left: 3px;color: #f44336">
                    {{ processOpenStatus?' ':'未启用' }}
                  </span>
                  <span style="color: #2196f3;cursor: pointer" @click="editFlow">编辑工作流</span>
                </template>
                <span v-else style="flex: 1">添加按钮后自动创建流程</span>
              </div>
            </div>
          </div>
        </div>

        <div class="item">
          <h5>按钮颜色</h5>
          <div class="content">
            <button-color-selector v-model:value="color" @change="onChangeColor" />
          </div>
        </div>

        <div class="item">
          <h5>按钮图标</h5>
          <div class="content">
            <IconPicker v-model:value="icon" @change="onChangeIcon" clearSelect />
          </div>
        </div>

        <div class="item">
          <h5>按钮说明</h5>
          <div class="content">
            <!--<Icon :icon="icon" :color="color" :size="24" />-->
            <a-input v-model:value="note" placeholder="请输入按钮说明" @change="onChangeNote" />
          </div>
        </div>
      </a-form>
    </div>

    <template #footer>
      <a-button style="margin-left: 10px" type="primary" :disabled="disabledSumbit" @click="onSubmit">{{ isUpdate ? '保存' : '添加按钮' }}</a-button>
      <a-button style="margin-left: 18px" @click="onClose">取消</a-button>
    </template>
  </a-drawer>
  
  <MiniDesFlowModal @register="registerFlowModal" @success="reloadProcessInfo"/>
</template>

<script lang="ts">
  /**
   * 自定义按钮编辑页面
   */
  import { ref, computed, reactive, toRefs, toRaw } from 'vue';
  import { Icon, IconPicker } from '/@/components/Icon/index';

  import ButtonColorSelector from '../button/ButtonColorSelector.vue';
  // import ButtonConditions from '../button/ButtonShowConditions.vue';
  import ButtonConditions from '../button/ButtonConditions.vue';
  import ButtonConfirmText from '../button/ButtonConfirmText.vue';
  import ButtonFormConfig from '../button/ButtonFormConfig.vue';
  import {ButtonInfo, FilterItemGroup} from '../ts/type.definition';
  import { useButtonCurd } from '../ts/useCustomButton';
  import {useModal} from "/@/components/Modal";

  export default {
    name: 'ZdyanDrawer',
    props: {
      columnList: {
        type: Array,
        default: () => [],
      },
      code: {
        type: String,
        require: false,
        default: '',
      },
      viewId: {
        type: String,
        require: false,
        default: '',
      },
      allColumns:{
        type: Array,
        default: () => [],
      },
      designFormName:{
        type: String,
        require: false,
        default: '',
      },
      mask: {
        type: Boolean,
        default: false,
      },
      titleField: {
        type: String,
        require: false,
        default: '',
      },
      contentWrapperStyle: {
        type: Object,
        default: () => ({ top: '100px' })
      },
    },
    components: {
      IconPicker,
      ButtonColorSelector,
      ButtonConditions,
      ButtonConfirmText,
      ButtonFormConfig,
      Icon,
    },
    emits: ['register', 'success'],
    setup(props, { emit }) {
      const { saveButton, updateButton, checkOnlyButtonLabel, getProcessInfo } = useButtonCurd(props);
      const [registerFlowModal, { openModal: openFlowModal }] = useModal();
      
      const buttonFormConfigRef = ref();

      const title = ref('');
      const myButton = reactive<ButtonInfo>({
        label: '',
        showStatus: '',
        clickThen: '',
        flowStatus: false,
        icon: '',
        color: '',
        note: '',
        processId: '',
        id: '',
      });

      // 条件值选择
      const conditionType = ref('and');
      const conditions = ref<any[]>([]);
      const conditionsGroup = ref<FilterItemGroup[]>([]);

      // 二次确认文本设置
      const confirmText = reactive<any>({
        tip: '',
        ok: '',
        cancel: '',
      });

      //表单配置
      const buttonFormConfig = reactive<any>({
        formTable: '',
        linkRecordField: '',
        linkRecordTable: '',

        formType: '',
        createFormField: '',
        createFormCode: '',
        updateFieldList: [],
      });

      const visible = ref(false);
      const isUpdate = ref(false);
      const processExist = ref(false);
      const processOpenStatus = ref(false);
      const processName = ref('');

      // 弹窗展示
      async function show(data) {
        visible.value = true;
        console.log('data', data);
        title.value = data.title;
        const button = data.button;
        clearButtonInfo();
        Object.keys(button).map((k) => {
          myButton[k] = button[k];
        });
        isUpdate.value = data.isUpdate;

        conditions.value = button.conditionList;
        conditionsGroup.value = button.conditionsGroup;
        conditionType.value = button.conditionType;

        if (button.confirmText) {
          confirmText.tip = button.confirmText.tip;
          confirmText.ok = button.confirmText.ok;
          confirmText.cancel = button.confirmText.cancel;
        }
        if (button.buttonFormConfig) {
          buttonFormConfig.formTable = button.buttonFormConfig.formTable;
          buttonFormConfig.linkRecordField = button.buttonFormConfig.linkRecordField;
          buttonFormConfig.linkRecordTable = button.buttonFormConfig.linkRecordTable;

          buttonFormConfig.formType = button.buttonFormConfig.formType;
          buttonFormConfig.createFormField = button.buttonFormConfig.createFormField;
          buttonFormConfig.createFormCode = button.buttonFormConfig.createFormCode;
          buttonFormConfig.updateFieldList = button.buttonFormConfig.updateFieldList;
        }
        await reloadProcessInfo()
      }
      
      function getProcessName() {
        if(processName.value){
          return processName.value;
        }
        if(myButton.processId){
          return myButton.label;
        }
        return ''
      }

      function clearButtonInfo() {
        Object.keys(myButton).map((k) => {
          myButton[k] = '';
        });
        conditions.value = [];
        conditionsGroup.value = [];
        confirmText.tip = '你确认对记录执行此操作吗？';
        confirmText.ok = '确认';
        confirmText.cancel = '取消';
        
        Object.keys(buttonFormConfig).map(k=>{
          if(k==='updateFieldList'){
            buttonFormConfig[k] = []
          }else{
            buttonFormConfig[k] = ''
          }
        })
      }

      function onChangeLabel() {}
      function onChangeShowStatus() {}
      function onChangeClickThen() {
        if (myButton.clickThen === 'form') {
          // 如果是表单操作， 默认不需要走流程
          myButton.flowStatus = false;
        } else {
          myButton.flowStatus = true;
        }
      }
      function onChangeFlowStatus() {}
      function onChangeIcon() {
        console.error('onChangeIcon', myButton.icon);
      }
      function onChangeNote() {}

      function onChangeColor() {
        console.error('1111', myButton.color);
      }

      const showFlowTip = computed(() => {
        if (myButton.flowStatus === true) {
          return true;
        }
        if (myButton.clickThen === 'execute' || myButton.clickThen === 'confirm') {
          return true;
        }
        return false;
      });

      const formRef = ref();
      async function onSubmit() {
        try {
          await formRef.value.validateFields();
        } catch (e) {
          console.error('校验失败');
          return;
        }
        let info: any = {...toRaw(myButton)}
        if (info.showStatus === 'condition') {
          //如果有条件 需要将条件获取到
          info['conditionList'] = toRaw(conditions.value);
          info['conditionsGroup'] = toRaw(conditionsGroup.value);
          info['conditionType'] = toRaw(conditionType.value);
        }
        if (info.clickThen === 'confirm') {
          //找 确认文本
          info['confirmText'] = {
            ...toRaw(confirmText),
          };
        } else if (info.clickThen === 'form') {
          let formConfigData = buttonFormConfigRef.value.getData();
          if(formConfigData){
            info['buttonFormConfig'] = formConfigData;
          }
        }

        // update-begin--author:sunjianlei---date:20230111---for:【QQYUN-3969】视图自定义按钮，先编辑再添加就添加不上了
        if (info['buttonFormConfig'] == null || info['buttonFormConfig'] === '') {
          delete info['buttonFormConfig'];
        }
        if (!Array.isArray(info['conditionList'])) {
          delete info['conditionList'];
        }
        if (!Array.isArray(info['conditionsGroup'])) {
          delete info['conditionsGroup'];
        }
        if (info['confirmText'] == null || info['confirmText'] === '') {
          delete info['confirmText'];
        }
        // update-end--author:sunjianlei---date:20230111---for:【QQYUN-3969】视图自定义按钮，先编辑再添加就添加不上了

        console.log('保存按钮信息', info);
        if (isUpdate.value === true) {
          await updateButton(info);
        } else {
          const saveData:any = await saveButton(info);
          console.log('saveData>>>', saveData);
          goAddFlow(saveData)
        }
        visible.value = false;
        setTimeout(() => {
          emit('success');
        }, 500);
      }
      
      function goAddFlow(saveData) {
        if(saveData.success){
          if(myButton.flowStatus===true){
            let processId = saveData.result.processId;
            openFlowModal(true, {
              customProcessId: processId,
              processName: myButton.label,
              isUpdate: false,
              startType: 'buttonEvent',
              formName: props.designFormName,
              formCode: props.code,
              titleField: props.titleField
            })
          }
        }
      }
      
      function editFlow(e) {
        e.preventDefault();
        e.stopPropagation();
        let data:any = {}
        if(processExist.value === true){
          //流程已存在, 传ID 编辑
          data = {
            id: myButton.processId,
            isUpdate: true,
          }
        }else{
          //流程不存在, 传processId 创建
          data = {
            //update-begin---author:wangshuai ---date:20230807  for：【QQYUN-6150】自定义按钮对接流程，一开始未保存流程，等再次设置流程发现怎么保存也关联不上/【QQYUN-6020】删除流程后自定义按钮保存不上了------------
            customProcessId: myButton.processId,
            //update-end---author:wangshuai ---date:20230807  for：【QQYUN-6150】自定义按钮对接流程，一开始未保存流程，等再次设置流程发现怎么保存也关联不上/【QQYUN-6020】删除流程后自定义按钮保存不上了------------
            processName: myButton.label,
            isUpdate: false,
            startType: 'buttonEvent',
            formName: props.designFormName,
            formCode: props.code,
            titleField: props.titleField
          }
        }
        openFlowModal(true, data)
      }
      
      async function reloadProcessInfo() {
        processExist.value = false;
        processOpenStatus.value = false;
        processName.value = '';
        if(myButton.processId){
          const data = await getProcessInfo(myButton.processId);
          if(data && data.id){
            processExist.value = true;
            processName.value = data.processName;
            if(data.openStatus==1){
              processOpenStatus.value = true;
            }
          }
          console.log('getProcessInfo', data)
        }
      }

      function onClose() {
        visible.value = false;
      }

      const footerStyle = {
        bottom: '100px',
        zIndex: 9999,
      };

      const maxHeight = window.innerHeight - 200;
      const bodyStyle = {
        height: maxHeight + 'px',
        maxHeight: maxHeight + 'px',
        padding: '0 0 20px',
      };
      const disabledSumbit = computed(() => {
        if (myButton.label) {
          return false;
        }
        return true;
      });

      // 条件是否为空
      function isEmptyConditions() {
        return (conditionsGroup.value && conditionsGroup.value.length == 0) && (conditions.value && conditions.value.length == 0)
      }

      function onSelectBack() {
        if (isEmptyConditions()) {
          myButton.showStatus = 'always';
        }
      }

      function onSelectOk(data) {
        conditions.value = data.conditions;
        conditionsGroup.value = data.conditionsGroup;
        conditionType.value = data.conditionType;
        if (isEmptyConditions()) {
          myButton.showStatus = 'always';
        }
      }

      function updateConfirmText(info) {
        Object.keys(confirmText).map((k) => {
          confirmText[k] = info[k];
        });
      }

      let checkOnly = async (_rule, value) => {
        if (value === '') {
          return Promise.reject('请输入按钮名称！');
        } else {
          const flag = await checkOnlyButtonLabel(myButton.id, myButton.label);
          if (flag === false) {
            return Promise.reject('按钮名称重名，请重新定义！');
          }
          return Promise.resolve();
        }
      };
      const labelValidate = [{ validator: checkOnly, trigger: 'change' }];

      return {
        title,
        myButton,
        ...toRefs(myButton),
        bodyStyle,
        showFlowTip,
        onChangeLabel,
        onChangeShowStatus,
        onChangeClickThen,
        onChangeFlowStatus,
        onChangeIcon,
        onChangeColor,
        onChangeNote,
        onSubmit,
        onClose,
        footerStyle,
        visible,
        show,
        disabledSumbit,
        conditionType,
        conditions,
        conditionsGroup,
        onSelectBack,
        onSelectOk,
        confirmText,
        updateConfirmText,
        buttonFormConfigRef,
        isUpdate,
        formRef,
        labelValidate,
        buttonFormConfig,
        registerFlowModal,
        getProcessName,
        processOpenStatus,
        editFlow,
        reloadProcessInfo
      };
    },
  };
</script>

<style lang="less">
  .button-config {
    .item {
      h5 {
        font-size: 13px;
        font-weight: 500;
        margin: 0;
        padding: 24px 0 0;
        color: #333 !important;
      }
      .content {
        margin-top: 10px;
      }
      .tip {
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 3px;
        box-sizing: border-box;
        color: #333;
        display: flex;
        margin-top: 10px;
        padding: 8px 16px 10px;
        width: 100%;
      }
      .ant-radio-group {
        width: 100%;
        .ant-radio-wrapper {
          width: 28%;
          margin-right: 20px;
        }
      }
    }
  }
  .ant-modal-centered{
    .ant-select-item-option-content{
      text-align: left;
    }
  }
  .designer-form-button-drawer{
    .ant-drawer-header-title{
      flex-direction: row-reverse;
      .anticon-close{}
      padding: 3px;
    }
  }
</style>
