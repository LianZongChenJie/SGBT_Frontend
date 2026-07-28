<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :minHeight="90" :title="title" @ok="handleSubmit" :width="700" destroyOnClose>
    <div style="padding-top: 10px">
      <BasicForm @register="registerForm">
        <template #pcIcon>
          <IconPicker v-model:value="iconInfo.pcIcon" :disabled="false" placeholder="点击选择表单图标" />
        </template>
        <template #appIcon>
          <IconPicker v-model:value="iconInfo.appIcon" :disabled="false" placeholder="点击选择移动表单图标" />
        </template>
      </BasicForm>
    </div>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, reactive, toRaw, h } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { SettingOutlined } from '@ant-design/icons-vue';
  import { IconPicker } from '/@/components/Icon';
  import { edit } from '../process.design.api';
  import { DesktopOutlined, MobileOutlined } from '@ant-design/icons-vue';

  export default {
    name: 'ProcessIconModal',
    components: {
      BasicModal,
      BasicForm,
      SettingOutlined,
      IconPicker,
    },
    emits: ['success', 'register'],
    setup(_props, { emit }) {
      const title = ref('');
      const iconInfo = reactive({
        id: '',
        pcIcon: '',
        appIcon: '',
      });

      //useModalInner
      const [registerModal, { closeModal }] = useModalInner((data) => {
        console.log('data', data);
        title.value = `流程【${data.processName}】图标设置`;
        iconInfo.id = data.id;
        iconInfo.pcIcon = data.pcIcon || '';
        iconInfo.appIcon = data.appIcon || '';
      });

      const formSchema = [
        {
          field: 'pcIcon',
          slot: 'pcIcon',
          component: 'Input',
          label: h('span', {}, ['PC表单图标   ', h(DesktopOutlined)]),
        },
        {
          field: 'appIcon',
          slot: 'appIcon',
          component: 'Input',
          label: h('span', {}, ['APP表单图标   ', h(MobileOutlined)]),
        },
      ];

      //表单配置
      const [registerForm] = useForm({
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: { span: 24 },
      });

      async function handleSubmit() {
        let data = toRaw(iconInfo);
        console.log('修改流程图标', data);
        await edit(data);
        emit('success');
        closeModal();
      }

      return {
        title,
        handleSubmit,
        registerModal,
        iconInfo,
        registerForm,
      };
    },
  };
</script>

<style scoped></style>
