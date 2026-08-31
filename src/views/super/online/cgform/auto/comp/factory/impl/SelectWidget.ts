import { FormSchema } from '/@/components/Form';
import IFormSchema from '../IFormSchema';

/**
 * 下拉框
 * //待处理： 表字典取数据可以考虑传参前端再请求
 */
export default class SelectWidget extends IFormSchema {
  schema: Recordable;
  /*title-value*/
  options: any[];
  dictTable: string;
  dictText: string;
  dictCode: string;
  multi: boolean;

  constructor(key, data) {
    super(key, data);
    this.schema = data
    this.options = this.getOptions(data['enum'], data.type);
    this.dictTable = data['dictTable'];
    this.dictText = data['dictText'];
    this.dictCode = data['dictCode'];
    this.multi = data['multi']||false;
  }

  getItem(): FormSchema {
    let item = super.getItem();
    let component = this.getFormComponent()
    let componentProps = this.getComponentProps()
    return Object.assign({}, item, {
      component,
      componentProps
    });
  }

  getFormComponent(){
    if(this.options.length>0){
      return  'Select'
    }else{
      return 'JDictSelectTag'
    }
  }

  getComponentProps() {
    let mode = this.multi===true?'multiple':'combobox'
    let props = {
      allowClear: true,
      mode,
      style: {
        width: '100%',
      },
      getPopupContainer: (_node) => {
        return this.getModalAsContainer();
      },
      // 下拉框展开/关闭的回调
      onDropdownVisibleChange: (visible: boolean)=> {
        if (visible && typeof this.schema.updateOptions === 'function') {
          this.schema.updateOptions()
        }
      },
    }
    if(this.options.length>0){
      props['options'] = this.options;
    }else{
      if (!this.dictTable) {
        props['dictCode'] = this.dictCode;
        // update-begin--author:liaozhiyang---date:20230110---for：【QQYUN-7799】字典组件（原生组件除外）加上颜色配置
        props['useDicColor'] = true;
        // update-end--author:liaozhiyang---date:20230110---for：【QQYUN-7799】字典组件（原生组件除外）加上颜色配置
      } else {
        let temp = `${this.dictTable},${this.dictText},${this.dictCode}`;
        props['dictCode'] = encodeURI(temp);
      }
    }
    return props
  }

  getOptions(array, type) {
    if (!array || array.length == 0) {
      return [];
    }
    let isNum = 'number' == type;
    let arr: any[] = [];
    for (let item of array) {
      // update-begin--author:liaozhiyang---date:20240517---for：【QQYUN-9359】加强判断，防止数据有null报错
      if (item == null) break;
      // update-end--author:liaozhiyang---date:20240517---for：【QQYUN-9359】加强判断，防止数据有null报错
      let value = item.value;
      if(isNum){
        value = parseInt(value)
      }
      arr.push({
        ...item,
        value,
        label: item.title,
      });
    }
    return arr;
  }
}
