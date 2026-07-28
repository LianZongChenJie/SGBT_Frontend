import { BasicColumn, FormSchema } from '/@/components/Table';
import { getUserList } from "@/api/common/api";
export const columns: BasicColumn[] = [
  {
    title: '工单编号',
    align: "center",
    dataIndex: 'code'
  },
  {
    title: '工单区域',
    align: "center",
    dataIndex: 'spaceName'
  },
  {
    title: '报事分类',
    align: "center",
    dataIndex: 'orderType'
  },
  /*{
    title: '工单时限',
    align: "center",
    dataIndex: 'hours'
  },*/
  {
    title: '工单状态',
    align: "center",
    dataIndex: 'status'
  },
  {
    title: '联系人',
    align: "center",
    dataIndex: 'contractPeople'
  },
  {
    title: '联系电话',
    align: "center",
    dataIndex: 'contractPhone'
  }
];

export const searchFormSchema: FormSchema[] = [
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
        { value: '进行中', label: '进行中' },
        { value: '待验收', label: '待验收' },
        { value: '待评价', label: '待评价' },
        { value: '已完成', label: '已完成' },
      ]
    },
    colProps: { span: 8 },
  },
  {
    field: 'apaceName',
    label: '工单区域',
    component: 'Select',
    componentProps: {
      options: [
        { value: '金安桥', label: '金安桥' },
        { value: '冬奥组委', label: '冬奥组委' },
        { value: '冬训中心', label: '冬训中心' },
        { value: '大跳台', label: '大跳台' },
        { value: '脱硫车间', label: '脱硫车间' },
      ]
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
    required: true
  },
  {
    label: '联系电话',
    field: 'contractPhone',
    component: 'Input',
    show: true,
    required: true
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
        { value: '脱硫车间', label: '脱硫车间' }
      ]
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
        { value: '其他', label: '其他' }
      ]
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
      ]
    },
  },
  /*  {
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
    }
  },
];


export const transferSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '事件主键',
    field: 'eventId',
    component: 'Input',
    show: false,
  },
  {
    label: '联系人',
    field: 'contractPeople',
    component: 'Input',
    show: true,
    required: true
  },
  {
    label: '联系电话',
    field: 'contractPhone',
    component: 'Input',
    show: true,
    required: true
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
        { value: '脱硫车间', label: '脱硫车间' }
      ]
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
        { value: '其他', label: '其他' }
      ]
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
      ]
    },
  },
  /*  {
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
  /*{
    label: '值班员',
    field: 'attendant',
    component: 'Input',
    show: true,
  },*/
  {
    label: '问题描述',
    field: 'description',
    component: 'InputTextArea',
    show: true,
    required: true,
  },
  {
    label: '班组长',
    field: 'leaderId',
    component: 'ApiSelect',
    componentProps: {
      mode: 'single',
      api: getUserList,
      labelField: 'realname',
      valueField: 'id',
      immediate: true,
      resultField: 'records',
      /* transform: (res) => {
         if (res.success && res.result && res.result.records) {
           return res.result.records;
         }
         return [];
       }*/
    },
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
    }
  }
];
