<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled" class="pr3">
      <template #faultDesc="{ model, field }">
        <div style="display: flex; align-items: flex-start; width: 100%">
          <a-textarea
            v-model:value="model.faultDesc"
            :rows="3"
            style="flex: 1"
            placeholder="请输入故障描述"
          />
          <a-button type="link" @click="openGuzhangku">故障库</a-button>
        </div>
      </template>
    </BasicForm>

    <DemoModalSheBei :isDisabled="isDisabled" @register="registerModalShebei" @success="getShebeiID"></DemoModalSheBei>
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, computed, unref, reactive, toRaw } from 'vue';
import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
import { usePermission } from '/@/hooks/web/usePermission';
import DemoModalSheBei from './DemoModalShebei.vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const [registerModalShebei, { openModal: openModalShebei }] = useModal();
const { hasPermission } = usePermission();
import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
import {
  saveOrUpdateDemo,
  getDemoById,
} from './demo.api';
import { getTreeListGuzhangleibie } from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/guzhangleibie/demo.api';
import { getUserData } from '@/views/system/usersetting/UserSetting.api';
import { queryTreeList } from '@/api/common/api';
// 声明Emits
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);


//自定义接受参数
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'createBy',
    label: 'createBy',
    component: 'Input',
    show: false,
  },
  {
    field: 'createTime',
    label: 'createTime',
    component: 'Input',
    show: false,
  },
  {
    field: 'baseTitle',
    component: 'Divider',
    label: '基础信息',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    field: 'orderNo',
    label: '报修单号',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'theme',
    label: '报修主题',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    field: 'reporterName',
    label: '报修人',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'reporterId',
    label: '报修人ID',
    component: 'Input',
    required: true,
    show:false,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'deptName',
    label: '所属部门',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'deptId',
    label: '所属部门Id',
    component: 'Input',
    required: true,
    show:false,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  // {
  //   field: 'sysOrgCode',
  //   label: '所属部门',
  //   component: 'JSelectDept',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps:{
  //     disabled: true,
  //     showButton: false,
  //     style: {
  //       width: '100%',
  //     },
  //     labelKey:'departName',
  //     rowKey:'orgCode'
  //   }
  // },
  {
    field: 'contactPhone',
    label: '联系方式',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    colProps: {span: 24},
    componentProps: {
      rows: 3,
      disabled: false,
      style: { width: '100%' },
    },
  },

  {
    field: 'baseTitle2',
    component: 'Divider',
    label: '设备信息',
    componentProps: {
      //是否虚线
      dashed: false,
      //分割线标题的位置（left | right | center）
      orientation: 'left',
      //文字是否显示为普通正文样式
      plain:true,
      //水平还是垂直类型（horizontal | vertical）
      type:'horizontal',
    },
  },
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'InputSearch',
    required:true,
    colProps: { span: 12 },
    // show: false,
    componentProps: {
      disabled: false,
      readonly: true,
      //搜索之后触发事件
      onSearch: () => {
        handleShezhi();
      },
    },
  },
  {
    field: 'deviceId',
    label: '设备ID',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    show:false,
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
{
    field: 'deviceCode',
    label: '设备编号',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'deviceType',
    label: '设备类型',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'specModel',
    label: '规格型号',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'storageLocation',
    label: '存放位置',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'groupName',
    label: '使用部门',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },


  {
    field: 'baseTitle3',
    component: 'Divider',
    label: '故障信息',
    componentProps: {
      //是否虚线
      dashed: false,
      //分割线标题的位置（left | right | center）
      orientation: 'left',
      //文字是否显示为普通正文样式
      plain:true,
      //水平还是垂直类型（horizontal | vertical）
      type:'horizontal',
    },
  },

  {
    field: 'faultTime',
    label: '故障时间',
    component: 'DatePicker',
    required: true,
    colProps: {span: 12},
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      format:'YYYY-MM-DD HH:mm:ss'
    },
  },
  {
    field: 'faultLevel',
    label: '故障等级',
    component: 'Select',
    required: true,
    // defaultValue: 1,
    colProps: {span: 12},
    componentProps: {
      options: [
        { label: '紧急', value: 4 },
        { label: '高', value: 3 },
        { label: '中', value: 2 },
        { label: '低', value: 1 },
      ],
    },
  },
  {
    field: 'categoryId',
    label: '故障类别',
    component: 'ApiTreeSelect',
    required: true,
    colProps: {span: 12},
    componentProps: {
      api:getTreeListGuzhangleibie, // 请求接口
      fieldNames: {
        label: 'categoryName',
        value: 'id',
        children: 'children',
      },
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      style: {width: '100%'}
    },
  },
  {
    field: 'isDowntime',
    label: '是否停机',
    component: 'Switch',
    required: true,
    colProps: { span: 12 },
    defaultValue:0,
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
  {
    field: 'faultDesc',
    label: '故障描述',
    component: 'InputTextArea',
    required: false,
    slot: 'faultDesc',
    // componentProps: {
    //   // suffix:'故障库',
    //   rows: 3,
    //   style: { width: '100%' },
    // },
  },

  {
    field: 'baseTitle3323',
    component: 'Divider',
    label: '故障图片',
    componentProps: {
      //是否虚线
      dashed: false,
      //分割线标题的位置（left | right | center）
      orientation: 'left',
      //文字是否显示为普通正文样式
      plain:true,
      //水平还是垂直类型（horizontal | vertical）
      type:'horizontal',
    },
  },

  {
    field: 'images',
    label: '故障图片',
    required: false,
    helpMessage: '最多上传10张图片',
    component: 'JImageUpload',
    componentProps: {
      //按钮显示文字
      text: '上传图片',
      //支持两种基本样式picture和picture-card
      // listType:'picture-card',
      //用于控制文件上传的业务路径,默认temp
      // bizPath:'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 10,
    },
  },

];
//表单配置
const [registerForm, { resetFields, setFieldsValue,clearValidate,getFieldsValue, validate, updateSchema }] = useForm({
  labelWidth: 150,
  labelCol: {span: 24},
  wrapperCol: {span: 24},
  schemas: formSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  let userObj = await getUserData()
  let dept = await queryTreeList({ids:userObj.result.departIds})
  let obj = {
    reporterName:userObj.result.username,
    reporterId:userObj.result.id,
    deptName:dept[0].departName,
    deptId:dept[0].id,
    contactPhone:userObj.result.phone,
  }
  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
  isUpdate.value = !!data?.isUpdate;
  await setFieldsValue({
    ...obj,
  });
   // = await getXunjianmingxiList;
  if (data.createBy) {
    await setFieldsValue({createBy: data.createBy})
  }
  if (data.createTime) {
    await setFieldsValue({createTime: data.createTime})
  }
  if (unref(isUpdate)) {
    //获取详情
    data.record = await getDemoById({id: data.record.id});
    data.record.groupName = data.record.groupName || data.record.useDept;
    //表单赋值

    await setFieldsValue({
      ...data.record,
    });
    clearValidate()
  }
});


//设置标题
const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
function handleShezhi() {
  openModalShebei(true,{
    record:{},
    isUpdate:false
  })
}
function getShebeiID(record) {
  let deviceObj = {
    deviceId:record.id,
    deviceCode:record.deviceCode,
    deviceName:record.deviceName,
    specModel:record.deviceModule || record.specModel,//规格型号
    deviceType:record.deviceType || record.deviceTypeName || record.deviceModule,//设备类型
    storageLocation:record.spaceName || record.storageLocation || record.spaceId,//设备位置
    groupName:record.groupName || record.useDept || record.useDeptName || record.sysOrgCode_dictText || record.sysOrgCode // 使用部门
  }
  setFieldsValue({
    ...deviceObj
  })
}


/**
 * 新增事件
 */
const isDisabled = ref(false);

//表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    setModalProps({confirmLoading: true});
    //提交表单
    await saveOrUpdateDemo(values, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}
function openGuzhangku() {
  router.push({ path: '/shebeiguzhangku' });
}
</script>
