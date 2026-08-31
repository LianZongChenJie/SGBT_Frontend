import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { renderTablePreviewImage } from '../../../utils/renderTablePreviewImage';
import { getEventTypes } from '@/views/nengyuanzhan/anhuanguanli/shipinxungeng/renwu/demo.api';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '巡逻任务名称',
    dataIndex: 'taskName',
    width: 170,
    resizable: true,
  },
  {
    title: '开始时间',
    dataIndex: 'actualStartTime',
    width: 140,
    resizable: true,
  },
  {
    title: '结束时间',
    dataIndex: 'actualEndTime',
    width: 140,
    resizable: true,
  },
  {
    title: '安保人员',
    dataIndex: 'execute',
    width: 140,
    resizable: true,
  },
  {
    title: '手动告警数',
    dataIndex: 'alarmCount',
    width: 140,
    resizable: true,
  },
  {
    title: '打卡状态',
    dataIndex: 'checkStatusStr',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'taskName',
    label: '巡更任务名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },

  {
    field: 'eventType',
    label: '告警类型',
    component: 'ApiSelect',
    componentProps: {
      api: getEventTypes,
      immediate: true,
      allowClear: true,
      labelField: 'label',
      valueField: 'value',
      placeholder: '请选择告警类型',
    },
    colProps: { span: 8 },
  },
  {
    field: 'startTime',
    label: '开始时间',
    component: 'DatePicker',
    colProps: { span: 8 },
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    field: 'endTime',
    label: '结束时间',
    component: 'DatePicker',
    colProps: { span: 8 },
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
    },
  },
];

export const columnsCamera: BasicColumn[] = [
  {
    title: '摄像头编码',
    dataIndex: 'deviceCode',
    width: 170,
    resizable: true,
  },

  {
    title: '开始时间',
    dataIndex: 'viewStartTime',
    width: 140,
    resizable: true,
  },
  {
    title: '结束时间',
    dataIndex: 'viewEndTime',
    width: 140,
    resizable: true,
  },
  {
    title: '查看图片',
    dataIndex: 'snapPic',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      return renderTablePreviewImage({
        text,
        width: 100,
        height: 60,
        style: {
          width: '100px',
          height: '60px',
          objectFit: 'cover',
          borderRadius: '4px',
        },
      });
    },
  },
  {
    title: '必打卡点',
    dataIndex: 'isRequired',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1) {
        return '是 ';
      } else {
        return '否';
      }
    },
  },
  {
    title: '是否打卡',
    dataIndex: 'checkStatus',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 0) {
        return '未打卡';
      } else {
        return '已打卡';
      }
    },
  },
  {
    title: '打卡时间',
    dataIndex: 'checkTime',
    width: 140,
    resizable: true,
  },
  {
    title: '打卡人',
    dataIndex: 'checkUserId',
    width: 140,
    resizable: true,
  },
];

export const columnsAlarm: BasicColumn[] = [
  {
    title: '摄像机编码',
    dataIndex: 'cameraCode',
    width: 170,
    resizable: true,
  },
  {
    title: '事件编号',
    dataIndex: 'eventCode',
    width: 170,
    resizable: true,
  },
  {
    title: '事件级别',
    dataIndex: 'eventLevel',
    width: 170,
    resizable: true,
  },
  {
    title: '事件时间',
    dataIndex: 'reportTime',
    width: 130,
    resizable: true,
  },
  {
    title: '事件类型',
    dataIndex: 'eventType',
    width: 140,
    resizable: true,
  },
  {
    title: '事件名称',
    dataIndex: 'eventName',
    width: 140,
    resizable: true,
  },
  {
    title: '事件位置',
    dataIndex: 'location',
    width: 140,
    resizable: true,
  },
  {
    title: '事件描述',
    dataIndex: 'description',
    width: 180,
    resizable: true,
  },
  {
    title: '上报人',
    dataIndex: 'reportUserId',
    width: 140,
    resizable: true,
  },
  {
    title: '抓拍图片',
    dataIndex: 'imageUrl',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      return renderTablePreviewImage({
        text,
        width: 100,
        height: 60,
        style: {
          width: '100px',
          height: '60px',
          objectFit: 'cover',
          borderRadius: '4px',
        },
      });
    },
  },
];
