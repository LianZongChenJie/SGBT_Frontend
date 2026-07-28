import { Switch, Slider, Rate } from 'ant-design-vue';
import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
//设置特殊列类型（仅用于工单查询）
export function setCustomRender(item, column, options) {
  // TODO 开关特殊处理
  if (item.type === 'switch') {
    column.customRender = ({ text }) => {
      let activeValue = options.activeValue || true;
      return <Switch size="small" checked={text === activeValue} disabled />;
    };
  }
  // TODO 滑块特殊处理
  if (item.type === 'slider') {
    let { min, max } = options;
    column.customRender = ({ text }) => {
      return <Slider value={text} min={min} max={max} disabled style="margin:0;" />;
    };
  }
  // TODO 评分组件
  if (item.type === 'rate') {
    let { max, allowHalf } = options;
    column.customRender = ({ text }) => {
      let val = parseInt(text);
      return <Rate value={val} count={max} allowHalf={allowHalf} disabled style="margin:0;font-size: 16px;" />;
    };
  }
  // TODO 超长截取显示
  if (!column.slots && !column.customRender) {
    column.customRender = ({ text }) => {
      let txt = text;
      // 如果是数组，就显示为逗号分割
      if (Array.isArray(text)) {
        txt = text.join(',');
      }
      return <JEllipsis length={50} value={txt} />;
    };
  }
  return column;
}
