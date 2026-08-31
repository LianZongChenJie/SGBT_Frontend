import { FormSchema } from '/@/components/Form';
import IFormSchema from '../IFormSchema';

/**
 * 下拉搜索
 */
export default class SelectSearchWidget extends IFormSchema {
  dict: string;
  type: number;
  constructor(key, data) {
    super(key, data);
    if (data.dictTable && data.dictText && data.dictCode) {
      // 字典表
      this.dict = encodeURI(`${data.dictTable},${data.dictText},${data.dictCode}`);
      this.type = 1;
    } else {
      // 数据字典
      this.dict = encodeURI(`${data.dictCode}`);
      this.type = 0;
    }
  }

  getItem(): FormSchema {
    let item = super.getItem();
    let popContainer = this.getPopContainer();
    return Object.assign({}, item, {
      component: 'JSearchSelect',
      componentProps: {
        dict: this.dict,
        pageSize: 10,
        // update-begin--author:liaozhiyang---date:20240628---for：【issues/6336】online下拉搜索框设置数据字典编辑弹窗报错
        async: this.type ? true : false,
        // update-end--author:liaozhiyang---date:20240628---for：【issues/6336】online下拉搜索框设置数据字典编辑弹窗报错
        popContainer: popContainer,
      },
    });
  }
}
