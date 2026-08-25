import { BasicColumn, FormSchema } from '/@/components/Table';

const inlineDateItemProps = {
  labelCol: {
    style: {
      flex: '0 0 72px',
      width: '72px',
      whiteSpace: 'nowrap',
    },
  },
  wrapperCol: {
    style: {
      flex: '1 1 0',
      width: 'calc(100% - 72px)',
      minWidth: 0,
      paddingLeft: '4px',
      boxSizing: 'border-box',
    },
  },
};

export const columns: BasicColumn[] = [
  {
    title: '设备ID',
    dataIndex: 'deviceId',
    width: 150,
    resizable: true,
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 150,
    resizable: true,
  },
  {
    title: '开始时间',
    dataIndex: 'beginTime',
    width: 180,
    resizable: true,
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 180,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'startTime',
    label: '开始时间',
    component: 'DatePicker',
    required: true,
    disabledLabelWidth: true,
    itemProps: inlineDateItemProps,
    colProps: { span: 8, style: { paddingRight: '8px' } },
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      format: 'YYYY-MM-DD HH:mm:ss',
      disabled: false,
      getPopupContainer: () => document.body,
      popupClassName: 'history-date-picker-popup',
    },
  },
  {
    field: 'endTime',
    label: '结束时间',
    component: 'DatePicker',
    required: true,
    disabledLabelWidth: true,
    itemProps: inlineDateItemProps,
    colProps: { span: 8, style: { paddingRight: '8px' } },
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      format: 'YYYY-MM-DD HH:mm:ss',
      disabled: false,
      getPopupContainer: () => document.body,
      popupClassName: 'history-date-picker-popup',
    },
  },
];
