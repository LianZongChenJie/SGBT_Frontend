import dayjs from 'dayjs';
import { calculateFileSize } from "/@/utils/common/compUtils";

export const columns = [
  {
    title: '文件名称',
    dataIndex: 'fileName',
    key: 'fileName',
    width: 400,
    ellipsis: true,
  },
  {
    title: '创建者',
    dataIndex: 'realname',
    width: 200,
    key: 'realname',
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 200,
    customRender: ({ text }) => {
      if (text) {
        return dayjs(text).format('YYYY-MM-DD');
      }
    },
  },
  {
    title: '文件大小',
    dataIndex: 'fileSize',
    key: 'fileSize',
    customRender: ({ text }) => {
      if (text) {
        return calculateFileSize(text);
      } else {
        return '-';
      }
    },
  },
];

export const miniColumns = [
  {
    title: '文件名称',
    dataIndex: 'fileName',
    key: 'fileName',
    width: 300,
    ellipsis: true,
  },
  {
    title: '创建者',
    dataIndex: 'realname',
    width: 100,
    key: 'realname',
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 150,
    customRender: ({ text }) => {
      if (text) {
        return dayjs(text).format('YYYY-MM-DD');
      } else {
        return '-';
      }
    },
  },
  {
    title: '文件大小',
    dataIndex: 'fileSize',
    key: 'fileSize',
    customRender: ({ text }) => {
      if (text) {
       return calculateFileSize(text);
      } else {
        return '-';
      }
    },
  },
];
