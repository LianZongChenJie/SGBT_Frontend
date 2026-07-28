import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
import { majorList } from '../inspectionContent/inspectionContent.api';
import { result } from 'lodash-es';

// 表格列配置
export const columns: BasicColumn[] = [
  { title: '系统名称', align: "center", dataIndex: 'systemName', width: 180 },
  { title: '系统编码', align: "center", dataIndex: 'systemCode', width: 80 },
  { title: '所属专业', align: "center", dataIndex: 'majorText', width: 100 },
  { title: '维护公司', align: "center", dataIndex: 'maintenanceCompany', width: 150 },
  // { title: '部署方式', align: "center", dataIndex: 'deployType', width: 120, slots: { customRender: 'deployType' } },
  { title: '是否纳入巡检', align: "center", dataIndex: 'needInspection', width: 100, slots: { customRender: 'needInspection' } },
  { title: '访问网址', align: "center", dataIndex: 'accessUrl', width: 180 },
  { title: '上线日期', align: "center", dataIndex: 'launchDate', width: 120 },
  { title: '状态', align: "center", dataIndex: 'status', width: 80, slots: { customRender: 'status' } },
];

// 搜索表单Schema
export const searchFormSchema: FormSchema[] = [
  { label: '系统名称', field: 'systemName', component: 'Input', colProps: { span: 8 } },
  { label: '系统编码', field: 'systemCode', component: 'Input', colProps: { span: 8 } },
  { label: '所属专业', field: 'majorText', component: 'Input', colProps: { span: 8 } },
  { label: '维护公司', field: 'maintenanceCompany', component: 'Input', colProps: { span: 8 } },
  {
    label: '是否纳入巡检', field: 'needInspection', component: 'Select', colProps: { span: 8 }, componentProps: {
      options: [
        { label: '是', value: '是' },
        { label: '否', value: '否' },
      ],
    }
  },
  { label: '访问网址', field: 'accessUrl', component: 'Input', colProps: { span: 8 } },
  {
    label: '状态', field: 'status', component: 'Select', colProps: { span: 8 }, componentProps: {
      options: [
        { label: '在用', value: 'ACTIVE' },
        { label: '未启用', value: 'INACTIVE' },
      ],
    }
  },
  { label: '上线日期范围', field: 'launchDateRange', component: 'RangePicker', colProps: { span: 8 } },
];

// 系统表单Schema
export const systemFormSchema: FormSchema[] = [
  { label: 'ID', field: 'id', component: 'Input', colProps: { span: 6 }, show: false },
  { label: '系统名称', field: 'systemName', component: 'Input', required: true, colProps: { span: 12 } },
  { label: '系统编码', field: 'systemCode', component: 'Input', required: true, colProps: { span: 12 } },
  { label: '', field: 'majorText', component: 'Input', show: false },
  {
    label: '所属专业', field: 'majorId', component: 'ApiSelect', required: true, colProps: { span: 12 }, componentProps: ({ formModel }) => {
      return {
        api: majorList,
        resultField: 'records',
        labelField: 'name',
        valueField: 'id',
        onChange: (value, option) => {
          formModel.majorText = option?.label || '';
        }
      };
    }
  },
  { label: '维护公司', field: 'maintenanceCompany', component: 'Input', required: true, colProps: { span: 12 } },
  { label: '上线日期', field: 'launchDate', component: 'DatePicker', colProps: { span: 12 }, componentProps: { format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' } },
  { label: '', field: 'responsibleDeptText', component: 'Input', show: false },
  {
    label: '责任部门', field: 'responsibleDept', component: 'JSelectDept', required: true, colProps: { span: 12 }, componentProps: ({ formModel }) => {
      return {
        labelKey: 'departName',
        rowKey: 'orgCode',
        onSelect: (options, values) => {
          if (options && options.length > 0) {
            formModel.responsibleDeptText = options[0].label || '';
          } else {
            formModel.responsibleDeptText = '';
          }
        }
      };
    }
  },
  { label: '系统负责人', field: 'owner', component: 'Input', required: true, colProps: { span: 12 } },
  { label: '联系方式', field: 'ownerContact', component: 'Input', colProps: { span: 12 } },
  {
    label: '部署方式', field: 'deployType', component: 'Select', colProps: { span: 12 }, componentProps: {
      options: [
        { label: '本地部署', value: 'LOCAL' },
        { label: '云部署', value: 'CLOUD' },
      ],
    }
  },
  { label: '系统访问网址', field: 'accessUrl', component: 'Input', colProps: { span: 12 } },
  { label: '系统描述', field: 'description', component: 'InputTextArea', colProps: { span: 12 } },
  {
    label: '台账状态', field: 'status', component: 'RadioGroup', componentProps: {
      options: [
        { label: '在用', value: 'ACTIVE' },
        { label: '未启用', value: 'INACTIVE' },
      ],
    }, colProps: { span: 12 }
  },
  {
    label: '文档附件', field: 'files', component: 'JUpload', colProps: { span: 24 }, componentProps: {
      maxCount: 5,
      multiple: true,
      returnUrl: false,
      onChange: (file) => {
      }
    }
  },
];

// 附件表单Schema
export const attachmentFormSchema: FormSchema[] = [
  // { label: '文件名称', field: 'name', component: 'Input', required: true, colProps: { span: 24 } },
  {
    label: '上传附件', field: 'file', component: 'JUpload', required: true, colProps: { span: 24 }, componentProps: {
      maxCount: 1
    }
  },
];
