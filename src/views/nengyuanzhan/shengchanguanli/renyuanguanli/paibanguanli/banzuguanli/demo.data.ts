import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
import { defHttp } from '/@/utils/http/axios';
import { ref } from 'vue';
// import {render} from '/@/utils/common/renderUtils';
// import { h } from 'vue'
const shiftOptions = ref<any[]>([]);
const MAX_SHIFT_DAYS = 15;

//获取班次接口
export function getShiftListByOrgCode(sysOrgCode: string) {
  return defHttp.get({
    url: '/operation/energyPlanItem/ddl',
    params: { sysOrgCode },
  });
}

function getCycleDays(value) {
  const cycleDays = Number(value);
  return Number.isFinite(cycleDays) ? cycleDays : 0;
}

function getHiddenShiftDayValues(cycleDays: number) {
  const hiddenShiftDayValues = {};

  for (let i = cycleDays + 1; i <= MAX_SHIFT_DAYS; i++) {
    hiddenShiftDayValues[`shiftDay${i}`] = undefined;
  }

  return hiddenShiftDayValues;
}

function normalizeOrgCode(value: unknown) {
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]).trim() : '';
  }
  return String(value || '').trim();
}

function mapShiftOptions(list: Record<string, any>[] = []) {
  return list.map((item) => ({
    label: item.label,
    value: item.id,
  }));
}

function refreshShiftDaySchemas(formActionType, cycleDays = 0, options = shiftOptions.value) {
  const normalizedCycleDays = getCycleDays(cycleDays);
  const nextOptions = Array.isArray(options) ? [...options] : [];

  for (let i = 1; i <= MAX_SHIFT_DAYS; i++) {
    formActionType.updateSchema({
      field: `shiftDay${i}`,
      show: normalizedCycleDays >= i,
      componentProps: {
        options: nextOptions,
      },
    });
  }
}

export async function syncShiftDaySchemas(formActionType, cycleDays = 0, orgCode?: unknown) {
  const normalizedOrgCode = normalizeOrgCode(orgCode);
  const list = normalizedOrgCode ? await getShiftListByOrgCode(normalizedOrgCode) : [];
  shiftOptions.value = Array.isArray(list) ? mapShiftOptions(list) : [];
  refreshShiftDaySchemas(formActionType, cycleDays, shiftOptions.value);
}

export const columns: BasicColumn[] = [
  {
    title: '班组名称',
    dataIndex: 'groupName',
    width: 170,
    resizable: true,
  },
  {
    title: '班组编号',
    dataIndex: 'groupCode',
    width: 170,
    resizable: true,
  },
  {
    title: '班组负责人',
    dataIndex: 'leaderName',
    width: 170,
    resizable: true,
  },

  {
    title: '所属部门',
    dataIndex: 'sysOrgName', //sysOrgCode	所属科组
    width: 140,
    resizable: true,
  },
  {
    title: '倒班周期',
    dataIndex: 'cycleDays',
    width: 140,
    resizable: true,
  },
  {
    title: '班次范围',
    dataIndex: 'itemCodes',
    width: 140,
    resizable: true,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'groupName',
    label: '班组名称',
    component: 'Input',
    componentProps: {
      allowClear: true,
      placeholder: '请输入班组名称',
    },
    colProps: { span: 8 },
  },
  {
    field: 'groupCode',
    label: '班组编码',
    component: 'Input',
    componentProps: {
      allowClear: true,
      placeholder: '请输入班组编码',
    },
    colProps: { span: 8 },
  },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    componentProps: {
      showButton: false,
      labelKey: 'departName',
      rowKey: 'orgCode',
      placeholder: '请选择所属部门',
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
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
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    required: true,
    componentProps: ({ formActionType }) => ({
      showButton: false,
      multiple: false,
      checkStrictly: true,
      labelKey: 'departName',
      rowKey: 'orgCode',
      placeholder: '请选择所属部门',

      async onChange(orgCode) {
        const resetShiftValues = Object.fromEntries(Array.from({ length: MAX_SHIFT_DAYS }, (_, index) => [`shiftDay${index + 1}`, undefined]));
        await formActionType.setFieldsValue(resetShiftValues);
        const { cycleDays } = formActionType.getFieldsValue();
        await syncShiftDaySchemas(formActionType, cycleDays, orgCode);
      },
    }),
  },

  {
    field: 'groupName',
    label: '班组名称',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 30,
      placeholder: '请输入班组名称',
    },
  },
  {
    field: 'groupCode',
    label: '班组编码',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 30,
      placeholder: '请输入班组编码',
    },
  },
  {
    field: 'leader',
    label: '班组负责人',
    component: 'TreeSelect',
    required: true,
    componentProps: {
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
      placeholder: '请选择班组负责人',
    },
  },
  {
    field: 'cycleDays',
    label: '倒班周期',
    component: 'InputNumber',
    required: true,
    componentProps: ({ formActionType }) => ({
      min: 1,
      max: 15,
      addonAfter: '天',
      style: { width: '100%' },
      placeholder: '请输入倒班周期',
      async onChange(value) {
        const cycleDays = getCycleDays(value);
        const hiddenShiftDayValues = getHiddenShiftDayValues(cycleDays);
        const { sysOrgCode } = formActionType.getFieldsValue();

        if (Object.keys(hiddenShiftDayValues).length) {
          await formActionType.setFieldsValue(hiddenShiftDayValues);
        }

        await syncShiftDaySchemas(formActionType, cycleDays, sysOrgCode);
      },
      async onBlur() {
        const { cycleDays, sysOrgCode } = formActionType.getFieldsValue();
        await syncShiftDaySchemas(formActionType, cycleDays, sysOrgCode);
      },
    }),
  },
  {
    field: `shiftDay1`,
    label: `第1天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 1;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay2`,
    label: `第2天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 2;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay3`,
    label: `第3天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 3;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay4`,
    label: `第4天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 4;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay5`,
    label: `第5天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 5;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay6`,
    label: `第6天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 6;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay7`,
    label: `第7天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 7;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay8`,
    label: `第8天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 8;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay9`,
    label: `第9天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 9;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay10`,
    label: `第10天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 10;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay11`,
    label: `第11天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 11;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay12`,
    label: `第12天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 12;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay13`,
    label: `第13天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 13;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay14`,
    label: `第14天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 14;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
  {
    field: `shiftDay15`,
    label: `第15天`,
    component: 'Select',
    required: true,
    ifShow: ({ values }) => {
      return values.cycleDays >= 15;
    },
    componentProps: {
      placeholder: '选择班次',
      options: shiftOptions.value,
    },
  },
];
