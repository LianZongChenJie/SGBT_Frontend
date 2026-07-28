<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" :width="800" destroyOnClose>
    <BasicForm @register="registerForm">
      <template #nodeTimeout="{ model, field }">
        <a-input-number v-model:value="model[field]" :min="0"></a-input-number>（单位小时，0表示不提醒）
      </template>

      <template #modelAndView="{ model, field }">
        <a-input style="width: calc(100% - 20px);margin-right: 5px" v-model:value="model[field]"></a-input>
        <a-tooltip overlayClassName="process-node-tip">
          <template #title>
            <div class="tip-content">
              参考配置如下：<br>
              1.online：super/bpm/process/components/OnlineFormOpt<br>
              2.自定义编码：super/bpm/example/joa/leave/components/LeaveForm
              <div>{{designerUrl}}</div>
              详情参考 <a target="_blank" href="https://www.kancloud.cn/zhangdaiscott/jeecgboot_business/3214567">官方文档</a>
            </div>
          </template>
          <question-circle-outlined style="color: rgb(110 110 110)"/>
        </a-tooltip>
      </template>

      <template #modelAndViewMobile="{ model, field }">
        <a-input style="width: calc(100% - 20px);margin-right: 5px" v-model:value="model[field]"></a-input>
        <a-tooltip overlayClassName="process-node-tip">
          <template #title>
            <div class="tip-content">
              参考配置如下：<br>
              1.online：check/onlineForm/flowedit<br>
              2.自定义编码：applyform/scottNote
              <div>{{designerUrl}}</div>
              详情参考 <a target="_blank" href="https://www.kancloud.cn/zhangdaiscott/jeecgboot_business/2476430">官方文档</a>
            </div>
          </template>
          <question-circle-outlined style="color: rgb(110 110 110)"/>
        </a-tooltip>
      </template>
      
    </BasicForm>
  </BasicModal>
</template>

<script>
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { nodeFormSchema } from './process.node.data';
  import { saveOrUpdate } from './process.node.api';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  
  export default {
    name: 'ProcessNodeModal',
    components: {
      BasicModal,
      BasicForm,
      QuestionCircleOutlined
    },
    emits: ['success', 'register'],
    setup(_props, { emit }) {
      const isUpdate = ref(false);
      const title = computed(() => {
        return isUpdate.value === true ? '编辑' : '新增';
      });

      //表单配置
      const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, getFieldsValue }] = useForm({
        schemas: nodeFormSchema,
        showActionButtonGroup: false,
        baseColProps: { span: 24, style: { marginTop: '10px' } },
      });

      //useModalInner
      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.log('data', data);
        isUpdate.value = data.isUpdate;
        if (!data.isUpdate) {
          //新增页面 设置表单的 processId
          setFieldsValue({ processId: data.processId });
          //update-begin-author:taoyan date:2023-2-14 for: QQYUN-4266【老版流程】新增节点 节点名称和编码不能输入，子流程无法添加start节点
          await updateSchema([
            {
              field: 'processNodeName',
              componentProps: {
                readOnly: false,
              }
            }, {
              field: 'processNodeCode',
              componentProps: {
                readOnly: false,
              }
            }
          ]);
          //update-end-author:taoyan date:2023-2-14 for: QQYUN-4266【老版流程】新增节点 节点名称和编码不能输入，子流程无法添加start节点
        } else {
          delete data.isUpdate;
          setFieldsValue({ ...data });
          //update-begin-author:taoyan date:2023-2-14 for: QQYUN-4266【老版流程】新增节点 节点名称和编码不能输入，子流程无法添加start节点
          await updateSchema([
            {
              field: 'processNodeName',
              componentProps: {
                readOnly: true,
              }
            }, {
              field: 'processNodeCode',
              componentProps: {
                readOnly: true,
              }
            }
          ]);
          //update-end-author:taoyan date:2023-2-14 for: QQYUN-4266【老版流程】新增节点 节点名称和编码不能输入，子流程无法添加start节点
        }
      });

      async function handleSubmit() {
        const values = await validate();
        await saveOrUpdate(values, isUpdate.value);
        emit('success');
        closeModal();
      }
      
      const designerUrl = "3.表单设计器：{{DOMAIN_URL}}/desform/edit/设计器编码/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}"

      return {
        registerModal,
        title,
        handleSubmit,
        registerForm,
        designerUrl
      };
    },
  };
</script>
<style lang="less">
  .process-node-tip {
    .ant-tooltip-inner{
      width: 410px;
      .tip-content{
        width: 400px;
      }
    }
  }
</style>
<style scoped>
  :deep(.ant-modal-body) {
    padding-bottom: 5px !important;
    padding-top: 5px !important;
  }
</style>
