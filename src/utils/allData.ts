export const userTypeObj = {
  inside_user: '内部员工',
  inside_temporary: '外包员工',
  outside_temporary: '外来人员',
  '-': '-'
}

export const statusObj = {
  '未开始': '#C0C4CC',
  '进行中': '#E6A23C',
  '已结束': '#F56C6C'
}

export const planStatusObj = {
  '草稿': '#909399',
  '待生效': '#F7BA1E',
  '生效中': '#00B42A',
  '已停用': '#F53F3F',
  '已结束': '#165DFF',
}

export const carAllData = [
  { label: '西南露天大型车辆', value: 'southwest_open_car' },
  { label: '关院级贵宾车辆', value: 'vip_car' },
  { label: '主要演职人员车辆', value: 'vip_car_show' },
  { label: '固定货车', value: 'fixed_truck' },
  { label: '临时货车', value: 'temporary_truck' },
  { label: '东西南物流平台大客车', value: 'southwest_open_bus' },
  { label: '部门级贵宾车辆', value: 'vip_car_dept' },
  { label: '其他临时车', value: 'other_temporary_car' }
]

export const carAllObj = {
  southwest_open_car: '西南露天大型车辆',
  vip_car: '关院级贵宾车辆',
  vip_car_show: '主要演职人员车辆',
  fixed_truck: '固定货车',
  temporary_truck: '临时货车',
  southwest_open_bus: '东西南物流平台大客车',
  vip_car_dept: '部门级贵宾车辆',
  other_temporary_car: '其他临时车',
}
export const carAllByObj = {
  inside_user_car:'内部人员车辆',
  inside_temporary_car:'外包固定车辆',
  by_temporary_car:'临时车辆',
  by_keycast_car:'主要演职人员车辆'
}
// 车辆类型与颜色映射配置
export const carColorMap = {
  southwest_open_car: '#409EFF',      // 天蓝色 - 露天大型车辆，体现开阔感
  vip_car: '#E6A23C',                 // 橙色 - 关院级贵宾车辆，彰显尊贵
  vip_car_show: '#F56C6C',            // 红色 - 主要演职人员车辆，突出重要性
  fixed_truck: '#67C23A',             // 绿色 - 固定货车，代表稳定可靠
  temporary_truck: '#909399',         // 灰色 - 临时货车，体现临时性
  southwest_open_bus: '#36CFCE',      // 青色 - 物流平台大客车，与西南露天车辆区分
  vip_car_dept: '#C0C4CC',            // 浅灰色 - 部门级贵宾车辆，次于关院级
  other_temporary_car: '#F9C851',     // 浅黄色 - 其他临时车，柔和区分
};

// export const colorTimeMap = {

// }

export const taskStatusColor = {
  '待执行': '#FF9500', // 橙色（中性/提醒，区分未开始的任务）
  '执行中': '#1677FF', // 蓝色（进行中，行业通用的“处理中”色）
  '已完成': '#00B42A'  // 绿色（成功完成，代表任务结束）
};
export const planEnableStateColor = {
  '停用': '#FF9500', // 橙色（中性/提醒，区分未开始的任务）
  '启用': '#00B42A'  // 绿色（成功完成，代表任务结束）
};

export const eventStatusColor = {
  '待接单': '#F3544E',
  '处理中': '#409EFF',
  '已关闭': '#333333',
  '已完成': '#4BCED0',
  '补录': '#909399'
};

export const resultTypeText = {
  OPTION: '选项',
  PERCENTAGE: '百分比',
  TEXT: '文本' 
};