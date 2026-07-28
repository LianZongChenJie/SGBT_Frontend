import { FormSchema } from '/@/components/Form';
import IFormSchema from '../IFormSchema';

/**
 * 输入框-数字
 */
export default class NumberWidget extends IFormSchema {
  dbPointLength: number;

  constructor(key, data) {
    super(key, data);
    this.dbPointLength = data.dbPointLength;
  }

  getItem(): FormSchema {
    let item = super.getItem();
    let componentProps = this.getComponentProps();
    return Object.assign({}, item, {
      component: 'InputNumber',
      componentProps,
    });
  }

  getComponentProps() {
    const props = {
      style: {
        width: '100%',
      },
    };
    if (this.dbPointLength >= 0) {
      props['precision'] = this.dbPointLength;
    }
    return props;
  }
}
