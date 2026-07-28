/**
 * 默认字段设置
 */
const defaultFields = [
  {
    dbFieldName: 'id',
    dbFieldTxt: '主键',
    dbIsKey: 1,
    dbIsNull: 0,
    dbType: 'string',
    dbLength: 36,
    dbPointLength: 0,
    fieldShowType: 'text',
    fieldLength: 120,
    fieldMustInput: '1',
    isQuery: 0,
    isShowForm: 0,
    isShowList: 0,
    isReadOnly: 1,
    queryMode: 'single',
    queryConfigFlag: '0',
    orderNum: 1,
  },
  {
    dbFieldName: 'create_by',
    dbFieldTxt: '创建人',
    dbIsKey: 0,
    dbIsNull: 1,
    dbType: 'string',
    dbLength: 50,
    dbPointLength: 0,
    fieldShowType: 'text',
    fieldLength: 120,
    fieldMustInput: '0',
    isQuery: 0,
    isShowForm: 0,
    isShowList: 0,
    isReadOnly: 0,
    queryMode: 'single',
    queryConfigFlag: '0',
    sortFlag: '0',
    orderNum: 2,
  },
  {
    dbFieldName: 'create_time',
    dbFieldTxt: '创建时间',
    dbIsKey: 0,
    dbIsNull: 1,
    dbType: 'Datetime',
    dbLength: 50,
    dbPointLength: 0,
    fieldShowType: 'datetime',
    fieldLength: 120,
    fieldMustInput: '0',
    isQuery: 0,
    isShowForm: 0,
    isShowList: 0,
    isReadOnly: 0,
    queryMode: 'single',
    queryConfigFlag: '0',
    sortFlag: '0',
    orderNum: 3,
  },
  {
    dbFieldName: 'update_by',
    dbFieldTxt: '更新人',
    dbIsKey: 0,
    dbIsNull: 1,
    dbType: 'string',
    dbLength: 50,
    dbPointLength: 0,
    fieldShowType: 'text',
    fieldLength: 120,
    fieldMustInput: '0',
    isQuery: 0,
    isShowForm: 0,
    isShowList: 0,
    isReadOnly: 0,
    queryMode: 'single',
    queryConfigFlag: '0',
    sortFlag: '0',
    orderNum: 4,
  },
  {
    dbFieldName: 'update_time',
    dbFieldTxt: '更新时间',
    dbIsKey: 0,
    dbIsNull: 1,
    dbType: 'Datetime',
    dbLength: 50,
    dbPointLength: 0,
    fieldShowType: 'datetime',
    fieldLength: 120,
    fieldMustInput: '0',
    isQuery: 0,
    isShowForm: 0,
    isShowList: 0,
    isReadOnly: 0,
    queryMode: 'single',
    queryConfigFlag: '0',
    sortFlag: '0',
    orderNum: 5,
  },
  {
    dbFieldName: 'sys_org_code',
    dbFieldTxt: '所属部门',
    dbIsKey: 0,
    dbIsNull: 1,
    dbType: 'string',
    dbLength: 50,
    dbPointLength: 0,
    fieldShowType: 'text',
    fieldLength: 120,
    fieldMustInput: '0',
    isQuery: 0,
    isShowForm: 0,
    isShowList: 0,
    isReadOnly: 0,
    queryMode: 'single',
    orderNum: 6,
    queryConfigFlag: '0',
    sortFlag: '0',
  },
];

/**
 * 自定义按钮
 */
const customButtons = [
  {
    buttonCode: 'one',
    buttonName: 'js增强button',
    buttonStyle: 'button',
    optPosition: '2',
    optType: 'js',
    orderNum: 1,
    buttonStatus: '1',
  },
  {
    buttonCode: 'two',
    buttonName: 'action增强button',
    buttonStyle: 'button',
    optPosition: '2',
    optType: 'action',
    orderNum: 2,
    buttonStatus: '1',
  },
  {
    buttonCode: 'three',
    buttonName: 'js增强link',
    buttonStyle: 'link',
    optPosition: '2',
    optType: 'js',
    orderNum: 3,
    buttonStatus: '1',
  },
  {
    buttonCode: 'four',
    buttonName: '表单按钮',
    buttonStyle: 'form',
    optPosition: '2',
    optType: 'js',
    orderNum: 4,
    buttonStatus: '1',
  },
];

/**
 * 列表页js增强
 */
const customListEnhanceJavascript = `
one(){
  console.log('当前选中行的id', this.selectedRowKeys);
}
three(row){
  console.log('当前行数据', row)
}
beforeDelete(row){
  return new Promise(resolve=>{
    console.log('删除数据之前看看数据', row);
    resolve();
  });
}
`;

/**
 * form页js增强
 * 【TV360X-363】js增强所有表都可生成测试代码
 */
const customFormEnhanceJavascript = `
loaded(){
  let text = '';
  if(this.isUpdate.value === true){
    text = '编辑';
  } else {
    text = '新增';
  }
  console.log(text);
}
onlChange(){
  return {
    name() {
      console.log('name字段值改变了:', name);
    }
  }
}
`;

/**
 * java增强
 */
const customJavaEnhance = [
  {
    buttonCode: 'add',
    event: 'start',
    cgJavaType: 'spring',
    cgJavaValue: 'cgformEnhanceJavaDemo',
    activeStatus: '1',
  },
  {
    buttonCode: 'edit',
    event: 'end',
    cgJavaType: 'spring',
    cgJavaValue: 'cgformEnhanceJavaDemo',
    activeStatus: '1',
  },
  {
    buttonCode: 'import',
    event: 'start',
    cgJavaType: 'spring',
    cgJavaValue: 'cgformEnhanceImportDemo',
    activeStatus: '1',
  },
  {
    buttonCode: 'export',
    event: 'start',
    cgJavaType: 'spring',
    cgJavaValue: 'cgformEnhanceExportDemo',
    activeStatus: '1',
  },
  {
    buttonCode: 'query',
    event: 'start',
    cgJavaType: 'spring',
    cgJavaValue: 'cgformEnhanceQueryDemo',
    activeStatus: '1',
  },
];

export { defaultFields, customButtons, customListEnhanceJavascript, customJavaEnhance, customFormEnhanceJavascript };
