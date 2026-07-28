import { FormSchema } from '/@/components/Form';
import IFormSchema from '../IFormSchema';

/**
 * 下拉多选框
 */
export default class SelectMultiWidget extends IFormSchema {
  dictTable: string;
  dictText: string;
  dictCode: string;

  constructor(key, data) {
    super(key, data);
    // 可以从这个里面取 但是换成临时加载的
    //this.options = this.getOptions(data['enum'])
    this.dictTable = data['dictTable'];
    this.dictText = data['dictText'];
    this.dictCode = data['dictCode'];
  }

  getItem(): FormSchema {
    let item = super.getItem();
    let componentProps = this.getComponentProps();
    return Object.assign({}, item, {
      component: 'JSelectMultiple',
      componentProps: componentProps,
    });
  }

  getComponentProps() {
    if (!this.dictTable && !this.dictCode) {
      // 字典表 和 字典 都没填数据
      return {};
    } else {
      let props = {};
      if (!this.dictTable) {
        props['dictCode'] = this.dictCode;
        // update-begin--author:liaozhiyang---date:20230110---for：【QQYUN-7799】字典组件（原生组件除外）加上颜色配置
        props['useDicColor'] = true;
        // update-end--author:liaozhiyang---date:20230110---for：【QQYUN-7799】字典组件（原生组件除外）加上颜色配置
      } else {
        let temp = `${this.dictTable},${this.dictText},${this.dictCode}`;
        props['dictCode'] = encodeURI(temp);
      }
      props['triggerChange'] = true;
      props['popContainer'] = this.getPopContainer();
      return props;
    }
  }
}
