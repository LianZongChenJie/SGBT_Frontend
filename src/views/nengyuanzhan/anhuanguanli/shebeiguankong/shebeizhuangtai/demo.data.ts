import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '设备ID',
    dataIndex: 'deviceCode',
    width: 100,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 120,
    resizable: true,
    ellipsis: true,
  },

  {
    title: 'IP',
    dataIndex: 'deviceModule',
    width: 100,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备类型',
    dataIndex: 'sysOrgCode',
    width: 120,
    resizable: true,
    ellipsis: true,
    // dict:'sys_depart,org_code,depart_name',
  },
  {
    title: '所属系统',
    dataIndex: 'spaceId',
    width: 120,
    resizable: true,
  },
  {
    title: '位置',
    dataIndex: 'lo',
    width: 100,
    resizable: true,
  },
  {
    title: '运行状态',
    dataIndex: 'deviceStatus',
    width: 100,
    resizable: true,
    customRender: ({ text }) => {
      if (text == 1) {
        return '在线';
      } else if (text == 0) {
        return '离线';
      }
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'Input',
    colProps: { span: 12 },
  },
  {
    label: '设备ID',
    field: 'deviceID',
    component: 'Input',
    colProps: { span: 12 },
  },
  {
    label: '设备状态',
    field: 'deviceID2',
    component: 'Select',
    colProps: { span: 12 },
    componentProps:{
      options: [
        {label:'在线',value:1},
        {label:'离线',value:0},
      ]
    }
  },

];
