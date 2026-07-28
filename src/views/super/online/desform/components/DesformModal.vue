<template>
  <BasicModal v-bind="getProps" destroyOnClose>
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <BasicForm @register="registerForm">
        <template #cgformSwitch>
          <a-switch v-model:checked="openCgform" checkedChildren="开启" unCheckedChildren="关闭" />
          <span class="cgform-tip">开启后将自动根据选择的Online表单生成</span>
        </template>
        <template #copyMethod>
          <a-radio-group v-model:value="copyMethod" button-style="solid" @change="templateRadioChange">
            <a-radio-button :value="1">完全复制</a-radio-button>
            <a-tooltip title="只有对接了Online表单才能选择模板重新生成" v-bind="copyMethodTooltipProps">
              <a-radio-button :value="2" :disabled="!isDockingCgform">选择模板重新生成</a-radio-button>
            </a-tooltip>
          </a-radio-group>
        </template>
      </BasicForm>
    </a-spin>

    <template #footer>
      <a-button @click="onCancel">关闭</a-button>
      <a-button type="primary" :loading="loading" preIcon="ant-design:save" @click="onSubmit">保存</a-button>
      <div class="footer-left" v-if="isListModal">
        <a-checkbox v-if="!isUpdate" v-model:checked="openDesign">添加后自动打开设计</a-checkbox>
      </div>
    </template>
  </BasicModal>
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { computed, defineComponent, ref, unref, watchEffect } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { pinyin } from 'pinyin-pro';
  import { cloneDeep } from 'lodash-es';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formApi, onlineApi } from '../desform.api';
  import { getFormSchema } from '../desform.data';
  import { DesformEnums } from '../enums/DesformEnums';
  import { generateByCgform } from '../utils/generateUtils';
  import {duplicateCheck} from "/@/views/system/user/user.api";
  import { randomString } from '/@/utils/common/compUtils';

  const noUseTemplet = '_______no_use_templet_______';
  //忽略双排和三排模版风格
  const ignoreTemplate = ['dobule_templet', 'three_templet'];
  export default defineComponent({
    name: 'DesformModal',
    components: {
      BasicModal,
      BasicForm,
    },
    emits: ['register', 'success', 'added'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      const { createMessage: $message, notification } = useMessage();
      // 是否是更新模式
      const isUpdate = ref(false);
      // 当前弹窗模式
      const action = ref('default');
      //是否简化添加表单，isListModal=false的时候，不展示表单编码和online等字段，让操作更简单（目前用于低代码应用对接）。
      const isListModal = ref(true);
      // 是否是复制表单模式
      const isCopying = computed(() => action.value === 'copy');
      // 是否是复制视图模式
      const isCopyView = computed(() => action.value === 'copy-view');
      // 编辑时存储的值
      const model = ref<Recordable>({});
      // 弹窗标题
      const title = computed(() => {
        if (isCopying.value) {
          return '复制工作表';
        }
        if (isCopyView.value) {
          return '复制视图';
        }
        return isUpdate.value ? '编辑工作表' : '新建工作表';
      });
      // 当前是否正在加载中
      const loading = ref(true);
      // 是否开启Online表单
      const openCgform = ref(false);
      // 复制表单，复制方式：1 = 完全复制，2 = 重新生成
      const copyMethod = ref(1);
      // 添加后自动打开设计
      const openDesign = ref(true);
      // 是否对接了Online表单
      const isDockingCgform = computed(() => !!model.value?.cgformCode);
      // 是否显示设置移动视图按钮
      const showSetMobileView = computed(() => {
        if (isCopyView.value) {
          return true;
        }
        let { desformType } = model.value;
        // 当前为新增，且
        if (!desformType) {
          return false;
        }
        return desformType !== DesformEnums.DESFORM_TYPE_MV;
      });
      // 复制方式tooltip的Props
      const copyMethodTooltipProps = computed(() => {
        let props = {
          autoAdjustOverflow: true,
        };
        if (isDockingCgform.value) {
          props['visible'] = false;
        }
        return props;
      });
      const allTables = ref<Recordable>({});
      const cgformOptions = ref<Recordable[]>([]);
      // 当前模板json
      const templetJson = ref<Nullable<string>>(null);
      // 模板 options
      const templetOptions = ref<Recordable[]>([{ label: '默认模版', value: noUseTemplet, templetJson: null }]);

      // 注册弹窗
      const [registerModal, { closeModal, setModalProps }] = useModalInner(open);
      // 获取表单的 schema
      const formSchemaRef = getFormSchema({
        isUpdate,
        isCopying,
        isCopyView,
        openCgform,
        copyMethod,
        cgformOptions,
        templetJson,
        templetOptions,
        showSetMobileView,
        onDesformNameChange,
        isListModal,
        onSubmit
      });
      // 注册表单
      const [registerForm, { validate, resetFields, setFieldsValue }] = useForm({
        schemas: formSchemaRef,
        showActionButtonGroup: false,
        labelAlign: 'right',
      });

      // 弹窗最终props
      const getProps = computed(() => {
        let modalProps: Partial<ModalProps> = {
          width: 800,
          minHeight: 120,
          title: unref(title),
          maskClosable: false,
          confirmLoading: unref(loading),
        };
        let finalProps: Recordable = {
          ...modalProps,
          ...unref(attrs),
          ...props,
          onCancel: close,
          onRegister: registerModal,
        };
        return finalProps;
      });

      watchEffect(() => {
        //update-begin---author:wangshuai---date:2024-06-03---for:【TV360X-863】复制试图一开始选择模板，下拉没有选项，新增之后再次点击视图才显示---
        if ((openCgform.value || copyMethod.value == 2) && cgformOptions.value?.length === 0) {
        //update-end---author:wangshuai---date:2024-06-03---for:【TV360X-863】复制试图一开始选择模板，下拉没有选项，新增之后再次点击视图才显示---
          requestTemplet();
        }
      });

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
        setModalProps({ confirmLoading: flag });
      }

      // 菜单分组ID [低代码应用]
      const menuGroupId = ref('')
      function open(data) {
        isUpdate.value = !!unref(data?.isUpdate);
        action.value = data?.action ?? 'default';
        copyMethod.value = 1;
        openCgform.value = false;
        templetJson.value = null;
        if (!isUpdate.value) {
          add();
        } else {
          edit(data?.record);
        }
        isListModal.value = true;
        // [低代码应用]
        if(data.isListModal === false){
          isListModal.value = false;
          menuGroupId.value = data.menuGroupId;
          //update-begin---author:wangshuai---date:2023-11-06---for:【QQYUN-6925】新建表单自动触焦---
          if(!isUpdate.value){
            document.getElementById("desformNameInput")?.focus();
          }
          //update-end---author:wangshuai---date:2023-11-06---for:【QQYUN-6925】新建表单自动触焦---
        }
      }

      function add() {
        edit({});
      }

      async function edit(record) {
        setLoading(false);
        // 重置表单
        await resetFields();
        model.value = cloneDeep(record);
        let formData: Recordable = { ...model.value };
        if (isCopying.value || isCopyView.value) {
          let after = isCopying.value ? '_copy' : isCopyView.value ? '_view' : '';
          formData.desformName = record['desformName'] + after;
          formData.desformCode = record['desformCode'] + after;
          formData.desformIcon = record['desformIcon'];
          formData.izMobileView = record['izMobileView'] === 1 ? 1 : 0;
        }
        await setFieldsValue(formData);
      }

      async function onSubmit() {
        let update = isUpdate.value;
        // 验证主表表单
        try {
          let values = await validate();
          //update-begin-author:taoyan date:2022-12-10 for: 去掉表单编码的填写框
          if(isListModal.value === false && update===false){
            // 新增modal 且 是 myapps 中的modal
            let code = pinyin(values.desformName, {
              toneType: 'none',
              type: 'array',
              nonZh: 'consecutive',
            }).join('_');

            //---------------------------------------------------------------------------
            //【低代码模式下】表单编码自动生成规则
            //1.默认转为小写
            code = code.toLowerCase()
            //2.去掉特殊字符，只允许英文单词和下划线和数字
            code = code.replace(/[^0-9a-z_]+/gi,'');
            //3.非字母开头，补充前缀
            let pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
            if (!pattern.test(code)) {
              code = 'jeecg_'+ code;
            }
            //4.超长截取，只保留最多30位
            if(code.length>30){
              code = code.substring(0,30);
            }
            //5.加四位随机后缀字符，避免表名重复
            code = code + '_' +randomString(4);
            //---------------------------------------------------------------------------
            
            let res = await duplicateCheck({
              tableName: 'design_form',
              fieldName: 'desform_code',
              fieldVal: code,
            });
            if (!res.success) {
              $message.warn('该名称存在，请更换！', code);
              return ;
            }
            values['desformCode'] = code;
            //[低代码应用]
            values['appMenuGroupId'] = menuGroupId.value;
          }
          //update-end-author:taoyan date:2022-12-10 for: 去掉表单编码的填写框

          let formData = Object.assign({}, values);
          let izMobileView = formData['izMobileView'] || 0;
          // 复制表单
          if (isCopying.value) {
            update = false;
            delete formData['id'];
            // 复制表单去除 Online对接
            if (isDockingCgform.value) {
              let desformJSON = JSON.parse(model.value['desformDesignJson']);
              delete formData['cgformCode'];
              delete desformJSON.config.onlineForm;
              formData['desformDesignJson'] = JSON.stringify(desformJSON);
            } else {
              formData['desformDesignJson'] = model.value['desformDesignJson'];
            }
          } else if (isCopyView.value) {
            update = false;
            delete formData['id'];
            formData['parentId'] = model.value['id'];
            formData['parentCode'] = model.value['desformCode'];
            formData['desformType'] = DesformEnums.DESFORM_TYPE_SV;
            // 判定复制方式（1 完全复制；2 选择模板重新生成）
            if (copyMethod.value === 1) {
              let desformJSON = JSON.parse(model.value['desformDesignJson']);
              // 如果是复制的移动视图，则默认显示为移动效果
              if (izMobileView == 1) {
                desformJSON.config.designMobileView = true;
              }
              formData['desformDesignJson'] = JSON.stringify(desformJSON);
            } else if (isDockingCgform.value) {
              formData['cgformCode'] = model.value['cgformCode'];
            } else {
              $message.warn('没有对接Online表单，拒绝执行该操作');
              return;
            }
          } else if (templetJson.value != null) {
            formData['desformDesignJson'] = templetJson.value;
          }
          if (update) {
            formData = Object.assign({}, model.value, formData);
          }
          setLoading(true);
          try {
            // 【根据Online表单生成】
            // 查询cgform的field
            let cgformCode = update ? null : formData['cgformCode'];
            let desformJSON = await generateDesformJSONByCgform(cgformCode);
            if (desformJSON != null) {
              // 复制移动视图，默认改成移动效果
              if (izMobileView == '1') {
                desformJSON.config.designMobileView = true;
              }
              formData['desformDesignJson'] = JSON.stringify(desformJSON);
            }
          } catch (e) {
            console.error(e);
            return;
          }
          // 编辑模式下，如果不是复制模式，则无需向后台传递json
          if (update && !isCopying.value && !isCopyView.value && templetJson.value == null) {
            delete formData['desformDesignJson'];
          }
          // 提交表单
          await formApi.saveOrUpdate(formData, update);
          //关闭弹窗
          closeModal();
          // 刷新列表
          let payload: Recordable = { openDesign: false };
          if (!isUpdate.value) {
            payload.desformCode = formData.desformCode;
            payload.openDesign = openDesign.value;
          }
          emit('success', payload);
        } finally {
          hideLoading();
        }
      }

      function onCancel() {
        closeModal();
      }

      // 表单名变化事件，转换为拼音
      function onDesformNameChange(value) {
        let code = pinyin(value, {
          toneType: 'none',
          type: 'array',
          nonZh: 'consecutive',
        }).join('_');
        //update-begin-author:liusq---date:2024-06-03--for: [TV360X-646]将拼音翻译后的字符串中的 (非字母开头、数字、下划线、横杠)过滤掉
        code = code.replace(/[^a-zA-Z0-9_\-]/g, '');
        //update-end-author:liusq---date:2024-06-03--for: [TV360X-646]将拼音翻译后的字符串中的 (非字母开头、数字、下划线、横杠)过滤掉
        setFieldsValue({ desformCode: code.toLowerCase() });
      }

      /** 请求查询模板 */
      async function requestTemplet() {
        setLoading(true);
        let [cgformList, templetList] = await Promise.all([formApi.queryCgformList(), formApi.queryTemplet()]).finally(() => setLoading(false));
        if (cgformList.success) {
          let $cgformOptions: Recordable[] = [];
          let $allTables: Recordable = {};
          cgformList.result.records.forEach((item) => {
            $allTables[item.tableName] = item;

            let { tableType, copyType } = item;
            // 不显示附表
            if (tableType.toString() === '3') {
              return;
            }
            // 不显示视图
            if (copyType.toString() === '1') {
              return;
            }
            $cgformOptions.push({ label: item['tableTxt'] + `（${item['tableName']}）`, value: item['tableName'] });
          });

          $cgformOptions.unshift({ label: '请选择表单', value: noUseTemplet });
          allTables.value = $allTables;
          cgformOptions.value = $cgformOptions;
        } else {
          notification.warning({ message: '模板查询失败', description: templetList.message });
        }

        if (templetList.success) {
          //update-begin-author:liusq---date:2024-06-03--for: 【TV360X-656】对接online排版可以不用栅格布局了，可以用1/2的方式布局
          templetList.result.unshift({ label: '默认模版', value: noUseTemplet, templetJson: null });
          templetOptions.value = templetList.result.filter((item) => !ignoreTemplate.includes(item.value));
          //update-end-author:liusq---date:2024-06-03--for:【TV360X-656】对接online排版可以不用栅格布局了，可以用1/2的方式布局
        } else {
          notification.warning({ message: '模板查询失败', description: templetList.message });
        }
      }

      /**
       * 通过Online表单和模板生成表单设计器JSON
       *
       * @param cgformCode Online表单Code
       */
      async function generateDesformJSONByCgform(cgformCode) {
        if (cgformCode && cgformCode !== noUseTemplet) {
          setLoading(true);

          // 调用该方法可关闭加载
          messageLoading = $message.loading('正在通过Online表单生成中');

          // 包含所有要生成在页面中的表，index0一定是主表，往后都是附表
          let onlineForms = [allTables.value[cgformCode]];
          // 包含所有要查询的cgform，和 onlineForms 一一对应
          let allP = [onlineApi.fieldListByHeadCode(cgformCode)];
          // 判断是否包含子表
          let subTables = (onlineForms[0]['subTableStr'] || '').split(',');
          if (subTables[0]) {
            onlineForms = onlineForms.concat(
              subTables.map((code) => {
                allP.push(onlineApi.fieldListByHeadCode(code));
                return allTables.value[code];
              })
            );
          }
          try {
            // 查询所有的Online表单（包括主表和子表）
            let results = await Promise.all(allP);
            // 取出主表
            let main = results[0];
            // 根据 online表单 生成 表单设计器JSON
            if (main.success) {
              // Online表单字段配置信息
              let onlineFields = results.map((i) => i.result);
              // 通过工具类生成
              let desformJSON = generateByCgform(null, onlineForms, onlineFields, templetJson.value);
              // 将online表单保存至config
              desformJSON.config.onlineForm = cgformCode;
              return desformJSON;
            } else {
              hideLoading('error', '生成失败: ' + main.message);
            }
          } catch (e) {
            console.error(e);
            hideLoading('error', '生成失败!');
          }
        }
        return null;
      }

      let messageLoading: any = null;

      /** 关闭加载框方法 */
      function hideLoading(type?, content?) {
        setLoading(false);
        // 关掉 this.$message.loading
        if (typeof messageLoading === 'function') {
          messageLoading();
          messageLoading = null;
        }
        // 弹出新的 message
        if (type) {
          $message[type](content);
        }
      }

      /**
       * 视图是否完全复制点击事件
       */
      function templateRadioChange(){
        if(unref(copyMethod) == 2){
          setModalProps({ height: '150px' })
        }
      }

      return {
        getProps,
        isUpdate,
        loading,
        openCgform,
        copyMethod,
        openDesign,
        isDockingCgform,
        copyMethodTooltipProps,
        onCancel,
        onSubmit,
        registerModal,
        registerForm,
        isListModal,
        templateRadioChange,
      };
    },
  });
</script>

<style scoped lang="less">
  .cgform-tip {
    position: relative;
    left: 8px;
    top: 2px;
    color: #bfbfbf;
  }

  .footer-left {
    position: absolute;
    left: 0;
    text-align: left;
    display: inline-block;
    line-height: 32px;
    padding-left: 12px;
  }
</style>
