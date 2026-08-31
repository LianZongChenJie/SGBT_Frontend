/**
 * 测试的表类型
 * 新增表配置步骤
 * 1.在此集合中添加一条数据 name为表名 title描述
 * 2.添加一个ts文件 按照下面注释的模板配置table fields enhanceFormJs enhanceSql等属性的值 参考 one.single.ts
 * 3.在 useOnlineTest.ts 中 import xxx_config from './data/xxx'
 * 4. useOnlineTest.ts 的 configMap 中声明 xxx_config 名称均为表名加_config
 */
export default [
  /*  { title: '单表全字段测试', name: 'ai_single' },
  { title: '简单订单主表', name: 'ai_easy_main' },
  { title: '简单订单子表', name: 'ai_easy_sub' },
  { title: '商品表', name: 'ai_shop_product' },
  { title: '商品分类表', name: 'ai_shop_category' },
  { title: '商城用户主表', name: 'ai_shop_user' },
  { title: '商城用户订单(子)', name: 'ai_shop_order' },
  { title: '商城用户商家(子)', name: 'ai_shop_business' },*/

  {
    title: '单表@表单控件',
    name: 'ai_control_single',
  },
  {
    title: '单表@表单检验',
    name: 'ai_rules_single',
  },
  {
    title: '单表@表单默认值',
    name: 'ai_defval_single',
  },
  {
    title: '单表@默认查询',
    name: 'ai_query_def_single',
  },
  {
    title: '单表@自定义查询',
    name: 'ai_query_custom_single',
  },
  {
    title: '树表-商品分类',
    name: 'ai_shop_category',
  },
  {
    title: '1主表@表单控件',
    name: 'ai_control_main',
  },
  {
    title: '1一对一子表@表单控件',
    name: 'ai_control_sub_one',
  },
  {
    title: '1一对多子表@表单控件',
    name: 'ai_control_sub',
  },
  {
    title: '2主表@表单默认值',
    name: 'ai_defval_main',
  },
  {
    title: '2一对多子表@表单默认值',
    name: 'ai_defval_sub',
  },
  {
    title: '2一对一子表@表单默认值',
    name: 'ai_defval_subone',
  },
  {
    title: '3主表@表单检验',
    name: 'ai_rules_main',
  },
  {
    title: '3一对一子表@表单检验',
    name: 'ai_rules_sub_one',
  },
  {
    title: '3一对多子表@表单检验',
    name: 'ai_rules_sub',
  },
  {
    title: '4主表@自定义查询',
    name: 'ai_query_custom_main',
  },
  {
    title: '4一对一子表@自定义查询',
    name: 'ai_query_custom_sub_one',
  },
  {
    title: '4一对多子表@自定义查询',
    name: 'ai_query_custom_sub',
  },
  {
    title: '5主表@默认查询',
    name: 'ai_query_def_main',
  },
  {
    title: '5一对一子表@默认查询',
    name: 'ai_query_def_sub_one',
  },
  {
    title: '5一对多子表@默认查询',
    name: 'ai_query_def_sub',
  },
];

/*
// xxx表配置 描述清楚
const table = {}

// 字段
const fields = []

// 表单js增强
const enhanceFormJs = ''

// sql增强
const enhanceSql = ''

// 索引
const indexList = []

// 组合
const tablename_config = {
  table: table,
  fields: fields,
  enhanceFormJs: enhanceFormJs,
  enhanceSql: enhanceSql,
  indexList: indexList
}
export default tablename_config
*/
