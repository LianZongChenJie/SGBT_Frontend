<template>
  <a-spin :spinning="confirmLoading">
    <a-form ref="formRef" :model="model" :labelCol="labelCol" :wrapperCol="wrapperCol" :rules="validatorRules">
      <a-row>
        <a-col :span="24">
          <a-form-item label="标题" name="title">
            <a-input v-model:value="model.title" placeholder="请输入标题"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="model.type == 'approve'">
          <a-form-item label="副标题">
            <a-input v-model:value="model.subTitle" placeholder="请输入副标题"></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="路由">
            <a-input placeholder="点击选择路由" v-model:value="model.routeIndex">
              <template #addonAfter>
                <Icon icon="ant-design:select-outlined" @click="selectRoute"></Icon>
              </template>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="菜单分组" name="type">
            <JDictSelectTag v-model:value="model.type" dictCode="app_menu_group" placeholder="请选择菜单分组" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="是否开启">
            <JSwitch v-model:value="model.status" :options="[1, 2]"></JSwitch>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="图标配置">
            <a-radio-group v-model:value="iconConfig" button-style="solid">
              <a-radio-button value="1">图标库选择</a-radio-button>
              <a-radio-button value="2">自定义上传 </a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="iconConfig == '1'">
          <a-form-item label="图标" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <div class="img_div" v-if="model.icon">
              <img :src="model.icon" style="width: 60px; height: 60px" />
              <div class="mask">
                <Icon icon="ant-design:delete-outlined" @click="deleteIcon" style="font-size: 20px; margin-top: 20px"></Icon>
              </div>
            </div>
            <div class="add" @click="selectIcons" v-if="!model.icon"></div>
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="iconConfig == '2'">
          <a-form-item label="图标">
            <JImageUpload v-model:value="model.icon"></JImageUpload>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="排序">
            <a-input-number v-model:value="model.sort" placeholder="请输入排序" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- 选择图标 -->
    <AppIconsModal @register="registerModal" @choose="handleIconChoose"></AppIconsModal>
    <!-- 选择路由 -->
    <AppRouteModal @register="registerRouteModal" @choose="handleRouteChoose"></AppRouteModal>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import JSwitch from '/@/components/Form/src/jeecg/components/JSwitch.vue';
  import JImageUpload from '/@/components/Form/src/jeecg/components/JImageUpload.vue';
  import AppIconsModal from './AppIconsModal.vue';
  import AppRouteModal from './AppRouteModal.vue';
  import { useModal } from '/@/components/Modal';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveOrUpdateRoute, queryRouteById } from '../appdes.api';
  import {isEmpty} from "/@/utils/is";

  const emit = defineEmits(['ok']);
  const [registerModal, { openModal }] = useModal();
  const [registerRouteModal, { openModal: openRouteModal }] = useModal();
  const confirmLoading = ref(false);
  const formRef = ref(null);
  const { createMessage } = useMessage();
  const iconConfig = ref('1');
  const labelCol = {
    xs: { span: 24 },
    sm: { span: 5 },
  };
  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 16 },
  };
  const model = reactive({
    id: '',
    title: '',
    type: 'common',
    subTitle: '',
    routeIndex: '',
    status: '',
    icon: '',
    sort: 0,
  });

  /**
   * 显示初始化数据
   * @param record
   */
  function show(record?) {
    resetForm();
    Object.assign(model, initData);
    record && Object.assign(model, record);
  }

  /**
   * 选择图标,打来弹窗
   */
  function selectIcons() {
    openModal(true);
  }
  /**
   * 选择路由,打来弹窗
   */
  function selectRoute() {
    openRouteModal(true);
  }
  /**
   * 图标选择确认回调方法
   */
  function handleIconChoose(value) {
    model.icon = value;
  }
  /**
   * 路由选择确认回调方法
   */
  function handleRouteChoose(value) {
    model.routeIndex = value;
  }
  /**
   * 删除图标
   */
  function deleteIcon() {
    model.icon = '';
  }
  /**
   * 初始化表单
   */
  function resetForm() {
    formRef.value.resetFields();
  }

  /**
   * 提交保存路由信息
   */
  function handleSubmit() {
    const form: any = unref(formRef);
    form.validate().then(async () => {
      let obj = toRaw(model);
      confirmLoading.value = true;
      const res = await saveOrUpdateRoute(obj, obj.id);
      confirmLoading.value = false;
      if (res.success) {
        //update-begin-author:liusq---date:20230207--for:新增保存完成后，将新增的id设置一下  ---
        if(isEmpty(obj.id)){
          model.id = res.result.id
        }
        //update-end-author:liusq---date:20230207--for: 新增保存完成后，将新增的id设置一下 ---
        createMessage.success(res.message || '保存成功');
        emit('ok');
      } else {
        createMessage.warning(res.message);
      }
    });
  }

  /**
   * 删除更新排版后，同步右侧表单的排序字段
   * @param id
   */
  async function syncForm(id?) {
    if (model.id) {
      if (!id) {
        //拖拽后更新表单的排序
        const res = await queryRouteById({ id: model.id });
        if (res.success && res.result) {
          model.sort = res.result.sort;
          model.type = res.result.type;
        }
      }
      //当前选中表单删除后，重置一下右侧的表单
      if (id && model.id == id) {
        resetForm();
        Object.assign(model, initData);
      }
    }
  }
  //表单校验规则
  const validatorRules = {
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
    type: [{ required: true, message: '菜单分组不能为空', trigger: 'change' }],
  };
  //初始化数据
  const initData = {
    id: '',
    title: '',
    type: 'common',
    subTitle: '',
    routeIndex: '',
    status: '1',
    icon: '',
    sort: 0,
  };
  defineExpose({
    show,
    resetForm,
    handleSubmit,
    syncForm,
    model
  });
</script>

<style scoped>
  .img_div {
    position: relative;
    width: 60px;
    height: 60px;
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 60px;
    height: 60px;
    background: rgba(101, 101, 101, 0.6);
    color: #fff;
    opacity: 0;
    text-align: center;
  }

  .img_div .mask:hover {
    opacity: 1;
  }

  .add {
    border: 1px solid;
    width: 60px;
    height: 60px;
    color: #ccc;
    transition: color 0.25s;
    position: relative;
  }

  .add::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 30px;
    margin-left: -15px;
    border-top: 2px solid;
  }

  .add::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    height: 30px;
    margin-top: -15px;
    border-left: 2px solid;
  }
</style>
