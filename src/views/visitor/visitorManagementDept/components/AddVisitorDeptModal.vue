<template>
  <a-modal
    v-model:open="open"
    :title="modalTitle"
    @ok="handleOk"
    width="900px"
    :footer="null"
  >
    <div
      class="form-box"
      v-if="open"
    >
      <BasicForm
        @register="registerForm"
        :schemas="formSchemas"
        :model="formState"
        :labelWidth="100"
        :showActionButtonGroup="false"
      />
      <div class="button-box">
        <a-button @click="handleReset">取消</a-button>
        &emsp;
        &emsp;
        <a-button
          type="primary"
          @click="handleSubmit"
        >保存</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useForm, BasicForm, FormSchema } from '/@/components/Form';
import { addVisitorApi } from '../VisitorDept.api';
import { queryDepartTreeSync } from '/@/api/common/api';
import { departUserList } from '/@/views/system/departUser/depart.user.api';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {},
  },
});

const open = ref<boolean>(false);

// 弹框标题
const modalTitle = ref<string>('新增访客');

// 通行方式下拉选项
const accessTypeOptions = [
  { label: '单次通行', value: '1' },
  { label: '多次通行', value: '2' },
];

// 部门树数据
const deptTreeData = ref<any[]>([]);
// 部门下用户列表
const userOptions = ref<any[]>([]);
// 当前选中的部门ID
const selectedDeptId = ref<string>('');

// 加载部门树
async function loadDeptTree() {
  try {
    const res = await queryDepartTreeSync();
    if (res && Array.isArray(res)) {
      deptTreeData.value = transformTreeData(res);
    }
  } catch (error) {
    console.error('加载部门树失败:', error);
  }
}

// 转换树数据格式
function transformTreeData(data: any[]): any[] {
  return data.map((item) => {
    const node: any = {
      title: item.departName || item.title,
      value: item.id,
      key: item.id,
      isLeaf: item.isLeaf || item.leaf || false,
    };
    if (item.children && item.children.length > 0) {
      node.children = transformTreeData(item.children);
    }
    return node;
  });
}

// 异步加载子部门
async function loadChildrenTreeData(treeNode: any) {
  try {
    const res = await queryDepartTreeSync({ pid: treeNode.dataRef.value });
    if (res && Array.isArray(res) && res.length > 0) {
      const children = transformTreeData(res);
      treeNode.dataRef.children = children;
      deptTreeData.value = [...deptTreeData.value];
    } else {
      treeNode.dataRef.isLeaf = true;
    }
  } catch (error) {
    console.error('加载子部门失败:', error);
  }
  return Promise.resolve();
}

// 根据部门ID加载用户列表
async function loadUserListByDept(deptId: string) {
  if (!deptId) {
    userOptions.value = [];
    return;
  }
  try {
    const res = await departUserList({ depId: deptId, pageNo: 1, pageSize: 999 });
    if (res && res.records) {
      userOptions.value = res.records.map((user: any) => ({
        label: user.realname || user.username,
        value: user.id,
      }));
    } else if (res && Array.isArray(res)) {
      userOptions.value = res.map((user: any) => ({
        label: user.realname || user.username,
        value: user.id,
      }));
    } else {
      userOptions.value = [];
    }
  } catch (error) {
    console.error('加载用户列表失败:', error);
    userOptions.value = [];
  }
}

// 自定义表单字段
const formSchemas: FormSchema[] = [
  {
    field: 'name',
    component: 'Input',
    label: '访客姓名',
    required: true,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'idNumber',
    component: 'Input',
    label: '身份证号',
    required: true,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'mobile',
    component: 'Input',
    label: '手机号',
    required: true,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'company',
    component: 'Input',
    label: '来访公司',
    required: true,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'memo',
    component: 'InputTextArea',
    label: '来访事由',
    required: true,
    colProps: {
      span: 24,
    },
  },
  {
    field: 'deptId',
    component: 'TreeSelect',
    label: '被访单位',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      treeData: deptTreeData,
      placeholder: '请选择被访单位',
      allowClear: true,
      treeDefaultExpandAll: false,
      loadData: loadChildrenTreeData,
      onChange: (value: string) => {
        selectedDeptId.value = value;
        // 清空已选被访人
        setFieldsValue({ userId: undefined });
      },
    },
  },
  {
    field: 'userId',
    component: 'Select',
    label: '被访人',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      options: userOptions,
      placeholder: '请先选择被访单位',
      allowClear: true,
    },
  },
  {
    field: 'startTime',
    component: 'DatePicker',
    label: '开始时间',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
    },
  },
  {
    field: 'endTime',
    component: 'DatePicker',
    label: '结束时间',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
    },
  },
  {
    field: 'accessType',
    component: 'Select',
    label: '通行方式',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      options: accessTypeOptions,
      placeholder: '请选择通行方式',
    },
  },
];

/**
 * BasicForm绑定注册;
 */
const [registerForm, { validate, resetFields, setFieldsValue, updateSchema }] = useForm();

const formState = ref<Record<string, any>>({
  name: '',
  idNumber: '',
  mobile: '',
  company: '',
  memo: '',
  deptId: undefined,
  userId: undefined,
  startTime: '',
  endTime: '',
  accessType: undefined,
});

// 监听部门变化，更新被访人下拉选项
watch(
  () => selectedDeptId.value,
  async (newVal) => {
    await loadUserListByDept(newVal);
    updateSchema({
      field: 'userId',
      componentProps: {
        options: userOptions.value,
        placeholder: newVal ? '请选择被访人' : '请先选择被访单位',
        allowClear: true,
      },
    });
  }
);

// 打开弹框
const showModal = async () => {
  open.value = true;
  await nextTick();
  resetFields();
  modalTitle.value = '新增访客';
  selectedDeptId.value = '';
  userOptions.value = [];
  // 加载部门树
  await loadDeptTree();
  // 初始化被访人下拉框为空
  updateSchema({
    field: 'userId',
    componentProps: {
      options: [],
      placeholder: '请先选择被访单位',
      allowClear: true,
    },
  });
};

// 提交表单
const handleSubmit = async () => {
  try {
    const values = await validate();
    let params = {
      ...values,
      status: '0',
    };
    let res = await addVisitorApi(params);
    if (res) {
      message.success('新增成功！');
      resetFields();
      open.value = false;
      props.reload();
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 重置表单
const handleReset = () => {
  resetFields();
  open.value = false;
};

// 关闭弹框
const handleOk = () => {
  open.value = false;
};

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.form-box {
  padding: 16px;
  padding-left: 0;

  .button-box {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
}
</style>
