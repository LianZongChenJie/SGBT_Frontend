import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description/index';
import { JImageUpload } from '@/components/Form';
import { formatImageUrls } from '@/utils/event/index';
import { h } from 'vue';
import { getUserList } from '@/views/event/manager/eventOrder.api';
import { getAllOrganizationList } from '/@/views/inventory/warehouse/api';
import star from '/@/assets/images/star.png';

export const spareColumns = [
  {
    title: '物料名称',
    dataIndex: 'materialName',
    //width: '17%',
  },
  {
    title: '物料分类',
    dataIndex: 'typeName',
    //width: '15%',
  },
  {
    title: '规格',
    dataIndex: 'specification',
    //width: '15%',
  },
  {
    title: '单位',
    dataIndex: 'unit',
    //width: '15%',
  },
  {
    title: '数量',
    dataIndex: 'num',
    //width: '15%',
  },
];
export const statusColor = {
  待接单: '#e48000',
  待分配: '#e48000',
  进行中: '#0e82f6',
  待验收: '#e48000',
  待评价: '#e48000',
  已完成: '#909090',
};

export const sparePartsColumn: BasicColumn[] = [
  {
    title: '物料名称',
    align: 'center',
    dataIndex: 'code',
  },
  {
    title: '物料分类',
    align: 'center',
    dataIndex: 'spaceName',
  },
  {
    title: '规格',
    align: 'center',
    dataIndex: 'orderType',
  },
  {
    title: '单位',
    align: 'center',
    dataIndex: 'status',
  },
];
export const schema: DescItem[] = [
  {
    field: 'code',
    label: '工单编号',
  },
  {
    field: 'createdTime',
    label: '创建时间',
  },

  {
    field: 'contractPeople',
    label: '联系人',
    show: (data) => !!data.contractPeople,
  },
  {
    field: 'contractPhone',
    label: '联系电话',
    show: (data) => !!data.contractPhone,
  },
  {
    field: 'service3',
    label: '服务分类',
  },
  {
    field: 'spaceName',
    label: '区域',
  },
  {
    field: 'address',
    label: '详细地址',
  },
  {
    field: 'isArea',
    label: '是否租区内',
    render: (value) => (value ? '是' : '否'),
  },
  {
    field: 'urgency',
    label: '紧急程度',
  },
  {
    field: 'forCustomer',
    label: '是否代客报事',
    render: (value) => (value ? '是' : '否'),
  },
  {
    field: 'creatPeopleName',
    label: '创建人',
  },
  {
    field: 'isPaid',
    label: '是否有偿',
    render: (value) => (value ? '是' : '否'),
  },

  {
    field: 'price',
    label: '价格',
    span: 4,
  },
  {
    field: 'description',
    label: '问题描述',
    span: 4,
  },
  {
    field: 'pics',
    label: '图片',
    span: 4,
    render: (value) => {
      const imgArray = formatImageUrls(value);
      return h(JImageUpload, {
        value: imgArray,
        disabled: true,
        fileMax: 6,
        isShowDownload: true,
      });
    },
  },
];
export const schemaEvaluate: DescItem[] = [
  {
    field: 'operatorName',
    label: '评价人',
    span: 4,
  },
  {
    field: 'redio',
    label: '评价结果',
    span: 4,
    render: (value) => {
      const starCount = Number(value) || 0;
      return h('div', { class: 'star-container' }, [
        ...Array.from({ length: starCount }).map((_, i) =>
          h('img', {
            key: i,
            src: star, // 星星图片路径
            alt: '星星',
            class: 'star-icon',
            style: {
              width: '20px',
              height: '20px',
              marginRight: '4px',
              objectFit: 'contain',
            },
          })
        ),
      ]);
    },
  },
  {
    field: 'description',
    label: '评价内容',
    span: 4,
  },
];
export const schemaAA: DescItem[] = [
  {
    field: 'description',
    label: '问题描述',
    span: 4,
  },
  {
    field: 'pics',
    label: '图片',
    span: 4,
    render: (value) => {
      const imgArray = formatImageUrls(value);
      return h(JImageUpload, {
        value: imgArray,
        disabled: true,
        fileMax: 6,
        isShowDownload: true,
      });
    },
  },
];
export const checkInfoSchema: DescItem[] = [
  {
    field: 'dealResult',
    label: '处理结果',
    span: 4,
  },
  {
    field: 'dealpics',
    label: '图片',
    span: 4,
    render: (value) => {
      const imgArray = formatImageUrls(value);
      return h(JImageUpload, {
        value: imgArray,
        disabled: true,
        fileMax: 6,
        isShowDownload: true,
      });
    },
  },
];
export const userInfoSchema: DescItem[] = [
  {
    field: 'contractPeople',
    label: '联系人',
    // show: (data) => !!data.contractPeople,
  },
  {
    field: 'contractPhone',
    label: '联系电话',
    // show: (data) => !!data.contractPhone,
  },
  {
    field: 'company',
    label: '公司',
    span: 2,
  },
  {
    field: 'remark',
    label: '备注',
    span: 4,
  },
];
export const columns: BasicColumn[] = [
  {
    title: '工单编号',
    align: 'center',
    dataIndex: 'code',
  },
  {
    title: '工单区域',
    align: 'center',
    dataIndex: 'spaceName',
  },
  {
    title: '报事分类',
    align: 'center',
    dataIndex: 'orderType',
  },
  /*{
    title: '工单时限',
    align: "center",
    dataIndex: 'hours'
  },*/
  {
    title: '联系人',
    align: 'center',
    dataIndex: 'contractPeople',
  },
  {
    title: '联系电话',
    align: 'center',
    dataIndex: 'contractPhone',
  },
  {
    title: '是否租区内',
    align: 'center',
    dataIndex: 'isArea',
    width: 110,
    customRender: ({ record }) => {
      let v = record.isArea ? '是' : '否';
      return v;
    },
  },
  {
    title: '是否有偿',
    align: 'center',
    width: 110,
    dataIndex: 'isPaid',
    customRender: ({ record }) => {
      let v = record.isPaid ? '是' : '否';
      return v;
    },
  },
  {
    title: '是否代客报事',
    align: 'center',
    width: 110,
    dataIndex: 'forCustomer',
    customRender: ({ record }) => {
      let v = record.forCustomer ? '是' : '否';
      return v;
    },
  },
  {
    title: '是否超时',
    align: 'center',
    dataIndex: 'isTimeout',
    customRender: ({ record }) => {
      let v = record.isTimeout ? '是' : '否';
      return v;
    },
  },
  {
    title: '工单状态',
    align: 'center',
    dataIndex: 'status',
  },
  {
    title: '服务分类',
    align: 'center',
    dataIndex: 'serviceType',
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createdTime',
  },
  /*{
    title: '联系人',
    align: "center",
    dataIndex: 'contractPeople',

  },
  {
    title: '联系电话',
    align: "center",
    dataIndex: 'contractPhone',
  }*/
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'code',
    label: '单号',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'contractPeople',
    label: '联系人',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'contractPhone',
    label: '联系电话',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '工单状态',
    component: 'Select',
    componentProps: {
      options: [
        { value: '待接单', label: '待接单' },
        { value: '待分配', label: '待分配' },
        { value: '待指派', label: '待指派' },
        { value: '进行中', label: '进行中' },
        { value: '待验收', label: '待验收' },
        { value: '已完成', label: '已完成' },
        { value: '待评价', label: '待评价' },
        { value: '已终止', label: '已终止' },
        { value: '暂停中', label: '暂停中' },
        { value: '未审批', label: '未审批' },
        { value: '已审批', label: '已审批' },
        { value: '验收不通过', label: '验收不通过' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'serviceType',
    label: '服务分类',
    component: 'Select',
    componentProps: {
      options: [
        { label: '强电', value: '强电' },
        { label: '空水', value: '空水' },
        { label: '弱电', value: '弱电' },
        { label: '综维', value: '综维' },
        { label: '消防', value: '消防' },
        { label: '安全', value: '安全' },
        { label: '环境卫生', value: '环境卫生' },
        { label: '绿化景观', value: '绿化景观' },
        { label: '其他', value: '其他' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'spaceName',
    label: '工单区域',
    component: 'ApiSelect',
    componentProps: () => {
      return {
        //mode: 'multiple',
        api: async () => {
          const organizations = await getAllOrganizationList({ keyWord: '项目部' });
          return organizations; // 返回完整数据供选择器渲染
        },
        numberToString: true,
        labelField: 'departName',
        valueField: 'departName',
        immediate: false,
      };
    },
    colProps: { span: 8 },
  },
  {
    field: 'timeRange',
    component: 'RangePicker',
    label: '时间范围',
    componentProps: {
      valueType: 'date',
      picker: 'date',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: {
      span: 8,
    },
  },
  {
    field: 'isTimeout',
    label: '是否超时',
    component: 'Select',
    componentProps: {
      options: [
        { value: 'true', label: '是' },
        { value: 'false', label: '否' },
      ],
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '联系人',
    field: 'contractPeople',
    component: 'Input',
    show: true,
    required: true,
  },
  {
    label: '联系电话',
    field: 'contractPhone',
    component: 'Input',
    show: true,
    required: true,
  },
  {
    label: '区域',
    field: 'spaceName',
    component: 'Select',
    show: true,
    required: true,
    componentProps: {
      options: [
        { value: '金安桥', label: '金安桥' },
        { value: '冬奥组委', label: '冬奥组委' },
        { value: '冬训中心', label: '冬训中心' },
        { value: '大跳台', label: '大跳台' },
        { value: '脱硫车间', label: '脱硫车间' },
      ],
    },
  },
  {
    label: '类型',
    field: 'orderType',
    component: 'Select',
    show: true,
    required: true,
    componentProps: {
      options: [
        { value: '报事报修', label: '报事报修' },
        { value: '技术支持', label: '技术支持' },
        { value: '业务咨询', label: '业务咨询' },
        { value: '投诉建议', label: '大跳台' },
        { value: '其他', label: '其他' },
      ],
    },
  },
  {
    label: '工单来源',
    field: 'orderSource',
    component: 'Select',
    show: true,
    required: true,
    componentProps: {
      options: [
        { value: '客服电话', label: '客服电话' },
        { value: '人工录入', label: '人工录入' },
      ],
    },
  },
  /*{
    label: '处理时限(小时)',
    field: 'hours',
    component: 'InputNumber',
    show: true,
    required: true,
    componentProps: {
      min: 1,
      //defaultValue: 2

    }
  },*/
  {
    label: '问题描述',
    field: 'description',
    component: 'InputTextArea',
    show: true,
    required: true,
  },
  {
    label: '图片/视频',
    field: 'pics',
    component: 'JImageUpload',
    show: true,
    required: true,
    componentProps: {
      //按钮显示文字
      text: '图片上传',
      //支持两种基本样式picture和picture-card
      listType: 'picture-card',
      //用于控制文件上传的业务路径,默认temp
      bizPath: 'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 6,
    },
  },
];
export const userSelectSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '处理人名称',
    field: 'userName', // 隐藏字段存储名称
    component: 'Input',
    show: false, // 隐藏显示
  },
  {
    label: '处理人',
    field: 'personInfo',
    component: 'ApiSelect',
    required: true,
    componentProps: ({ formModel }) => {
      return {
        api: getUserList,
        numberToString: true,
        labelField: 'realname',
        valueField: 'id',
        immediate: false,
        params: {
          roleId: '4',
        },
        onChange: (_, values) => {
          if (!values) {
            formModel.userName = '';
            return;
          }
          formModel.userName = values.label;
        },
      };
    },
  },
  {
    label: '服务分类',
    field: 'ser',
    component: 'Cascader',
    required: true,
    componentProps: ({ formModel }) => {
      return {
        options: serviceType,
        onChange: (val: string[]) => {
          formModel.service1 = val[0];
          formModel.service2 = val[1];
          formModel.service3 = val[2];
        },
      };
    },
  },
  {
    label: '备注',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
  {
    label: '1',
    field: 'service1',
    component: 'Input',
    show: false,
  },
  {
    label: '2',
    field: 'service2',
    component: 'Input',
    show: false,
  },
  {
    label: '3',
    field: 'service3',
    component: 'Input',
    show: false,
  },
];
export const assignSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '人',
    field: 'userName',
    component: 'Input',
    show: false,
  },
  {
    label: '专业主管',
    field: 'personInfo',
    component: 'ApiSelect',
    required: true,
    componentProps: ({ formModel }) => {
      return {
        api: getUserList,
        numberToString: true,
        labelField: 'realname',
        valueField: 'id',
        immediate: false,
        params: {
          roleId: '3',
        },
        onChange: (_, values) => {
          if (!values) {
            formModel.userName = '';
            return;
          }
          formModel.userName = values.label;
        },
      };
    },
  },
  {
    label: '备注',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
];

export const processSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '处理结果',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
  {
    label: '图片/视频',
    field: 'pics',
    component: 'JImageUpload',
    show: true,
    required: false,
    componentProps: {
      //按钮显示文字
      text: '图片上传',
      //支持两种基本样式picture和picture-card
      listType: 'picture-card',
      //用于控制文件上传的业务路径,默认temp
      bizPath: 'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 6,
    },
  },
];
export const checkSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '验收结果',
    field: 'redio',
    component: 'RadioGroup',
    show: true,
    required: true,
    defaultValue: 'Y',
    componentProps: {
      options: [
        { label: '通过', value: 'Y' },
        { label: '不通过', value: 'N' },
      ],
      //
    },
  },
  {
    label: '验收意见',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
];
export const appraiseSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '满意度',
    field: 'redio',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: [
        { label: '非常满意', value: 'Y' },
        { label: '满意', value: 'Z' },
        { label: '不满意', value: 'N' },
      ],
      defaultValue: 'Y', // 设置默认选中"非常满意"
    },
  },
  {
    label: '其它',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
];
export const defaultSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '描述',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
  {
    label: '图片/视频',
    field: 'pics',
    component: 'JImageUpload',
    show: true,
    required: false,
    componentProps: {
      //按钮显示文字
      text: '图片上传',
      //支持两种基本样式picture和picture-card
      listType: 'picture-card',
      //用于控制文件上传的业务路径,默认temp
      bizPath: 'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 6,
    },
  },
];
export const timeOutSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '预计下次开始时间',
    field: 'nextTime',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true, // 启用时间选择
      format: 'YYYY-MM-DD HH:mm:ss', // 显示格式
      valueFormat: 'YYYY-MM-DD HH:mm:ss', // 绑定值的格式
      placeholder: '请选择预计下次开始时间',
    },
  },
  {
    label: '描述',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
  {
    label: '图片/视频',
    field: 'pics',
    component: 'JImageUpload',
    show: true,
    required: false,
    componentProps: {
      //按钮显示文字
      text: '图片上传',
      //支持两种基本样式picture和picture-card
      listType: 'picture-card',
      //用于控制文件上传的业务路径,默认temp
      bizPath: 'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 6,
    },
  },
];

const serviceType = [
  {
    label: '工程',
    value: '工程',
    children: [
      {
        label: '强电',
        value: '强电',
        children: [{ label: '强电', value: '强电' }],
      },
      {
        label: '空水',
        value: '空水',
        children: [{ label: '空水', value: '空水' }],
      },
      {
        label: '弱电',
        value: '弱电',
        children: [{ label: '弱电', value: '弱电' }],
      },
      {
        label: '综维',
        value: '综维',
        children: [{ label: '综维', value: '综维' }],
      },
    ],
  },
  {
    label: '安保',
    value: '安保',
    children: [
      {
        label: '消防',
        value: '消防',
        children: [{ label: '消防', value: '消防' }],
      },
      {
        label: '安全',
        value: '安全',
        children: [{ label: '安全', value: '安全' }],
      },
    ],
  },
  {
    label: '客服',
    value: '客服',
    children: [
      {
        label: '环境卫生',
        value: '环境卫生',
        children: [{ label: '环境卫生', value: '环境卫生' }],
      },
      {
        label: '绿化景观',
        value: '绿化景观',
        children: [{ label: '绿化景观', value: '绿化景观' }],
      },
      {
        label: '其他',
        value: '其他',
        children: [{ label: '其他', value: '其他' }],
      },
    ],
  },
];
