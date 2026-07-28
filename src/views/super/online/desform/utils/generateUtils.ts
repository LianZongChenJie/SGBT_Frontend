/*
 * 通过 online 生成表单接口，并支持通过online配置动态生成不同的组件
 */

/** 忽略生成的字段 */
const IGNORES = ['id', 'create_by', 'create_time', 'update_by', 'update_time', 'sys_org_code'];

/** 字段类型对应数组 */
const FIELD_TYPES = [
  //  desform: null = 暂未支持该组件
  { cgform: 'text', desform: 'input', remarks: '文本框' },
  { cgform: 'password', desform: 'input-password', remarks: '密码框' },
  { cgform: 'radio', desform: 'radio', remarks: '单选框' },
  { cgform: 'checkbox', desform: 'checkbox', remarks: '多选' },
  { cgform: 'date', desform: 'date', remarks: '日期(yyyy-MM-dd)' },
  { cgform: 'datetime', desform: 'datetime', remarks: '日期（yyyy-MM-dd HH:mm:ss）' },
  { cgform: 'time', desform: 'time', remarks: '时间(HH:mm:ss)' },
  { cgform: 'textarea', desform: 'textarea', remarks: '多行文本' },
  { cgform: 'list', desform: 'select', remarks: '下拉框' },
  { cgform: 'list_multi', desform: 'select_multiple', remarks: '下拉多选框' },
  { cgform: 'popup', desform: 'table-dict', remarks: 'popup弹出框' },
  { cgform: 'popup_dict', desform: 'table-dict_select', remarks: 'popup字典' },
  { cgform: 'sel_search', desform: 'table-dict_select', remarks: '下拉搜索' },
  { cgform: 'umeditor', desform: 'editor', remarks: '富文本编辑器' },
  { cgform: 'sel_depart', desform: 'select-depart', remarks: '部门选择器' },
  { cgform: 'sel_user', desform: 'select-user', remarks: '用户选择器' },
  { cgform: 'image', desform: 'imgupload', remarks: '图片' },
  { cgform: 'file', desform: 'file-upload', remarks: '文件' },
  { cgform: 'pca', desform: 'area-linkage', remarks: '省市县联动' },
  { cgform: 'switch', desform: 'switch', remarks: '开关' },
  { cgform: 'markdown', desform: 'markdown', remarks: 'Markdown' },
  { cgform: 'cat_tree', desform: 'select-tree', remarks: '分类数字典' },
  { cgform: 'sel_tree', desform: 'select-tree', remarks: '自定义树组件' },

  // 以下为Online目前没有的字段，仅用于 AIGC
  {cgform: 'map', desform: 'map', remarks: '地图'},
  {cgform: 'location', desform: 'location', remarks: '定位'},
  {cgform: 'color', desform: 'color', remarks: '颜色选择器'},
  {cgform: 'rate', desform: 'rate', remarks: '评分'},
  {cgform: 'slider', desform: 'slider', remarks: '滑块'},
];

// key = desform, value = cgform
const FIELD_TYPES_DESFORM_MAP = {}
FIELD_TYPES.forEach(item => FIELD_TYPES_DESFORM_MAP[item.desform] = item.cgform);

/**
 * 子表支持的类型
 * @type {string[]}
 */
export const subTableSupportTypes = ['input', 'number', 'select', 'time', 'date', 'radio', 'checkbox', 'textarea', 'select-user', 'select-depart'];
// 2020年4月27日更新新增支持组件
subTableSupportTypes.push('area-linkage', 'imgupload', 'file-upload', 'switch', 'slider', 'rate', 'color');
// 2022年更新新增支持组件
subTableSupportTypes.push('table-dict', 'select-tree', 'integer', 'money', 'phone', 'email', 'formula');
// 2023年更新新增支持组件
subTableSupportTypes.push('org-role')

// 额外类型
subTableSupportTypes.push('datetime')

/**
 * 检查是否是子表支持的类型
 * @returns {boolean}
 */
export function subTableCheckType(checkType) {
  // 检查拖入的组件是否已被支持
  for (let type of subTableSupportTypes) {
    if (`${checkType}`.toLowerCase() === type.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// 自定义校验规则 与 Online对接
const customRegexpPreset = [
  {online: 's', title: '字母', regexp: '^[A-Za-z]*$'},
  {
    online: 'p',
    title: '邮政编码',
    regexp: '^(0[1-7]|1[0-356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[0-5]|8[013-6])\\d{4}$'
  },
  {
    online: 'url',
    title: '链接',
    regexp: '^(((ht|f)tps?):\\/\\/)?([^!@#$%^&*?.\\s-]([^!@#$%^&*?.\\s]{0,63}[^!@#$%^&*?.\\s])?\\.)+[a-z]{2,6}\\/?'
  },
  {online: 'n6-16', title: '6-16位数字', regexp: '^[0-9]{6,16}$'},
  {online: 's6-18', title: '6-18位字母', regexp: '^[A-Za-z]{6,18}$'},
  {online: '*6-16', title: '6-16位任意字符', regexp: '^.{6,16}$'},
]

/** 根据 online cgform 生成表单
 *
 * @param json 表单生成器的 json 对象，传 null 则自动生成一个
 * @param onlineForms 要生成的 online 表单 head表 数组，下标 0 一定是主表，大于 0 的为附表，若没有大于 0 的则代表没有附表
 * @param onlineFields 要生成的 online 表单 field表 数组，下标与 onlineForms 一一对应
 * @param templetJson 模板json，不使用模板就传 null
 */
export function generateByCgform(json, onlineForms, onlineFields, templetJson) {
  let jsonObject = json
    ? json
    : {
        list: [],
        config: { labelWidth: 100, labelPosition: 'top', size: 'small', generateByOnline: true },
      };

  // 指定向那些项里面填充表单
  let fullObject = [jsonObject.list];

  // 判断是否使用了模板
  if (templetJson != null) {
    let templet = JSON.parse(templetJson);
    if (templet && templet.list) {
      jsonObject = templet;
      fullObject = [];
      // 遍历判断模板中是否有栅格布局
      templet.list.forEach((item) => {
        if (item.type === 'grid') {
          // 当前是栅格布局，并将每个column放入填充对象
          item.columns.forEach((column) => fullObject.push(column.list));
        }
      });
      // 如果没有栅格布局，则填充到父list中
      if (fullObject.length === 0) {
        fullObject = [jsonObject.list];
      }
    } else {
      console.warn('generateByCgform: 模板数据异常，已忽略……');
    }
  }

  /* -- 生成主表 --  */

  let mainField = onlineFields[0];
  // 当前已填充的下标
  let fullIndex = 0;
  mainField.forEach((item) => {
    if (item.isShowForm === 1) {
      let component = packageAuto(item);
      if (!!component) {
        // 这里由于存的是内存地址，所以直接 push 就能改变 jsonObject
        fullObject[fullIndex].push(component);
        if (++fullIndex >= fullObject.length) {
          fullIndex = 0;
        }
      }
    }
  });

  /* -- 生成附表 -- */

  //jsonObject
  if (onlineForms.length > 1) {
    for (let i = 1; i < onlineForms.length; i++) {
      let subForm = onlineForms[i];
      let subField = onlineFields[i];

      if (subForm) {
        let subTableAfter: any = [];
        if (subForm.relationType === 0) {
          // 一对多
          subTableAfter = packageOne2manySubTable(subForm, subField);
        } else if (subForm.relationType === 1) {
          // 一对一
          subTableAfter = packageOne2oneSubTable(subForm, subField);
        } else {
          console.warn('generateByCgform: 暂不支持的子表类型: ', subForm.relationType, '; ', subForm, '; ', subField);
          break;
        }
        jsonObject.list.push(subTableAfter);
      } else {
        console.warn('generateByCgform: 已忽略不存在的子表: ', subForm, '; ', subField);
      }
    }
  }

  return jsonObject;
}

/** 生成一对多子表 */
function packageOne2manySubTable(subForm, subField): Recordable {
  let subTableAfter = packageSubTable(subForm.tableTxt, subForm.tableName);
  let nextIndex = 0;
  subField.forEach((item) => {
    let { dbFieldName, isShowForm } = item;
    if (isShowForm === 1 && !isIgnoreField(dbFieldName)) {
      // noinspection JSMismatchedCollectionQueryUpdate
      let list: Recordable[] = subTableAfter.columns[nextIndex].list;
      let component = packageAuto(item, true);
      if (component) {
        component['isSubItem'] = true;
        list.push(component);
      }
      if (++nextIndex >= subTableAfter.columns.length) {
        nextIndex = 0;
      }
    }
  });
  return subTableAfter;
}

/** 生成一对一子表 */
function packageOne2oneSubTable(subForm, subField): Recordable {
  let subTableTxt = subForm.tableTxt;
  let subTableName = subForm.tableName;
  let list: Recordable[] = [];
  subField.forEach((item) => {
    let { dbFieldName, isShowForm } = item;
    if (isShowForm === 1 && !isIgnoreField(dbFieldName)) {
      let component = packageAuto(item);
      if (component) {
        component.model = `${subTableName}#${item.dbFieldName}`;
        component.modelType = 'sub_one2one';
        component.options.subTableName = subTableName;
        list.push(component);
      }
    }
  });
  return packageCard(subTableTxt, list);
}

type AiSchemaLiteFieldType = [
  // 字段的英文code
  string,
  // 中文名称
  string,
  // 字段类型
  string,
  // 默认值
  string,
  // 是否必填
  (1 | 0),
  // 扩展选项
  (string[] | Recordable)?,
]

export type AiSchemaType = [
  // 表单的英文code
  string,
  // 中文名称
  string,
  // 布局列数（最低1 最高4）
  number,
  // 字段数组
  AiSchemaLiteFieldType[],
]

// 不允许使用AutoGrid的字段
const NoEntryAutoGrid = ['map', 'markdown', 'editor']

/**
 * 通过 AI 生成表单
 */
export function generateByAIGC(desformCode: string, aiSchemaLite: AiSchemaType): {
  desformCode: string,
  desformName: string,
  desformDesignJson: string
} | null {
  if (!Array.isArray(aiSchemaLite)) {
    console.warn('[desformAIGC] 传入的 aiSchemaLite 不是数组，已忽略……');
    return null;
  }

  const jsonObject = {
    list: [] as any[],
    config: {labelWidth: 100, labelPosition: 'top', size: 'small', generateByAi: true},
  };

  // const desformCode = aiSchemaLite[0]
  const desformName = aiSchemaLite[1] || desformCode

  // 布局列数
  let columnSize = aiSchemaLite[2] || 1
  if (columnSize < 1) {
    columnSize = 1
  }
  if (columnSize > 4) {
    columnSize = 4
  }
  // ------ 遍历Ai字段，生成表单 ------

  // ai字段
  const aiFields = aiSchemaLite[3]

  // 自动处理布局列数
  let currentAutoGrid: ReturnType<typeof packageAutoGrid>;
  const newAutoGrid = () => {
    currentAutoGrid = packageAutoGrid()
    jsonObject.list.push(currentAutoGrid)
  }
  newAutoGrid()

  for (let aiField of aiFields) {
    if (!Array.isArray(aiField)) {
      console.warn('[desformAIGC] aiField 不是数组，已忽略……', aiField);
      continue;
    }
    if (aiField.length < 5) {
      console.warn('[desformAIGC] aiField 数组长度不足5，已忽略……', aiField);
      continue;
    }
    const [model, name, type, defaultVal, required, other] = aiField

    // 模拟Online字段
    const mockOnlineField = {
      dbFieldName: model,
      dbFieldTxt: name,
      fieldDefaultValue: defaultVal,
      fieldMustInput: required ? 1 : 0,
      fieldShowType: '',
      fieldValidType: '',
      dbType: type === 'money' ? 'BigDecimal' : 'varchar',
      fieldExtendJson: {} as Recordable,
    }
    let fieldShowType: string
    if (['password', 'file', 'image', 'pca', 'switch'].includes(type)) {
      fieldShowType = type
    } else if (['number', 'money'].includes(type)) {
      fieldShowType = FIELD_TYPES_DESFORM_MAP['input']
      mockOnlineField.fieldValidType = type === 'number' ? 'n' : type === 'money' ? 'money' : ''
    } else if (['phone', 'email'].includes(type)) {
      fieldShowType = FIELD_TYPES_DESFORM_MAP['input']
      mockOnlineField.fieldValidType = type === 'phone' ? 'm' : type === 'email' ? 'e' : ''
    } else if (['radio', 'checkbox', 'select'].includes(type)) {
      fieldShowType = FIELD_TYPES_DESFORM_MAP[type]
      if (Array.isArray(other) && other.length > 0) {
        mockOnlineField.fieldExtendJson.options = other.map((item) => ({value: item}))
      } else {
        mockOnlineField.fieldExtendJson.options = [{value: '选项1'}, {value: '选项2'}, {value: '选项3'}]
      }
    } else if (type === 'date-time') {
      fieldShowType = FIELD_TYPES_DESFORM_MAP['datetime']
    } else if (type === 'date-year') {
      fieldShowType = FIELD_TYPES_DESFORM_MAP['date']
      mockOnlineField.fieldExtendJson.picker = 'year'
    } else if (type === 'date-month') {
      fieldShowType = FIELD_TYPES_DESFORM_MAP['date']
      mockOnlineField.fieldExtendJson.picker = 'month'
    } else if (type === 'depart') {
      fieldShowType = FIELD_TYPES_DESFORM_MAP['select-depart']
    } else if (type === 'user') {
      fieldShowType = FIELD_TYPES_DESFORM_MAP['select-user']
    } else {
      fieldShowType = FIELD_TYPES_DESFORM_MAP[type]
    }
    if (!fieldShowType) {
      console.warn('[desformAIGC] 未找到对应的 fieldShowType，已忽略……', type);
      continue;
    }
    mockOnlineField.fieldShowType = fieldShowType
    mockOnlineField.fieldExtendJson = JSON.stringify(mockOnlineField.fieldExtendJson) as any;
    const component = packageAuto(mockOnlineField)

    if (component) {
      if (NoEntryAutoGrid.includes(component.type)) {
        jsonObject.list.push(component)
        newAutoGrid()
      } else {
        currentAutoGrid!.list.push(component)
        // 如果当前AutoGrid列数已满，则新建一个AutoGrid
        if (currentAutoGrid!.list.length >= columnSize) {
          newAutoGrid()
        }
      }
    }
  }
  return {
    desformCode,
    desformName: desformName,
    desformDesignJson: JSON.stringify(jsonObject)
  }
}

/** 判断当前字段是否是被忽略的字段 */
export function isIgnoreField(fieldName) {
  for (let ignore of IGNORES) {
    if (fieldName.toLowerCase() === ignore.toLowerCase()) {
      return true;
    }
  }
  return false;
}

/** 自动判断生成的表单类型 */
function packageAuto(onlineField, subTable = false): Nullable<Recordable> {
  let { dbFieldName, fieldShowType } = onlineField;

  // 判断字段是否被忽略
  if (isIgnoreField(dbFieldName)) {
    return null;
  }

  console.debug(`[packageAuto] - ${dbFieldName} :`, {onlineField, subTable})

  // cgform 字段与 desform 字段一一对应
  let desformType = '';
  for (let field of FIELD_TYPES) {
    if (field.cgform === fieldShowType && field.desform) {
      desformType = field.desform;
      break;
    }
  }

  // 判断是否是子表，并且判断类型是否支持
  if (subTable && !subTableCheckType(desformType)) {
    return packageInput(onlineField);
  }

  let onlineType = onlineField.dbType;

  // 根据不同的字段封装不同的组件
  if (desformType === 'date') {
    return packageDate(onlineField);
  } else if (desformType === 'datetime') {
    return packageDateTime(onlineField);
  } else if (desformType === 'time') {
    return packageTime(onlineField);
  } else if (desformType === 'input-password') {
    return packageInputPassword(onlineField);
  } else if (desformType === 'textarea') {
    return packageTextarea(onlineField);
  } else if (desformType === 'select') {
    return packageSelect(onlineField);
  } else if (desformType === 'select_multiple') {
    return packageSelect(onlineField, { multiple: true });
  } else if (desformType === 'select-user') {
    return packageSelectUser(onlineField);
  } else if (desformType === 'select-depart') {
    return packageSelectDepart(onlineField);
  } else if (desformType === 'table-dict') {
    return packageTableDict(onlineField);
  } else if (desformType === 'table-dict_select') {
    return packageTableDictSelect(onlineField);
  } else if (desformType === 'imgupload') {
    return packagePicture(onlineField);
  } else if (desformType === 'file-upload') {
    return packageFileUpload(onlineField);
  } else if (desformType === 'editor') {
    return packageEditor(onlineField);
  } else if (desformType === 'markdown') {
    return packageMarkdown(onlineField);
  } else if (desformType === 'radio') {
    return packageRadio(onlineField);
  } else if (desformType === 'checkbox') {
    return packageCheckbox(onlineField);
  } else if (desformType === 'area-linkage') {
    return packageAreaLinkage(onlineField);
  } else if (desformType === 'switch') {
    return packageSwitch(onlineField);
  } else if (desformType === 'select-tree') {
    return packageSelectTree(onlineField);
  } else if (desformType === 'map') {
    return packageMap(onlineField);
  } else if (desformType === 'location') {
    return packageLocation(onlineField);
  } else if (desformType === 'color') {
    return packageColor(onlineField);
  } else if (desformType === 'rate') {
    return packageRate(onlineField);
  } else if (desformType === 'slider') {
    return packageSlider(onlineField);
  } else if (onlineType === 'BigDecimal' || onlineType === 'double') {
    if (onlineField.fieldValidType === 'money') {
      return packageMoney(onlineField);
    } else {
      return packageBigDecimal(onlineField);
    }
  } else if (onlineType === 'int') {
    return packageInteger(onlineField);
  } else {
    let { fieldValidType } = onlineField;
    if (fieldValidType === 'e') {
      // 邮箱
      return packageEmail(onlineField);
    } else if (fieldValidType === 'm') {
      // 手机号
      return packagePhone(onlineField);
    } else if (fieldValidType === 'n') {
      // 数字
      return packageNumber(onlineField);
    } else if (fieldValidType === 'z') {
      // 整数
      return packageInteger(onlineField);
    } else if (fieldValidType === 'money') {
      // 金额
      return packageMoney(onlineField);
    }
    return packageInput(onlineField);
  }
}

/** 获取组件的基础参数 */
function getBaseComponent(onlineField: Recordable, params: Recordable) {
  let {
    // 控件绑定Key（数据库）
    dbFieldName: model,
    // 控件显示名称（数据库）
    dbFieldTxt: name,
    // 控件默认值（数据库）
    dbDefaultVal,
    // 是否允许为空（数据库 1 = 允许；0 = 不允许）
    dbIsNull,
    // 控件默认值（页面）
    fieldDefaultValue,
    // 校验规则（页面）
    fieldValidType,
    // 校验必填（页面 1 = 必填；0 = 非必填）
    fieldMustInput,
  } = onlineField;
  let required = dbIsNull == 0 || fieldMustInput == 1 || fieldValidType == '*';
  // 控件key
  let key = model + '_' + Math.ceil(Math.random() * 99999);
  // 控件默认值
  let defaultValue = fieldDefaultValue || dbDefaultVal || void 0;

  // 解析后的扩展配置JSON
  let extendJson = getBaseExtendJson(onlineField);

  return [
    {
      type: params.type,
      name: name,
      className: params.className,
      icon: params.icon,
      options: {
        defaultValue: defaultValue,
        required: required,
        hidden: false,
      },
      key: key,
      model: model,
      // 数据绑定类型；main=主表；sub_one2one = 一对一子表
      modelType: 'main',
      rules: [{required: required, message: `${name}必须填写`}],
    } as Recordable,
    {key, model, name, defaultValue, required, extendJson},
  ];
}

function getBaseExtendJson(onlineField: Recordable) {
  let {fieldExtendJson} = onlineField;
  // 解析后的扩展配置JSON
  let extendJson: Nullable<Recordable> = null;
  // 判断是否有扩展配置JSON
  if (fieldExtendJson) {
    try {
      extendJson = JSON.parse(fieldExtendJson);
    } catch (e) {
      console.warn('[通过Online生成]: 扩展配置JSON解析异常，已忽略……', e);
    }
  }
  return extendJson;
}

/** 封装 input 组件 */
function packageInput(onlineField): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'input',
    className: 'form-input',
    icon: 'icon-input',
    hideTitle: false,
  });
  const {fieldValidType} = onlineField
  const options: Recordable = {}
  // 根据 online 的 fieldValidType 配置校验规则
  if (fieldValidType) {
    // 非空（必填）
    if (fieldValidType === '*') {
      // ignored：已在 getBaseComponent 中处理
    } else
      // 唯一校验
    if (fieldValidType === 'only') {
      options.unique = true
    } else {
      const findReg = customRegexpPreset.find(item => item.online === fieldValidType)
      if (findReg) {
        options.pattern = findReg.regexp
        options.patternMessage = `请输入${findReg.title}`
      } else {
        options.pattern = fieldValidType
        options.patternMessage = '${title}格式不正确'
      }
    }
  }

  Object.assign(base.options, {
    width: '100%',
    dataType: null,
    pattern: '',
    patternMessage: '',
    readonly: false,
    disabled: false,
    placeholder: '请输入' + params.name,
    clearable: false,
    fillRuleCode: "",
    showPassword: false,
    unique: false,
  }, options);
  // base.rules.push({type: 'string', message: params.name + '格式不正确'})

  return base;
}

/** 封装 textarea 组件 */
function packageTextarea(onlineField): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'textarea',
    className: 'form-textarea',
    icon: 'icon-textarea',
    hideTitle: false,
  });

  Object.assign(base.options, {
    width: '100%',
    disabled: false,
    pattern: '',
    readonly: false,
    placeholder: '请输入' + params.name,
  });

  return base;
}

/** 封装 密码输入框 组件 */
function packageInputPassword(onlineField: Recordable): Recordable {
  const comp = packageInput(onlineField)

  comp.options.showPassword = true

  return comp;
}

/** 封装 Number 组件 */
function packageNumber(onlineField): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'number',
    className: 'form-number',
    icon: 'icon-number',
    hideTitle: false,
  });
  Object.assign(base.options, {
    width: '100%',
    dataType: null,
    readonly: false,
    disabled: false,
    placeholder: '请输入' + params.name,
    controls: false,
    min: 0,
    minUnlimited: true,
    max: 100,
    maxUnlimited: true,
    step: 1,
    precision: undefined,
    controlsPosition: 'right',
    align: 'left',
    defaultValue: base.options.defaultValue ?? undefined,
  });
  return base;
}

/** 封装 BigDecimal 组件 */
function packageBigDecimal(onlineField): Recordable {
  let base = packageNumber(onlineField);
  Object.assign(base.options, {
    precision: onlineField.dbPointLength,
  });
  return base;
}

/** 封装 integer 组件 */
function packageInteger(onlineField): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'integer',
    className: 'form-integer',
    icon: 'icon-integer',
    hideTitle: false,
  });
  Object.assign(base.options, {
    width: '100%',
    placeholder: '请输入' + params.name,
    min: 0,
    minUnlimited: true,
    max: 100,
    maxUnlimited: true,
    step: 1,
    precision: 0,
    controls: false,
    disabled: false,
    controlsPosition: 'right',
    align: 'left',
    defaultValue: base.options.defaultValue ?? undefined,
  })
  return base;
}

/** 封装 money 组件 */
function packageMoney(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'money',
    className: 'form-money',
    icon: 'icon-money',
    hideTitle: false,
  });

  Object.assign(base.options, {
    width: '',
    placeholder: '请输入' + params.name,
    unitText: '元',
    unitPosition: 'suffix',
    precision: onlineField.dbPointLength,
    disabled: false,
  });

  return base;
}

/** 封装 phone 组件 */
function packagePhone(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'phone',
    className: 'form-input-phone',
    icon: 'icon-mobile-phone',
    hideTitle: false,
  });

  Object.assign(base.options, {
    width: '300px',
    placeholder: '请输入' + params.name,
    disabled: false,
    readonly: false,
    showVerifyCode: false,
  });
  base.defaultRules = [
    { type: 'phone', message: '请输入正确的手机号码' },
    { type: 'validator', message: '', trigger: 'blur' },
  ];

  return base;
}

/** 封装 email 组件 */
function packageEmail(onlineField) {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'email',
    className: 'form-input-email',
    icon: 'icon-email',
    hideTitle: false,
  });

  Object.assign(base.options, {
    width: '300px',
    placeholder: '请输入' + params.name,
    disabled: false,
    readonly: false,
    showVerifyCode: false,
  });
  base.defaultRules = [
    { type: 'email', message: '请输入正确的邮箱地址' },
    { type: 'validator', message: '', trigger: 'blur' },
  ];

  return base;
}

/** 封装 date 组件 */
function packageDate(onlineField: Recordable): Recordable {
  let [base, {name, extendJson}] = getBaseComponent(onlineField, {
    type: 'date',
    className: 'form-date',
    icon: 'icon-date',
    hideTitle: false,
  });
  const {} = onlineField
  const options: Recordable = {}

  if (extendJson?.picker) {
    if (extendJson.picker === 'year') {
      // 年
      options.type = 'year'
      options.format = 'yyyy'
    } else if (extendJson.picker === 'month') {
      // 年月
      options.type = "month"
      options.format = "yyyy-MM"
    } else {
      // to-do: week（周）、quarter（季度）暂不支持
    }
  }

  Object.assign(base.options, {
    designType: 'date',
    type: 'date',
    timestamp: true,
    width: '',
    clearable: true,
    defaultValueType: 1,
    readonly: false,
    disabled: false,
    editable: true,
    startPlaceholder: '',
    endPlaceholder: '',
    format: 'yyyy-MM-dd',
    placeholder: '请选择' + name,
  }, options);

  return base;
}

/** 封装 datetime 组件 */
function packageDateTime(onlineField): Recordable {
  let date = packageDate(onlineField);
  date.options.designType = 'datetime';
  date.options.type = 'datetime';
  date.options.format = 'yyyy-MM-dd HH:mm:ss';
  return date;
}

/** 封装 time 组件 */
function packageTime(onlineField): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'time',
    className: 'form-time',
    icon: 'icon-time',
    hideTitle: false,
  });

  Object.assign(base.options, {
    width: "",
    readonly: false,
    disabled: false,
    editable: true,
    clearable: true,
    format: "HH:mm:ss",
    placeholder: '请选择' + params.name,
    startPlaceholder: '请选择开始' + params.name,
    endPlaceholder: '请选择结束' + params.name,
    isRange: false,
    arrowControl: false,
  });

  return base;
}

/** 封装 用户 组件 */
function packageSelectUser(onlineField): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'select-user',
    className: 'form-select-user',
    icon: 'icon-user-circle',
    hideTitle: false,
  });

  Object.assign(base.options, {
    keyMaps: [],
    width: '100%',
    disabled: false,
    placeholder: '请选择' + params.name,
  });

  return base;
}

/** 封装 部门 组件 */
function packageSelectDepart(onlineField): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'select-depart',
    className: 'form-select-depart',
    icon: 'icon-depart',
    hideTitle: false,
  });

  Object.assign(base.options, {
    keyMaps: [],
    width: '100%',
    disabled: false,
    placeholder: '请选择' + params.name,
  });

  return base;
}

/** 封装 表字典 下拉样式 组件 */
function packageTableDictSelect(onlineField, options = {}): Recordable {
  const comp = packageTableDict(onlineField)
  const isDict = onlineField.fieldShowType === 'popup_dict'

  Object.assign(comp.options, {
    style: 'select',
    filterable: true,
    queryScope: isDict ? 'cgreport' : 'database',
  }, options);

  return comp;
}

/** 封装 表字典 组件 */
function packageTableDict(onlineField, options = {}): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'table-dict',
    className: 'form-dict',
    icon: 'icon-dict',
    hideTitle: false,
  });

  Object.assign(base.options, {
    // -
    width: '100%',
    showIcon: true,
    iconName: 'icon-popup',
    disabled: false,
    style: 'popup',
    // -
    multiple: false,
    dictTable: onlineField['dictTable'],
    dictCode: onlineField['dictField'],
    dictText: onlineField['dictText'],
    placeholder: '请选择' + params.name,
    filterable: true,
    queryScope: "cgreport",
  }, options);

  return base;
}

/** 封装 图片上传 组件 */
function packagePicture(onlineField): Recordable {
  let [base, {extendJson}] = getBaseComponent(onlineField, {
    type: 'imgupload',
    className: 'form-tupian',
    icon: 'icon-tupian',
    hideTitle: false,
  });

  // 自定义上传数量
  let length: number | null = null
  if (extendJson?.uploadnum != null) {
    length = Number(extendJson.uploadnum)
  }

  Object.assign(base.options, {
    // -
    width: '',
    tokenFunc: 'funcGetToken',
    size: { width: 100, height: 100 },
    token: '',
    domain: 'http://img.h5huodong.com',
    disabled: false,
    length: length || 9,
    multiple: true,
    defaultValue: base.options.defaultValue ?? [],
    // -
  });

  return base;
}

/** 封装 文件上传 组件 */
function packageFileUpload(onlineField): Recordable {
  let [base, {extendJson}] = getBaseComponent(onlineField, {
    type: 'file-upload',
    className: 'form-file-upload',
    icon: 'icon-shangchuan',
    hideTitle: false,
  });

  // 自定义上传数量
  let length: number | null = null
  if (extendJson?.uploadnum != null) {
    length = Number(extendJson.uploadnum)
  }

  Object.assign(base.options, {
    // -
    drag: false,
    buttonText: '点击上传文件',
    tokenFunc: 'funcGetToken',
    disabled: false,
    length: length || 1,
    multiple: false,
    defaultValue: base.options.defaultValue ?? [],
    token: '',
    // -
  });

  return base;
}

/** 封装 编辑器 组件 */
function packageEditor(onlineField): Recordable {
  let [base] = getBaseComponent(onlineField, {
    type: 'editor',
    className: 'form-editor',
    icon: 'icon-fuwenbenkuang',
    hideTitle: false,
  });

  Object.assign(base.options, {
    // -
    width: '',
    disabled: false,
    // -
  });

  return base;
}

/** 封装 下拉选择 组件 */
function packageSelect(onlineField, options = {}): Recordable {
  let { dictField, dictTable, dictText } = onlineField;
  // 如果是字典表配置，则生成为"table-dict"组件
  if (dictField && dictTable && dictText) {
    return packageTableDictSelect(onlineField, options)
  }
  let hasOptions = false

  // 解析后的扩展配置JSON
  let extendJson = getBaseExtendJson(onlineField);
  if (Array.isArray(extendJson?.options) && extendJson.options.length > 0) {
    hasOptions = true
  }

  // 只生成数据字典的配置，非数据字典的配置生成 input
  if (hasOptions || dictField) {
    let [base, params] = getBaseComponent(onlineField, {
      type: 'select',
      className: 'form-select',
      icon: 'icon-select',
      hideTitle: false,
    });

    Object.assign(
      base.options,
      {
        // -
        options: hasOptions ? extendJson!.options : [{ value: '下拉框1' }, { value: '下拉框2' }, { value: '下拉框3' }],
        filterable: false,
        width: '',
        clearable: false,
        remoteOptions: [],
        showLabel: hasOptions ? !!(extendJson!.options[0].label) : true,
        disabled: false,
        multiple: false,
        props: { value: 'value', label: 'label' },
        remote: hasOptions ? false : 'dict',
        // -
        placeholder: '请选择' + params.name,
        dictCode: hasOptions ? '' : dictField,
      },
      options
    );

    return base;
  } else {
    return packageInput(onlineField);
  }
}

/** 封装 单选 组件 */
function packageRadio(onlineField): Recordable {
  let { dictField, dictTable } = onlineField;

  let hasOptions = false

  // 解析后的扩展配置JSON
  let extendJson = getBaseExtendJson(onlineField);
  if (Array.isArray(extendJson?.options) && extendJson.options.length > 0) {
    hasOptions = true
  }

  // 只生成数据字典的配置，非数据字典的配置生成 input
  if (dictField || hasOptions) {
    // 如果设置了 dictTable，则生成为下拉表字典
    // 因为表单设计器的radio只支持数据字典
    if (dictTable && !hasOptions) {
      return packageTableDictSelect(onlineField);
    }
    let [base, params] = getBaseComponent(onlineField, {
      type: 'radio',
      className: 'form-radio',
      icon: 'icon-radio-active',
      hideTitle: false,
    });

    Object.assign(base.options, {
      // -
      props: { value: 'value', label: 'label' },
      remote: hasOptions ? false : 'dict',
      options: hasOptions ? extendJson!.options : [{ value: '下拉框1' }, { value: '下拉框2' }, { value: '下拉框3' }],
      inline: true,
      showLabel: hasOptions ? !!(extendJson!.options[0].label) : true,
      disabled: false,
      width: '',
      remoteOptions: [],
      // -
      placeholder: '请选择' + params.name,
      dictCode: hasOptions ? '' : dictField,
    });

    return base;
  } else {
    return packageInput(onlineField);
  }
}

/** 封装 多选 组件 */
function packageCheckbox(onlineField): Recordable {
  let { dictField, dictTable, dictText } = onlineField;
  // 如果是字典表配置，则生成为"table-dict"组件
  if (dictField && dictTable && dictText) {
    return packageTableDictSelect(onlineField, {multiple: true})
  }

  let hasOptions = false

  // 解析后的扩展配置JSON
  let extendJson = getBaseExtendJson(onlineField);
  if (Array.isArray(extendJson?.options) && extendJson.options.length > 0) {
    hasOptions = true
  }

  // 只生成数据字典的配置，非数据字典的配置生成 input
  if (dictField || hasOptions) {
    let [base, params] = getBaseComponent(onlineField, {
      type: 'checkbox',
      className: 'form-checkbox',
      icon: 'icon-checkbox',
      hideTitle: false,
    });

    Object.assign(base.options, {
      // -
      props: { value: 'value', label: 'label' },
      remote: hasOptions ? false : 'dict',
      options: hasOptions ? extendJson!.options : [{ value: '下拉框1' }, { value: '下拉框2' }, { value: '下拉框3' }],
      inline: true,
      showLabel: hasOptions ? !!(extendJson!.options[0].label) : true,
      disabled: false,
      width: '',
      remoteOptions: [],
      // -
      placeholder: '请选择' + params.name,
      defaultValue: base.options.defaultValue == null ? [] : base.options.defaultValue,
      dictCode: hasOptions ? '' : dictField,
    });

    return base;
  } else {
    return packageInput(onlineField);
  }
}

/** 封装 省市县联动 组件 */
function packageAreaLinkage(onlineField): Recordable {
  let [base] = getBaseComponent(onlineField, {
    type: 'area-linkage',
    className: 'form-area-linkage',
    icon: 'icon-jilianxuanze',
    hideTitle: false,
  });

  Object.assign(base.options, {
    // -
    width: '',
    disabled: false,
    placeholder: '请选择',
    // -
    areaLevel: 3,
    clearable: true,
  });

  return base;
}

/** 封装 开关 组件 */
function packageSwitch(onlineField): Recordable {
  let [base, {extendJson}] = getBaseComponent(onlineField, {
    type: 'switch',
    className: 'form-switch',
    icon: 'icon-switch',
    hideTitle: false,
  });

  // 取出自定义开关选项
  let switchOptions = extendJson?.switchOptions
  if (!Array.isArray(switchOptions) || switchOptions.length !== 2) {
    switchOptions = ['Y', 'N']
  }

  Object.assign(base.options, {
    // -
    disabled: false,
    activeValue: switchOptions[0],
    inactiveValue: switchOptions[1],
    // -
  });

  return base;
}

/** 封装 Markdown 组件 */
function packageMarkdown(onlineField): Recordable {
  let [base] = getBaseComponent(onlineField, {
    type: 'markdown',
    className: 'form-markdown',
    icon: 'icon-markdown',
    hideTitle: false,
  });

  Object.assign(base.options, {
    // -
    disabled: false,
    // -
  });

  return base;
}

/** 封装 下拉树 组件 */
function packageSelectTree(onlineField): Recordable {
  let [base, params] = getBaseComponent(onlineField, {
    type: 'select-tree',
    className: 'form-select-tree',
    icon: 'icon-tree',
    hideTitle: false,
  });

  Object.assign(base.options, {
    // -
    placeholder: '请选择' + params.name,
    width: '',
    disabled: false,
    multiple: false,
    conf: {
      category: { code: '' },
      table: {
        name: '',
        code: '',
        text: '',
        pidField: '',
        rootPid: '',
      },
      condition: '',
    },
    // -
  });
  let { dictTable, dictField, dictText } = onlineField;
  if (onlineField.fieldShowType === 'cat_tree') {
    // 数据来源，category = 分类字典， table = 数据库表
    base.options.dataFrom = 'category';
    base.options.conf.category.code = dictField;
  } else {
    base.options.dataFrom = 'table';
    let cols = dictText.split(',');
    base.options.conf.table = {
      name: dictTable,
      code: cols[0],
      text: cols[2],
      pidField: cols[1],
      rootPid: dictField,
    };
  }
  return base;
}

/** 封装 地图 组件 */
function packageMap(onlineField: Recordable) {
  let [base, params] = getBaseComponent(onlineField, {
    type: "map",
    className: "form-map",
    icon: "icon-map",
    hideTitle: false,
  });
  Object.assign(base.options, {
    // -
    width: "100%",
    height: "300px",
    zoom: 15,
    point: {
      lng: 116.397467,
      lat: 39.908806
    },
    mapSettings: {
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      keyboard: false,
      inertialDragging: true,
      continuousZoom: true,
      pinchToZoom: true
    },
    mapControls: {
      navigation: true,
      geolocation: true,
      scale: true,
      mapType: true,
      panorama: false,
      overviewMap: false
    },
    // 默认为天安门
    defaultValue: params.defaultValue || "116.397467,39.908806",
    // -
    disabled: false,
  });

  return base;
}

/** 封装 定位 组件 */
function packageLocation(onlineField: Recordable) {
  let [base] = getBaseComponent(onlineField, {
    type: "location",
    className: "form-location",
    icon: "icon-location",
    hideTitle: false,
  });
  Object.assign(base.options, {
    // -
    width: "100%",
    showMap: false,
    showLngLat: false,
    defaultCurrent: false,
    // -
    disabled: false,
  });

  return base;
}

/** 封装 颜色选择器 组件 */
function packageColor(onlineField: Recordable) {
  let [base] = getBaseComponent(onlineField, {
    type: "color",
    className: "form-color",
    icon: "icon-color",
    hideTitle: false,
  });
  Object.assign(base.options, {
    // -
    showAlpha: false,
    // -
    disabled: false,
  });

  return base;
}

/** 封装 评分 组件 */
function packageRate(onlineField: Recordable) {
  let [base] = getBaseComponent(onlineField, {
    type: "rate",
    className: "form-rate",
    icon: "icon-rate",
    hideTitle: false,
  });
  Object.assign(base.options, {
    // -
    max: 5,
    allowHalf: false,
    // -
    disabled: false,
  });

  return base;
}

/** 封装 滑块 组件 */
function packageSlider(onlineField: Recordable) {
  let [base] = getBaseComponent(onlineField, {
    type: "slider",
    className: "form-slider",
    icon: "icon-slider",
    hideTitle: false,
  });

  Object.assign(base.options, {
    // -
    min: 0,
    max: 100,
    step: 1,
    showInput: false,
    showPercent: false,
    range: false,
    width: "",
    // -
    disabled: false,
  });

  return base;
}

/** 封装 子表 组件 */
function packageSubTable(name, subTableName): Recordable {
  return {
    type: 'sub-table-design',
    name: name,
    icon: 'icon-table',
    hideTitle: false,
    class: ['data-j-editable-design'],
    isContainer: true, // 容器组件
    className: 'form-sub-table',
    columns: [
      { span: 12, list: (() => [])() },
      { span: 12, list: (() => [])() },
    ],
    options: {
      gutter: 0,
      columnNumber: 2,
      justify: 'start',
      align: 'top',
      defaultValue: '[]',
      subTableName: subTableName,
      defaultRows: 0,
      showCheckbox: true,
      showNumber: true,
      showRowButton: false,
      allowAdd: true,
      autoHeight: true,
    },
    key: subTableName + '_' + Math.ceil(Math.random() * 99999),
    model: `sub-table-design_${subTableName}`,
    rules: [],
  };
}

/** 封装 Card 组件 */
function packageCard(name, list): Recordable {
  let key = `${Date.now()}_${Math.ceil(Math.random() * 99999)}`;
  return {
    type: 'card',
    name: name,
    className: 'form-card',
    icon: 'icon-card',
    hideTitle: false,
    hideLabel: true,
    isContainer: true,
    list: Array.isArray(list) ? list : [],
    options: {
      width: '100%',
      rowNum: 1,
      hidden: false,
    },
    key: key,
    model: 'card_' + key,
    modelType: 'main',
    rules: [],
    isSubItem: false,
  };
}

/** 封装 AutoGrid 自动布局 */
function packageAutoGrid(list?: any[]) {
  const key = `${Date.now()}_${Math.ceil(Math.random() * 99999)}`;
  return {
    key: key,
    type: 'card',
    isAutoGrid: true,
    isContainer: true,
    list: Array.isArray(list) ? list : [],
    options: {},
    model: 'card' + '_' + key,
  }
}
