import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { checkCategory } from './EoaMailBox.api';
import { useUserStore } from '/@/store/modules/user';

/**
 * 收件箱列表数据
 */
export const columns: BasicColumn[] = [
  {
    title: '标题',
    align: 'center',
    dataIndex: 'title',
    width: 150,
    slots: { customRender: 'title' },
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'readFlag',
    customRender: ({ text, record }) => {
      return text === '0' ? '未读' : text === '1' ? '已读' : text;
    },
    width: 150,
  },
  {
    title: '发件人',
    align: 'center',
    dataIndex: 'senderId_dictText',
    width: 150,
    customRender: function ({ text, record }) {
      if (!text) {
        return record.senderId;
      } else {
        return text;
      }
    },
  },
  {
    title: '日期',
    align: 'center',
    dataIndex: 'sendTime',
    width: 150,
  },
  {
    title: '标签',
    align: 'center',
    dataIndex: 'tags',
    slots: { customRender: 'tags' },
  },
];

/**
 * 系统消息表格列
 */
export const systemMessageColumn: BasicColumn[] = [
  {
    title: '收件人',
    align: 'center',
    dataIndex: 'userId_dictText',
  },
  {
    title: '撤回状态',
    align: 'center',
    dataIndex: 'withdrawFlag',
    customRender: ({ text, record }) => (text === '1' ? '成功' : text === '2' ? '失败' : text === '0' ? '' : text),
  },
  {
    title: '备注',
    align: 'center',
    dataIndex: 'isDelete',
    customRender: function ({ text, record }) {
      if (record.withdrawFlag == '2') {
        return '对方可能已经阅读或删除该邮件，无法撤回。';
      } else {
        return '';
      }
    },
  },
];

/**
 * 发件箱列表
 */
export const sendColumn: BasicColumn[] = [
  {
    title: '标题',
    align: 'center',
    dataIndex: 'title',
    slots: { customRender: 'title' },
  },
  {
    title: '收件人',
    align: 'center',
    dataIndex: 'receiverIds_dictText',
  },
  {
    title: '日期',
    align: 'center',
    dataIndex: 'sendTime',
  },
];

/**
 * 阅读情况列表
 */
export const readColumn: BasicColumn[] = [
  {
    title: '收件人',
    dataIndex: 'userId_dictText',
    align: 'center',
  },
  {
    title: '阅读状态',
    align: 'center',
    dataIndex: 'readFlag',
    customRender: ({ text }) => (text === '1' ? '已读' : '未读'),
  },
  {
    title: '撤回状态',
    align: 'center',
    dataIndex: 'withdrawFlag',
    customRender: ({ text }) => (text === '1' ? '已撤回' : ''),
  },
];

/**
 * 标签列表
 */
export const tagColumns: BasicColumn[] = [
  {
    title: '标题',
    align: 'center',
    dataIndex: 'title',
    width: 150,
    slots: { customRender: 'title' },
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'readFlag',
    customRender: ({ text, record }) => {
      return text === '0' ? '未读' : text === '1' ? '已读' : text;
    },
    width: 150,
  },
  {
    title: '发件人',
    align: 'center',
    dataIndex: 'senderId_dictText',
    width: 150,
    customRender: function ({ text, record }) {
      if (!text) {
        return '系统发布';
      } else {
        return text;
      }
    },
  },
  {
    title: '日期',
    align: 'center',
    dataIndex: 'sendTime',
    width: 150,
  },
];

//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '发送到',
    field: 'receiverIds',
    component: 'JSelectUserByDept',
    componentProps: {
      labelKey: 'realname',
      rowKey: 'id',
      placeholder: '请选择收件人',
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择收件人!' }];
    },
  },
  {
    label: '邮箱标题',
    field: 'title',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入邮箱标题!' }];
    },
  },
  {
    label: '邮件内容',
    field: 'content',
    component: 'JEditor',
  },
  {
    label: '附件',
    field: 'attachment',
    component: 'JUpload',
  },
  {
    label: '紧急',
    field: 'urgentFlag',
    component: 'Checkbox',
    componentProps: {},
  },
  {
    label: '需要回执',
    field: 'receiptFlag',
    component: 'Checkbox',
    componentProps: {},
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

/**
 * 标签类型表单
 */
export const categorySchema: FormSchema[] = [
  {
    label: '标签名',
    field: 'labelName',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [
        {
          required: true,
          validator: (_, value) => {
            if (!value) {
              return Promise.reject('请输入标签名称');
            }
            return new Promise<void>((resolve, reject) => {
              const userStore = useUserStore();
              checkCategory({ name: value, userId: userStore.getUserInfo.id }).then((res) => {
                if (res.success) {
                  return resolve();
                } else {
                  return reject(res.message);
                }
              });
            });
          },
        },
      ];
    },
  },
];
