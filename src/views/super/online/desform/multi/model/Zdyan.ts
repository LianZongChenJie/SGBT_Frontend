import { ButtonInfo } from '../ts/type.definition';
/**
 * 自定义按钮 数据格式
 */
export default class Zdyan {
  // 按钮
  buttonList?: ButtonInfo[];
  // 传入viewId
  viewId?: string;
  
  // 标题字段 仅用于参数传递
  designFormTitleField?: string;

  constructor(data) {
    this.buttonList = data.buttonList || [];
    this.viewId = data.id || '';
    this.designFormTitleField = ''
  }
  
  setFormTitleField(str){
    this.designFormTitleField = str;
  }
}
